import React from 'react';
import { PlusIcon } from 'lucide-react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Column as ColumnType, Task as TaskType, User } from '@/types/kanban';
import Task from './Task';
import { Button } from '@/components/ui/button';

interface ColumnProps {
  column: ColumnType;
  tasks: TaskType[];
  users: User[];
  onTaskClick: (task: TaskType) => void;
  onAddTask: (status: string) => void;
}

const Column: React.FC<ColumnProps> = ({
  column,
  tasks,
  users,
  onTaskClick,
  onAddTask,
}) => {
  const { setNodeRef } = useDroppable({
    id: column.id,
  });
  
  const findUser = (userId?: string) => {
    if (!userId) return undefined;
    return users.find(user => user.id === userId);
  };

  return (
    <div className="kanban-column animate-slide-in">
      <div className="p-3 flex items-center justify-between">
        <div className="flex items-center">
          <h3 className="font-medium text-sm">{column.title}</h3>
          <span className="ml-2 text-xs py-0.5 px-1.5 bg-muted rounded-full">
            {column.taskIds.length}
          </span>
        </div>
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-7 w-7" 
          onClick={() => onAddTask(column.id)}
        >
          <PlusIcon className="h-4 w-4" />
        </Button>
      </div>
      
      <div 
        ref={setNodeRef} 
        className="flex-1 p-2 overflow-y-auto"
      >
        <SortableContext
          items={column.taskIds}
          strategy={verticalListSortingStrategy}
        >
          {tasks.map(task => (
            <Task
              key={task.id}
              task={task}
              assignedUser={findUser(task.assignedUserId)}
              onClick={onTaskClick}
            />
          ))}
        </SortableContext>
        
        {tasks.length === 0 && (
          <div className="h-20 flex items-center justify-center">
            <p className="text-xs text-muted-foreground">No tasks</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Column;
