export type Priority = 'low' | 'medium' | 'high';
type RGB = `rgb(${number}, ${number}, ${number})`;
type RGBA = `rgba(${number}, ${number}, ${number}, ${number})`;
type HEX = `#${string}`;

type Color = RGB | RGBA | HEX

export interface User {
  id: string;
  name: string;
  avatar?: string;
  email: string;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: string;
  priority: Priority;
  assignedUserId?: string;
  projectId: string;
  createdAt: string;
  dueDate?: string;
}

export interface Column {
  id: string;
  title: string;
  color?: Color;
  taskIds: string[];
}

export interface Board {
  columns: {
    [key: string]: Column;
  };
  columnOrder: string[];
}
