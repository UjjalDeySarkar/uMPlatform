import { v4 as uuidv4 } from 'uuid';
import { Task, Column, Board, Project, User, Priority } from '@/types/kanban';
import { createClient } from '@/utils/supabase/client';

const supabase = await createClient();

export const boardService = {
  getProjects: async (): Promise<Project[]> => {
    const { data, error } = await supabase.from("projects").select("*");

    if (error) {
      console.error("Error fetching projects:", error);
      return [];
    }

    return data.map((project) => ({
      id: project.id,
      name: project.name,
      description: project.description || "",
      createdAt: project.created_at || new Date().toISOString(),
    }));
  },

  getUsers: async (): Promise<User[]> => {
    const { data, error } = await supabase.from("users").select("*");

    if (error) {
      console.error("Error fetching users:", error);
      return [];
    }

    return data.map((user) => ({
      id: user.id,
      name: user.name || user.display_name || user.email.split('@')[0],
      email: user.email,
    }));
  },

  // Helper to get statuses for a specific project
  getStatuses: async (projectId) => {
    try {
      // Only get statuses that are associated with this project
      const { data: projectStatuses, error: joinError } = await supabase
        .from("project_status")
        .select(`
          status_id,
          status (
            id,
            name,
            color
          )
        `)
        .eq("project_id", projectId);
      
      if (joinError) {
        console.error("Error fetching project statuses:", joinError);
        return [];
      }
      
      // If project has no assigned statuses yet, create default ones
      if (!projectStatuses || projectStatuses.length === 0) {
        return []; // Return empty array, defaults will be created in getBoard
      }
      
      // Return the project's statuses
      return projectStatuses
        .filter(ps => ps.status) // Filter out any null statuses
        .map(ps => ps.status);
    } catch (e) {
      console.error("Error fetching statuses:", e);
      return [];
    }
  },
  
  // Create a new status and assign it to a project
  createStatus: async (name, color = '#E0E0E0', projectId = null) => {
    try {
      // Check if status already exists (case insensitive)
      const { data: existingStatus } = await supabase
        .from("status")
        .select("*")
        .ilike("name", name)
        .maybeSingle();
      
      let statusId;
      let status;
      
      if (existingStatus) {
        statusId = existingStatus.id;
        status = existingStatus;
      } else {
        // Create new status
        const newStatus = {
          id: uuidv4(),
          name,
          color
        };
        
        const { data, error } = await supabase
          .from("status")
          .insert(newStatus)
          .select()
          .single();
        
        if (error) {
          console.error("Error creating status:", error);
          throw error;
        }
        
        statusId = data.id;
        status = data || newStatus;
      }
      
      // If projectId is provided, associate this status with the project
      if (projectId) {
        // Check if association already exists
        const { data: existingAssoc } = await supabase
          .from("project_status")
          .select("*")
          .eq("project_id", projectId)
          .eq("status_id", statusId)
          .maybeSingle();
          
        if (!existingAssoc) {
          // Create association
          const { error: assocError } = await supabase
            .from("project_status")
            .insert({
              project_id: projectId,
              status_id: statusId
            });
            
          if (assocError) {
            console.error("Error associating status with project:", assocError);
          }
        }
      }
      
      return status;
    } catch (e) {
      console.error("Error creating status:", e);
      // Return the input so we don't break the flow
      return { id: uuidv4(), name, color };
    }
  },

  getTasks: async (projectId: string): Promise<Task[]> => {
    try {
      // Get tasks with status info
      const { data: tasks, error } = await supabase
        .from("tasks")
        .select(`
          *,
          status:status_id (
            id,
            name,
            color
          )
        `)
        .eq("project_id", projectId);

      if (error) {
        console.error("Error fetching tasks:", error);
        throw error;
      }
      
      // If joining failed or no tasks, get just the tasks
      if (!tasks || tasks.length === 0) {
        const { data: plainTasks, error: plainError } = await supabase
          .from("tasks")
          .select("*")
          .eq("project_id", projectId);
          
        if (plainError) {
          console.error("Error fetching plain tasks:", plainError);
          return [];
        }
        
        return (plainTasks || []).map(task => {
          let priority: Priority = 'medium';
          if (task.priority === 1) priority = 'low';
          else if (task.priority === 3) priority = 'high';
          
          return {
            id: task.id,
            title: task.title,
            description: task.description,
            status: task.status_id || 'todo', // Use status_id directly if necessary
            priority,
            assignedUserId: task.assignee_id,
            projectId: task.project_id,
            createdAt: task.created_at,
            dueDate: task.duedate,
          };
        });
      }
      
      // Map tasks to frontend format
      return tasks.map(task => {
        let priority: Priority = 'medium';
        if (task.priority === 1) priority = 'low';
        else if (task.priority === 3) priority = 'high';
        
        // Get status - prefer joined status name as is, fall back to status_id
        let status = 'todo';
        if (task.status && task.status.name) {
          status = task.status.name;
        } else if (task.status_id) {
          status = task.status_id;
        }
        
        return {
          id: task.id,
          title: task.title,
          description: task.description,
          status,
          priority,
          assignedUserId: task.assignee_id,
          projectId: task.project_id,
          createdAt: task.created_at,
          dueDate: task.duedate,
        };
      });
    } catch (e) {
      console.error("Error in getTasks:", e);
      return [];
    }
  },

  getBoard: async (projectId: string): Promise<Board> => {
    try {
      // 1. Get project-specific statuses only
      const projectStatuses = await boardService.getStatuses(projectId);
      
      // Don't create default statuses - if there are no statuses, return empty board
      if (!projectStatuses || projectStatuses.length === 0) {
        return {
          columns: {},
          columnOrder: []
        };
      }
      
      // 2. Get all tasks for this project
      const tasks = await boardService.getTasks(projectId);
      
      // 3. Create board structure
      const columns: Record<string, Column> = {};
      const columnOrder: string[] = [];
      
      // Add columns for all existing statuses - using status names as is for column IDs
      for (const status of projectStatuses) {
        // Use the status name directly as the column ID (no conversion)
        const columnId = status.name;
        
        columns[columnId] = {
          id: columnId,
          title: status.name,
          color: status.color,
          taskIds: [],
        };
        
        // Important: columnOrder determines display order
        columnOrder.push(columnId);
      }
      
      // If no columns created (shouldn't happen now), add defaults
      if (columnOrder.length === 0) {
        columns['todo'] = { id: 'todo', title: 'To Do', taskIds: [], color: '#E0E0E0' };
        columnOrder.push('todo');
      }
      
      // 4. Assign tasks to columns
      const firstColumn = columnOrder[0];
      
      tasks.forEach(task => {
        // Find the column for this task's status - use status name as is
        const columnId = task.status;
        
        if (columns[columnId]) {
          // Column exists, add task
          columns[columnId].taskIds.push(task.id);
        } else if (firstColumn) {
          // Status doesn't match any column, add to first column
          columns[firstColumn].taskIds.push(task.id);
        }
      });
      
      return { columns, columnOrder };
    } catch (e) {
      console.error("Error in getBoard:", e);
      
      // Fallback to an empty board - don't create default status
      return {
        columns: {},
        columnOrder: []
      };
    }
  },

  createTask: async (task: Partial<Task>): Promise<Task> => {
    debugger
    try {
      if (!task.projectId) {
        throw new Error('Project ID is required for creating a task');
      }
      
      // First, check if a status is provided
      let statusId = null;
      let statusName = task.status || '';
      
      if (statusName) {
        // Try to find the status in the database
        const { data: existingStatus } = await supabase
          .from("status")
          .select("*")
          .ilike("name", statusName)
          .maybeSingle();
        
        if (existingStatus) {
          statusId = existingStatus.id;
          
          await boardService.associateStatusWithProject(statusId, task.projectId);
        } else {
          throw new Error('Cannot create task: the status is not defined');
        }
      } else {
        const projectStatuses = await boardService.getStatuses(task.projectId);
        
        if (projectStatuses && projectStatuses.length > 0) {
          statusId = projectStatuses[0].id;
          statusName = projectStatuses[0].name;
        } else {
          throw new Error('Cannot create task: project has no statuses defined');
        }
      }
      
      let numericPriority = 2; // Default to medium
      if (task.priority === 'low') numericPriority = 1;
      else if (task.priority === 'high') numericPriority = 3;
      
      const newTask = {
        id: uuidv4(),
        title: task.title || 'New Task',
        description: task.description || '',
        status_id: statusId,
        priority: numericPriority,
        assignee_id: task.assignedUserId,
        project_id: task.projectId,
        duedate: task.dueDate,
        created_at: new Date().toISOString(),
      };
      
      const { data, error } = await supabase
        .from("tasks")
        .insert(newTask)
        .select()
        .single();
      
      if (error) {
        console.error("Error creating task:", error);
        throw error;
      }
      
      // Convert to frontend format
      let priority: Priority = 'medium';
      if (data.priority === 1) priority = 'low';
      else if (data.priority === 3) priority = 'high';
      
      return {
        id: data.id,
        title: data.title,
        description: data.description,
        status: statusName, // Use the status name as-is
        priority,
        assignedUserId: data.assignee_id,
        projectId: data.project_id,
        createdAt: data.created_at,
        dueDate: data.duedate,
      };
    } catch (e) {
      console.error("Error in createTask:", e);
      throw e;
    }
  },

  // Helper to associate a status with a project
  associateStatusWithProject: async (statusId, projectId) => {
    try {
      if (!statusId || !projectId) {
        console.warn("Missing status ID or project ID for association");
        return false;
      }
      
      // Check if association already exists
      const { data: existingAssoc } = await supabase
        .from("project_status")
        .select("*")
        .eq("project_id", projectId)
        .eq("status_id", statusId)
        .maybeSingle();
        
      if (!existingAssoc) {
        // Create association
        const { error } = await supabase
          .from("project_status")
          .insert({
            project_id: projectId,
            status_id: statusId
          });
          
        if (error) {
          console.error("Error creating project_status association:", error);
          return false;
        }
      }
      
      return true;
    } catch (e) {
      console.error("Error associating status with project:", e);
      return false;
    }
  },

  updateTask: async (task: Partial<Task>): Promise<Task> => {
    try {
      if (!task.id) {
        throw new Error('Task ID is required for update');
      }
      
      // Get the current task to get the project ID if not provided
      let projectId = task.projectId;
      if (!projectId) {
        const { data: currentTask } = await supabase
          .from("tasks")
          .select("project_id")
          .eq("id", task.id)
          .single();
          
        if (currentTask) {
          projectId = currentTask.project_id;
        }
      }
      
      // Prepare update data
      const updateData: any = {};
      
      // Basic fields
      if (task.title !== undefined) updateData.title = task.title;
      if (task.description !== undefined) updateData.description = task.description;
      if (task.assignedUserId !== undefined) updateData.assignee_id = task.assignedUserId;
      if (task.dueDate !== undefined) updateData.duedate = task.dueDate;
      
      // Handle priority
      if (task.priority !== undefined) {
        if (task.priority === 'low') updateData.priority = 1;
        else if (task.priority === 'high') updateData.priority = 3;
        else updateData.priority = 2; // medium
      }
      
      // Handle status
      if (task.status !== undefined) {
        // Use the status name exactly as provided
        let statusName = task.status;
        
        // Try to find existing status
        const { data: existingStatus } = await supabase
          .from("status")
          .select("*")
          .ilike("name", statusName)
          .maybeSingle();
        
        if (existingStatus) {
          updateData.status_id = existingStatus.id;
          
          // Associate status with project if we have project ID
          if (projectId) {
            await boardService.associateStatusWithProject(existingStatus.id, projectId);
          }
        } else if (projectId) {
          // Create new status if needed and associate with project
          const newStatus = await boardService.createStatus(statusName, undefined, projectId);
          updateData.status_id = newStatus.id;
        } else {
          // Create status without project association
          const newStatus = await boardService.createStatus(statusName);
          updateData.status_id = newStatus.id;
        }
      }
      
      // Skip update if no changes
      if (Object.keys(updateData).length === 0) {
        // Get current task
        const { data, error } = await supabase
          .from("tasks")
          .select(`
            *,
            status:status_id (
              id,
              name,
              color
            )
          `)
          .eq("id", task.id)
          .single();
        
        if (error) {
          console.error("Error fetching task:", error);
          throw error;
        }
        
        // Convert to frontend format
        let priority: Priority = 'medium';
        if (data.priority === 1) priority = 'low';
        else if (data.priority === 3) priority = 'high';
        
        // Use the status name as-is
        let status = data.status?.name || 'todo';
        
        return {
          id: data.id,
          title: data.title,
          description: data.description,
          status,
          priority,
          assignedUserId: data.assignee_id,
          projectId: data.project_id,
          createdAt: data.created_at,
          dueDate: data.duedate,
        };
      }
      
      // Update task
      const { data, error } = await supabase
        .from("tasks")
        .update(updateData)
        .eq("id", task.id)
        .select(`
          *,
          status:status_id (
            id,
            name,
            color
          )
        `)
        .single();
      
      if (error) {
        console.error("Error updating task:", error);
        throw error;
      }
      
      // Convert to frontend format
      let priority: Priority = 'medium';
      if (data.priority === 1) priority = 'low';
      else if (data.priority === 3) priority = 'high';
      
      // Use the status name as-is
      let status = data.status?.name || task.status || 'todo';
      
      return {
        id: data.id,
        title: data.title,
        description: data.description,
        status,
        priority,
        assignedUserId: data.assignee_id,
        projectId: data.project_id,
        createdAt: data.created_at,
        dueDate: data.duedate,
      };
    } catch (e) {
      console.error("Error in updateTask:", e);
      throw e;
    }
  },

  deleteTask: async (taskId: string): Promise<void> => {
    try {
      const { error } = await supabase
        .from("tasks")
        .delete()
        .eq("id", taskId);
      
      if (error) {
        console.error("Error deleting task:", error);
        throw error;
      }
    } catch (e) {
      console.error("Error in deleteTask:", e);
      throw e;
    }
  },

  updateBoard: async (projectId: string, columns: Record<string, Column>, columnOrder: string[]): Promise<Board> => {
    try {
      // Process each update individually
      const updates = [];
      
      // 1. Ensure all columns exist as statuses and are associated with this project
      for (const columnId in columns) {
        const column = columns[columnId];
        
        // Find or create status
        const statusName = column.title;
        const { data: existingStatus } = await supabase
          .from("status")
          .select("*")
          .ilike("name", statusName)
          .maybeSingle();
        
        let statusId;
        if (existingStatus) {
          statusId = existingStatus.id;
          
          // Update color if different
          if (column.color && column.color !== existingStatus.color) {
            await supabase
              .from("status")
              .update({ color: column.color })
              .eq("id", statusId);
          }
          
          // Ensure status is associated with this project
          await boardService.associateStatusWithProject(statusId, projectId);
        } else {
          // Create new status and associate with project
          const newStatus = await boardService.createStatus(statusName, column.color, projectId);
          statusId = newStatus.id;
        }
        
        // 2. Update task statuses
        for (const taskId of column.taskIds || []) {
          const update = supabase
            .from("tasks")
            .update({ status_id: statusId })
            .eq("id", taskId);
          
          updates.push(update);
        }
      }
      
      // Execute all updates
      await Promise.all(updates);
      
      // Slight delay to ensure database consistency
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Get the updated board to ensure we have the latest state
      return boardService.getBoard(projectId);
    } catch (e) {
      console.error("Error in updateBoard:", e);
      // Return the input to avoid breaking the UI
      return { columns, columnOrder };
    }
  }
};