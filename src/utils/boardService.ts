import { v4 as uuidv4 } from 'uuid';
import { Task, Column, Board, Project, User, Priority } from '@/types/kanban';
import { createClient } from '@/utils/supabase/client';

const supabase = await createClient();

// Mock data - replace with actual API calls to Supabase in production
const MOCK_USERS: User[] = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'jane@example.com',
  },
  {
    id: '3',
    name: 'Alex Johnson',
    email: 'alex@example.com',
  }
];

let projectSet: Project[] = [];

// Fetch projects from Supabase and update projectSet
const fetchProjectsFromSupabase = async () => {
  const { data, error } = await supabase.from("projects").select("*");

  if (error) {
    console.error("Error fetching projects:", error);
    return [];
  }

  projectSet = data.map((project) => ({
    id: project.id,
    name: project.name,
    description: project.description || "",
    createdAt: project.created_at || new Date().toISOString(),
  }));

  return projectSet;
};

const MOCK_TASKS: Task[] = [
  {
    id: '1',
    title: 'Design Home Page',
    description: 'Create wireframes for the home page',
    status: 'todo',
    priority: 'high',
    assignedUserId: '1',
    projectId: '492c3906-a20c-46ed-83e7-22e9bbcfbd63',
    createdAt: new Date().toISOString(),
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '2',
    title: 'Implement User Authentication',
    description: 'Set up user login and registration',
    status: 'inProgress',
    priority: 'medium',
    assignedUserId: '2',
    projectId: '492c3906-a20c-46ed-83e7-22e9bbcfbd63',
    createdAt: new Date().toISOString(),
  },
  {
    id: '3',
    title: 'Database Schema Design',
    description: 'Design the database schema for the project',
    status: 'review',
    priority: 'low',
    assignedUserId: '3',
    projectId: '492c3906-a20c-46ed-83e7-22e9bbcfbd63',
    createdAt: new Date().toISOString(),
  },
  {
    id: '4',
    title: 'UI Design for App',
    description: 'Create mockups for the mobile app',
    status: 'todo',
    priority: 'medium',
    assignedUserId: '2',
    projectId: '2',
    createdAt: new Date().toISOString(),
  },
  {
    id: '5',
    title: 'Backend API Development',
    description: 'Implement RESTful API endpoints',
    status: 'inProgress',
    priority: 'high',
    assignedUserId: '1',
    projectId: '2',
    createdAt: new Date().toISOString(),
  },
];

const DEFAULT_BOARD: Board = {
  columns: {
    'todo': {
      id: 'todo',
      title: 'To Do',
      taskIds: MOCK_TASKS.filter(task => task.status === 'todo').map(task => task.id),
    },
    'inProgress': {
      id: 'inProgress',
      title: 'In Progress',
      taskIds: MOCK_TASKS.filter(task => task.status === 'inProgress').map(task => task.id),
    },
    'review': {
      id: 'review',
      title: 'Review',
      taskIds: MOCK_TASKS.filter(task => task.status === 'review').map(task => task.id),
    },
    'done': {
      id: 'done',
      title: 'Done',
      taskIds: MOCK_TASKS.filter(task => task.status === 'done').map(task => task.id),
    },
  },
  columnOrder: ['todo', 'inProgress', 'review', 'done'],
};

// In memory storage - replace with Supabase in production
let tasks = [...MOCK_TASKS];
let projects = [...projectSet];
let users = [...MOCK_USERS];
let boards: Record<string, Board> = {
  '1': DEFAULT_BOARD,
  '2': {
    ...DEFAULT_BOARD,
    columns: {
      ...DEFAULT_BOARD.columns,
      'todo': {
        ...DEFAULT_BOARD.columns.todo,
        taskIds: MOCK_TASKS.filter(task => task.status === 'todo' && task.projectId === '2').map(task => task.id),
      },
      'inProgress': {
        ...DEFAULT_BOARD.columns.inProgress,
        taskIds: MOCK_TASKS.filter(task => task.status === 'inProgress' && task.projectId === '2').map(task => task.id),
      },
      'review': {
        ...DEFAULT_BOARD.columns.review,
        taskIds: MOCK_TASKS.filter(task => task.status === 'review' && task.projectId === '2').map(task => task.id),
      },
      'done': {
        ...DEFAULT_BOARD.columns.done,
        taskIds: MOCK_TASKS.filter(task => task.status === 'done' && task.projectId === '2').map(task => task.id),
      },
    },
  },
};

