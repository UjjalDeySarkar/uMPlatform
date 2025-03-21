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

  // Helper to get all statuses
  getStatuses: async () => {
    try {
      const { data, error } = await supabase.from("status").select("*");
      
      if (error) {
        console.error("Error fetching statuses:", error);
        return [];
      }
      
      return data || [];
    } catch (e) {
      console.error("Error fetching statuses:", e);
      return [];
    }
  },
  
  // Create a new status
  createStatus: async (name, color = '#E0E0E0') => {
    try {
      // Check if status already exists (case insensitive)
      const { data: existingStatus } = await supabase
        .from("status")
        .select("*")
        .ilike("name", name)
        .maybeSingle();
      
      if (existingStatus) {
        return existingStatus;
      }
      
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
      
      return data || newStatus;
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
        
        // Get status - prefer joined status, fall back to status_id
        let status = 'todo';
        if (task.status && task.status.name) {
          status = task.status.name.toLowerCase().replace(/\s+/g, '');
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
      // 1. Get all statuses
      const allStatuses = await boardService.getStatuses();
      
      // Create default statuses if none exist
      if (!allStatuses || allStatuses.length === 0) {
        const defaultStatuses = [
          { name: 'To Do', color: '#E0E0E0' },
          { name: 'In Progress', color: '#90CAF9' },
          { name: 'Review', color: '#FFD54F' },
          { name: 'Done', color: '#A5D6A7' }
        ];
        
        for (const status of defaultStatuses) {
          await boardService.createStatus(status.name, status.color);
        }
        
        // Get statuses again after creating defaults
        return boardService.getBoard(projectId);
      }
      
      // 2. Get all tasks for this project
      const tasks = await boardService.getTasks(projectId);
      
      // 3. Create board structure
      const columns: Record<string, Column> = {};
      const columnOrder: string[] = [];
      
      // Add columns for all existing statuses
      for (const status of allStatuses) {
        const columnId = status.name.toLowerCase().replace(/\s+/g, '');
        
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
        // Find the column for this task's status
        const columnId = task.status.toLowerCase().replace(/\s+/g, '');
        
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
      
      // Fallback to a minimal board
      return {
        columns: {
          'todo': { id: 'todo', title: 'To Do', taskIds: [], color: '#E0E0E0' },
        },
        columnOrder: ['todo']
      };
    }
  },

  createTask: async (task: Partial<Task>): Promise<Task> => {
    try {
      // First, make sure we have a status for this task
      let statusId = null;
      let statusName = task.status || 'todo';
      
      // Try to find the status in the database
      const { data: existingStatus } = await supabase
        .from("status")
        .select("*")
        .eq("name", statusName)
        .maybeSingle();
      
      if (existingStatus) {
        statusId = existingStatus.id;
      } else {
        // Status doesn't exist, create it
        const newStatus = await boardService.createStatus(statusName);
        statusId = newStatus.id;
      }
      
      // Convert priority
      let numericPriority = 2; // Default to medium
      if (task.priority === 'low') numericPriority = 1;
      else if (task.priority === 'high') numericPriority = 3;
      
      // Create task
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
        status: statusName.toLowerCase().replace(/\s+/g, ''),
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

  updateTask: async (task: Partial<Task>): Promise<Task> => {
    try {
      if (!task.id) {
        throw new Error('Task ID is required for update');
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
        // Get original status name (before normalization)
        let statusName = task.status;
        
        // If it's a normalized status (e.g., "inprogress"), convert to proper name
        if (task.status === 'inprogress') statusName = 'In Progress';
        else if (task.status === 'todo') statusName = 'To Do';
        
        // Try to find existing status
        const { data: existingStatus } = await supabase
          .from("status")
          .select("*")
          .ilike("name", statusName)
          .maybeSingle();
        
        if (existingStatus) {
          updateData.status_id = existingStatus.id;
        } else {
          // Create new status if needed
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
        
        let status = data.status?.name?.toLowerCase().replace(/\s+/g, '') || 'todo';
        
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
      
      let status = data.status?.name?.toLowerCase().replace(/\s+/g, '') || task.status || 'todo';
      
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
      
      // 1. Ensure all columns exist as statuses
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
        } else {
          // Create new status
          const newStatus = await boardService.createStatus(statusName, column.color);
          statusId = newStatus.id;
        }
        
        // 2. Update task statuses
        for (const taskId of column.taskIds || []) {
          const update = supabase
            .from("tasks")
            .update({ status_id: statusId })
            .eq("id", taskId)
            .eq("project_id", projectId);
          
          updates.push(update);
        }
      }
      
      // Execute all updates
      await Promise.all(updates);
      
      return { columns, columnOrder };
    } catch (e) {
      console.error("Error in updateBoard:", e);
      // Return the input to avoid breaking the UI
      return { columns, columnOrder };
    }
  }
};