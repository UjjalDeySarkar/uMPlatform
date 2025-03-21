import React from 'react';
import { Calendar, Clock } from 'lucide-react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { format } from 'date-fns';
import UserAvatar from './UserAvatar';
import PriorityBadge from './PriorityBadge';

interface TaskProps {
  task: any;
  assignedUser?: any;
  onClick: (task: any) => void;
}

const Task: React.FC<TaskProps> = ({ task, assignedUser, onClick }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 10 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="p-3 bg-white dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow cursor-pointer animate-fade-in"
      onClick={() => onClick(task)}
    >
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-medium text-sm line-clamp-2 dark:text-gray-100">{task.title}</h3>
        <PriorityBadge priority={task.priority} showLabel={false} size="sm" />
      </div>
      
      {task.description && (
        <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
          {task.description}
        </p>
      )}
      
      <div className="flex justify-between items-center mt-auto">
        {assignedUser ? (
          <div className="flex items-center">
            <UserAvatar user={assignedUser} size="sm" />
          </div>
        ) : (
          <div className="w-6" />
        )}
        
        {task.dueDate && (
          <div className="flex items-center text-xs text-muted-foreground">
            <Calendar className="h-3 w-3 mr-1" />
            <span>{format(new Date(task.dueDate), 'MMM d')}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default Task;