// Board service
export const boardService = {
  getProjects: async (): Promise<Project[]> => {
    return fetchProjectsFromSupabase(); 
  },

  getUsers: async (): Promise<User[]> => {
    // Simulate API call
    return new Promise((resolve) => {
      setTimeout(() => resolve(users), 300);
    });
  },

  getTasks: async (projectId: string): Promise<Task[]> => {
    // Simulate API call
    return new Promise((resolve) => {
      setTimeout(() => {
        debugger
        const projectTasks = tasks.filter(task => task.projectId === projectId);
        resolve(projectTasks);
      }, 300);
    });
  },

  getBoard: async (projectId: string): Promise<Board> => {
    // Simulate API call
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const board = boards[projectId];
        if (board) {
          resolve(board);
        } else {
          // If no board exists, create a default one
          const defaultBoard: Board = {
            columns: {
              'todo': {
                id: 'todo',
                title: 'To Do',
                taskIds: [],
              },
              'inProgress': {
                id: 'inProgress',
                title: 'In Progress',
                taskIds: [],
              },
              'review': {
                id: 'review',
                title: 'Review',
                taskIds: [],
              },
              'done': {
                id: 'done',
                title: 'Done',
                taskIds: [],
              },
            },
            columnOrder: ['todo', 'inProgress', 'review', 'done'],
          };
          boards[projectId] = defaultBoard;
          resolve(defaultBoard);
        }
      }, 300);
    });
  },

  createTask: async (task: Partial<Task>): Promise<Task> => {
    // Simulate API call
    return new Promise((resolve) => {
      setTimeout(() => {
        const newTask: Task = {
          id: uuidv4(),
          title: task.title || 'New Task',
          description: task.description,
          status: task.status || 'todo',
          priority: task.priority || 'medium',
          assignedUserId: task.assignedUserId,
          projectId: task.projectId || '',
          createdAt: new Date().toISOString(),
          dueDate: task.dueDate,
        };

        tasks.push(newTask);

        // Update board
        const board = boards[newTask.projectId];
        if (board) {
          const column = board.columns[newTask.status];
          if (column) {
            column.taskIds.push(newTask.id);
          }
        }

        resolve(newTask);
      }, 300);
    });
  },

  updateTask: async (task: Partial<Task>): Promise<Task> => {
    // Simulate API call
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const index = tasks.findIndex(t => t.id === task.id);
        if (index !== -1) {
          const oldTask = tasks[index];
          const updatedTask = { ...oldTask, ...task };
          tasks[index] = updatedTask;

          // If status changed, update board
          if (task.status && oldTask.status !== task.status) {
            const board = boards[oldTask.projectId];
            if (board) {
              // Remove from old column
              const oldColumn = board.columns[oldTask.status];
              if (oldColumn) {
                oldColumn.taskIds = oldColumn.taskIds.filter(id => id !== task.id);
              }

              // Add to new column
              const newColumn = board.columns[task.status];
              if (newColumn) {
                newColumn.taskIds.push(task.id as string);
              }
            }
          }

          resolve(updatedTask);
        } else {
          reject(new Error('Task not found'));
        }
      }, 300);
    });
  },

  deleteTask: async (taskId: string): Promise<void> => {
    // Simulate API call
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const index = tasks.findIndex(t => t.id === taskId);
        if (index !== -1) {
          const task = tasks[index];

          // Remove task from board
          const board = boards[task.projectId];
          if (board) {
            const column = board.columns[task.status];
            if (column) {
              column.taskIds = column.taskIds.filter(id => id !== taskId);
            }
          }

          // Remove task from list
          tasks.splice(index, 1);
          resolve();
        } else {
          reject(new Error('Task not found'));
        }
      }, 300);
    });
  },

  updateBoard: async (projectId: string, columns: Record<string, Column>, columnOrder: string[]): Promise<Board> => {
    // Simulate API call
    return new Promise((resolve) => {
      setTimeout(() => {
        const updatedBoard: Board = {
          columns,
          columnOrder,
        };
        boards[projectId] = updatedBoard;
        resolve(updatedBoard);
      }, 300);
    });
  },
};
