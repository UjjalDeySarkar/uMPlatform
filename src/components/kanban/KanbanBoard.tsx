import React, { useState } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { arrayMove, SortableContext } from '@dnd-kit/sortable';
import { Task, User, Column as ColumnType } from '@/types/kanban';
import Column from './Column';
import SearchBar from './SearchBar';
import FilterMenu from './FilterMenu';
import TaskDetail from './TaskDetail';
import TaskForm from './TaskForm';
import { PlusIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface KanbanBoardProps {
  projectId: string;
  columns: Record<string, ColumnType>;
  columnOrder: string[];
  tasks: Task[];
  users: User[];
  onTaskCreate: (task: Partial<Task>) => void;
  onTaskUpdate: (task: Partial<Task>) => void;
  onTaskDelete: (taskId: string) => void;
  onBoardUpdate: (columns: Record<string, ColumnType>, columnOrder: string[]) => void;
}

const KanbanBoard: React.FC<KanbanBoardProps> = ({
  projectId,
  columns,
  columnOrder,
  tasks,
  users,
  onTaskCreate,
  onTaskUpdate,
  onTaskDelete,
  onBoardUpdate,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPriority, setSelectedPriority] = useState<'low' | 'medium' | 'high' | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [taskDetailOpen, setTaskDetailOpen] = useState(false);
  const [taskFormOpen, setTaskFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [initialTaskStatus, setInitialTaskStatus] = useState<string>('');

  // DnD
  const [activeId, setActiveId] = useState<string | null>(null);
  
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    })
  );

  // Filter tasks
  const filteredTasks = tasks.filter((task) => {
    // Filter by search query
    const matchesSearch = 
      !searchQuery ||
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (task.description || '').toLowerCase().includes(searchQuery.toLowerCase());
    
    // Filter by priority
    const matchesPriority = !selectedPriority || task.priority === selectedPriority;
    
    // Filter by assigned user
    const matchesUser = !selectedUser || task.assignedUserId === selectedUser.id;
    
    return matchesSearch && matchesPriority && matchesUser;
  });

  // Reset filters
  const handleResetFilters = () => {
    setSelectedPriority(null);
    setSelectedUser(null);
  };

  // Task detail handlers
  const handleTaskClick = (task: Task) => {
    setActiveTask(task);
    setTaskDetailOpen(true);
  };

  // Task form handlers
  const handleNewTask = (status: string) => {
    setEditingTask(null);
    setInitialTaskStatus(status);
    setTaskFormOpen(true);
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setTaskDetailOpen(false);
    setTaskFormOpen(true);
  };

  const handleSaveTask = (task: Partial<Task>) => {
    if (editingTask) {
      onTaskUpdate(task);
    } else {
      const newTask = {
        ...task,
        status: initialTaskStatus,
        projectId: projectId,
      };
      onTaskCreate(newTask);
    }
  };

  // DnD handlers
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    setActiveId(active.id as string);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    // If the task is dropped in the same column, do nothing
    const activeTask = tasks.find(task => task.id === activeId);
    if (!activeTask) return;

    // Find the column the task is currently in
    const activeColumn = Object.values(columns).find(col => 
      col.taskIds.includes(activeId)
    );
    if (!activeColumn) return;

    // Check if over a column
    const isOverColumn = Object.keys(columns).includes(overId);
    if (isOverColumn) {
      // If over a different column, move the task to the new column
      if (activeColumn.id !== overId) {
        const updatedColumns = { ...columns };
        
        // Remove from source column
        updatedColumns[activeColumn.id] = {
          ...activeColumn,
          taskIds: activeColumn.taskIds.filter(id => id !== activeId),
        };
        
        // Add to destination column
        updatedColumns[overId] = {
          ...columns[overId],
          taskIds: [...columns[overId].taskIds, activeId],
        };
        
        onBoardUpdate(updatedColumns, columnOrder);
        
        // Update task status
        onTaskUpdate({
          id: activeId,
          status: overId,
        });
      }
    } else {
      // Task over task - reorder in the same column
      const overTask = tasks.find(task => task.id === overId);
      if (!overTask) return;
      
      const overColumn = Object.values(columns).find(col => 
        col.taskIds.includes(overId)
      );
      if (!overColumn) return;
      
      // If tasks are in the same column, reorder
      if (activeColumn.id === overColumn.id) {
        const oldIndex = activeColumn.taskIds.indexOf(activeId);
        const newIndex = overColumn.taskIds.indexOf(overId);
        
        const updatedColumns = { ...columns };
        updatedColumns[activeColumn.id] = {
          ...activeColumn,
          taskIds: arrayMove(activeColumn.taskIds, oldIndex, newIndex),
        };
        
        onBoardUpdate(updatedColumns, columnOrder);
      } else {
        // Moving to different column at specific position
        const updatedColumns = { ...columns };
        
        // Remove from source column
        updatedColumns[activeColumn.id] = {
          ...activeColumn,
          taskIds: activeColumn.taskIds.filter(id => id !== activeId),
        };
        
        // Add to destination column at specific position
        const overIndex = overColumn.taskIds.indexOf(overId);
        const newTaskIds = [...overColumn.taskIds];
        newTaskIds.splice(overIndex, 0, activeId);
        
        updatedColumns[overColumn.id] = {
          ...overColumn,
          taskIds: newTaskIds,
        };
        
        onBoardUpdate(updatedColumns, columnOrder);
        
        // Update task status
        onTaskUpdate({
          id: activeId,
          status: overColumn.id,
        });
      }
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveId(null);
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex flex-col md:flex-row justify-between gap-3 mb-4">
        <div className="w-full md:w-60">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search tasks..."
          />
        </div>

        <div className="flex space-x-2">
          <FilterMenu
            users={users}
            selectedPriority={selectedPriority}
            selectedUser={selectedUser}
            onPriorityChange={setSelectedPriority}
            onUserChange={setSelectedUser}
            onReset={handleResetFilters}
          />
          
          <Button 
            size="sm" 
            className="h-9"
            onClick={() => handleNewTask(columnOrder[0])}
          >
            <PlusIcon className="h-4 w-4 mr-1.5" />
            Add Task
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        <DndContext
          sensors={sensors}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          <div className="h-full overflow-x-auto overflow-y-hidden flex gap-4 pb-4">
            <SortableContext items={columnOrder}>
              {columnOrder.map(columnId => {
                const column = columns[columnId];
                const columnTasks = filteredTasks.filter(
                  task => column.taskIds.includes(task.id)
                );
                
                return (
                  <Column
                    key={column.id}
                    column={column}
                    tasks={columnTasks}
                    users={users}
                    onTaskClick={handleTaskClick}
                    onAddTask={handleNewTask}
                  />
                );
              })}
            </SortableContext>
          </div>
          
          <DragOverlay>
            {activeId && (
              <div className="task-card opacity-80">
                {tasks.find(task => task.id === activeId)?.title}
              </div>
            )}
          </DragOverlay>
        </DndContext>
      </div>

      <TaskDetail
        task={activeTask}
        open={taskDetailOpen}
        users={users}
        onOpenChange={setTaskDetailOpen}
        onEdit={handleEditTask}
        onDelete={onTaskDelete}
      />

      <TaskForm
        open={taskFormOpen}
        task={editingTask}
        statuses={columnOrder}
        users={users}
        projectId={projectId}
        onOpenChange={setTaskFormOpen}
        onSave={handleSaveTask}
      />
    </div>
  );
};

export default KanbanBoard;
