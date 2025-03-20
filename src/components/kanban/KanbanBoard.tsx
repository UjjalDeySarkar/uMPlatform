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
import { User, Column as ColumnType } from '@/types/kanban';
import Column from './Column';
import SearchBar from './SearchBar';
import FilterMenu from './FilterMenu';
import TaskDetail from './TaskDetail';
import TaskForm from './TaskForm';
import Task from './Task';
import ColumnAddButton from './ColumnAddButton';
import { PlusIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface KanbanBoardProps {
  projectId: string;
  columns: Record<string, ColumnType>;
  columnOrder: string[];
  tasks: any[]; // Changed from Task[] to any[]
  users: User[];
  onTaskCreate: (task: Partial<any>) => void;
  onTaskUpdate: (task: Partial<any>) => void;
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
  const handleTaskClick = (task: any) => {
    setActiveTask(task);
    setTaskDetailOpen(true);
  };

  // Task form handlers
  const handleNewTask = (status: string) => {
    setEditingTask(null);
    setInitialTaskStatus(status);
    setTaskFormOpen(true);
  };

  const handleEditTask = (task: any) => {
    setEditingTask(task);
    setTaskDetailOpen(false);
    setTaskFormOpen(true);
  };
  
  const handleDeleteTask = (task: any) => {
    onTaskDelete(task);
    setTaskDetailOpen(false);
  }

  const handleSaveTask = (task: Partial<any>) => {
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

  // Column handlers
  const handleAddColumn = (columnName: string, columnColor: string) => {
    // Generate a new column ID (using the column name as the ID, converted to kebab-case)
    const columnId = columnName.toLowerCase().replace(/\s+/g, '-');
    
    // Check if column ID already exists
    if (columns[columnId]) {
      // In a real app, you'd want to show an error message
      console.error(`Column with ID '${columnId}' already exists`);
      return;
    }
    
    // Create new column
    const newColumn: ColumnType = {
      id: columnId,
      title: columnName,
      taskIds: [],
      color: columnColor
    };
    
    // Update the columns object and column order
    const updatedColumns = {
      ...columns,
      [columnId]: newColumn,
    };
    
    const updatedColumnOrder = [...columnOrder, columnId];
    
    // Update the board
    onBoardUpdate(updatedColumns, updatedColumnOrder);
    toast.success('successfully added new status')
  };
  
  // Handle column deletion
  const handleDeleteColumn = (columnId: string) => {
    // Get tasks in this column
    const tasksInColumn = columns[columnId].taskIds;
    
    // Create updated columns without the deleted column
    const { [columnId]: deletedColumn, ...updatedColumns } = columns;
    
    // Remove column from column order
    const updatedColumnOrder = columnOrder.filter(id => id !== columnId);
    
    // If there are tasks in the column and at least one other column exists
    if (tasksInColumn.length > 0 && updatedColumnOrder.length > 0) {
      // Move tasks to the first available column
      const targetColumnId = updatedColumnOrder[0];
      updatedColumns[targetColumnId] = {
        ...updatedColumns[targetColumnId],
        taskIds: [...updatedColumns[targetColumnId].taskIds, ...tasksInColumn]
      };
      
      // Update tasks status
      tasksInColumn.forEach(taskId => {
        const task = tasks.find(t => t.id === taskId);
        if (task) {
          onTaskUpdate({
            id: taskId,
            status: targetColumnId
          });
        }
      });
    }
    
    // Update the board
    onBoardUpdate(updatedColumns, updatedColumnOrder);
    toast.warning('status deleted')
  };

  // DnD handlers
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const activeTask = tasks.find(task => task.id === active.id);
    
    if (activeTask) {
      setActiveId(active.id as string);
      setActiveTask(activeTask);
    }
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    // Find the active task
    const activeTask = tasks.find(task => task.id === activeId);
    if (!activeTask) return;

    // Find the source column
    const sourceColumn = Object.values(columns).find(
      col => col.taskIds.includes(activeId)
    );
    if (!sourceColumn) return;

    // If over a column directly
    if (Object.keys(columns).includes(overId)) {
      const destinationColumn = columns[overId];
      
      // Skip if same column and task is already at the end
      if (sourceColumn.id === destinationColumn.id && 
          sourceColumn.taskIds.indexOf(activeId) === sourceColumn.taskIds.length - 1) {
        return;
      }
      
      // Update columns
      const updatedColumns = { ...columns };
      
      // Remove from source
      updatedColumns[sourceColumn.id] = {
        ...sourceColumn,
        taskIds: sourceColumn.taskIds.filter(id => id !== activeId)
      };
      
      // Add to destination
      updatedColumns[overId] = {
        ...destinationColumn,
        taskIds: [...destinationColumn.taskIds, activeId]
      };
      
      // Update board
      onBoardUpdate(updatedColumns, columnOrder);
      
      // Update task status
      if (sourceColumn.id !== destinationColumn.id) {
        onTaskUpdate({
          id: activeId,
          status: destinationColumn.id
        });
      }
      
      return;
    }
    
    // Handle task over task scenario
    const overTask = tasks.find(task => task.id === overId);
    if (!overTask) return;
    
    const destinationColumnId = overTask.status;
    const destinationColumn = columns[destinationColumnId];
    
    // Skip if same column and adjacent tasks
    const sourceIndex = sourceColumn.taskIds.indexOf(activeId);
    const destinationIndex = destinationColumn.taskIds.indexOf(overId);
    
    if (
      sourceColumn.id === destinationColumn.id &&
      (sourceIndex === destinationIndex || sourceIndex === destinationIndex - 1)
    ) {
      return;
    }
    
    const updatedColumns = { ...columns };
    
    // Remove from source column
    updatedColumns[sourceColumn.id] = {
      ...sourceColumn,
      taskIds: sourceColumn.taskIds.filter(id => id !== activeId)
    };
    
    // Create new taskIds array for destination
    const newTaskIds = [...destinationColumn.taskIds];
    
    // If same column, need to handle the reordering differently
    if (sourceColumn.id === destinationColumn.id && sourceIndex < destinationIndex) {
      newTaskIds.splice(destinationIndex, 0, activeId);
    } else {
      newTaskIds.splice(destinationIndex, 0, activeId);
    }
    
    // Update destination column
    updatedColumns[destinationColumn.id] = {
      ...destinationColumn,
      taskIds: newTaskIds
    };
    
    // Update the board
    onBoardUpdate(updatedColumns, columnOrder);
    
    // Update task status if moved to a different column
    if (sourceColumn.id !== destinationColumn.id) {
      onTaskUpdate({
        id: activeId,
        status: destinationColumn.id
      });
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
          <div className="h-full overflow-x-auto overflow-y-hidden pb-4">
            <div className="flex h-full gap-4 pr-4">
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
                      onDeleteColumn={handleDeleteColumn}
                    />
                  );
                })}
              </SortableContext>
              
              {/* Add Column Button */}
              <ColumnAddButton onColumnAdd={handleAddColumn} />
            </div>
          </div>
          
          <DragOverlay>
            {activeId && activeTask && (
              <Task
                task={activeTask}
                assignedUser={users.find(u => u.id === activeTask.assignedUserId)}
                onClick={() => {}}
              />
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
        onDelete={handleDeleteTask}
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