import React from 'react';
import { Calendar, Clock, X } from 'lucide-react';
import { format } from 'date-fns';
import { Task, User } from '@/types/kanban';
import PriorityBadge from './PriorityBadge';
import UserAvatar from './UserAvatar';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface TaskDetailProps {
  task: Task | null;
  open: boolean;
  users: User[];
  onOpenChange: (open: boolean) => void;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
}

const TaskDetail: React.FC<TaskDetailProps> = ({
  task,
  open,
  users,
  onOpenChange,
  onEdit,
  onDelete,
}) => {
  if (!task) return null;
  
  const assignedUser = task.assignedUserId 
    ? users.find(user => user.id === task.assignedUserId) 
    : undefined;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-start justify-between mb-2">
            <DialogTitle>{task.title}</DialogTitle>
            <PriorityBadge priority={task.priority} />
          </div>
        </DialogHeader>
        
        <div className="space-y-4">
          {task.description && (
            <div>
              <p className="text-sm text-muted-foreground whitespace-pre-line">
                {task.description}
              </p>
            </div>
          )}
          
          <div className="flex flex-col space-y-3">
            {assignedUser && (
              <div className="flex items-center">
                <span className="text-xs text-muted-foreground w-20">Assigned to</span>
                <div className="flex items-center">
                  <UserAvatar user={assignedUser} size="sm" />
                  <span className="ml-2 text-sm">{assignedUser.name}</span>
                </div>
              </div>
            )}
            
            {task.createdAt && (
              <div className="flex items-center">
                <span className="text-xs text-muted-foreground w-20">Created</span>
                <div className="flex items-center">
                  <Clock className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
                  <span className="text-sm">
                    {format(new Date(task.createdAt), 'MMM d, yyyy')}
                  </span>
                </div>
              </div>
            )}
            
            {task.dueDate && (
              <div className="flex items-center">
                <span className="text-xs text-muted-foreground w-20">Due date</span>
                <div className="flex items-center">
                  <Calendar className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
                  <span className="text-sm">
                    {format(new Date(task.dueDate), 'MMM d, yyyy')}
                  </span>
                </div>
              </div>
            )}
          </div>
          
          <div className="flex items-center justify-end space-x-2 pt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDelete(task.id)}
              className="text-destructive hover:text-destructive"
            >
              Delete
            </Button>
            <Button
              size="sm"
              onClick={() => onEdit(task)}
            >
              Edit Task
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TaskDetail;
