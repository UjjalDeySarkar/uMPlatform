import React from 'react';
import { User, Column as ColumnType } from '@/types/kanban';
import { PlusIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Task from './Task';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import ColumnMenu from './ColumnMenu'; // Import the ColumnMenu component

interface ColumnProps {
  column: ColumnType;
  tasks: any[];
  users: User[];
  onTaskClick: (task: any) => void;
  onAddTask: (status: string) => void;
  onDeleteColumn: (columnId: string) => void; // Make sure this is required
}

const Column: React.FC<ColumnProps> = ({
  column,
  tasks,
  users,
  onTaskClick,
  onAddTask,
  onDeleteColumn,
}) => {
  // Make the column sortable
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({
    id: column.id,
    data: {
      type: 'column',
      column,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="h-full flex-shrink-0 flex flex-col bg-white rounded-md shadow-sm min-w-[280px] w-[280px] border border-gray-200"
    >
      {/* Column Header */}
      <div className="flex items-center justify-between p-3 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <div 
            className="w-3 h-3 rounded-full" 
            style={{ 
              backgroundColor: column.color || 
              (column.title === "Not Started" ? "#ef4444" : 
               column.title === "In Progress" ? "#3b82f6" : 
               column.title === "Done" ? "#10b981" : "#9ca3af") 
            }}
          />
          <h3 className="font-medium text-sm">{column.title}</h3>
          <span className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full">
            {tasks.length}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0 hover:bg-gray-100"
            onClick={() => onAddTask(column.id)}
          >
            <PlusIcon className="h-4 w-4" />
          </Button>
          {/* Replace delete button with ColumnMenu */}
          <ColumnMenu 
            columnId={column.id} 
            onDeleteColumn={onDeleteColumn} 
          />
        </div>
      </div>

      {/* Column Content - Scrollable Task List */}
      <div 
        className="flex-1 overflow-y-auto p-2 space-y-2"
        data-column-id={column.id}
      >
        {tasks.length > 0 ? (
          tasks.map((task) => {
            const assignedUser = users.find(user => user.id === task.assignedUserId);
            return (
              <Task
                key={task.id}
                task={task}
                assignedUser={assignedUser}
                onClick={onTaskClick}
              />
            );
          })
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-sm text-gray-400">No tasks</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Column;