'use client'
import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Layout from '@/components/kanban/Layout';
import KanbanBoard from '@/components/kanban/KanbanBoard';
import { boardService } from '@/utils/boardService';
import { Project, Task, User, Column, Board } from '@/types/kanban';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { toast } from "sonner";

const ProjectPage: React.FC = () => {
  const router = useRouter();
  const params = useParams(); 
  const projectId = params?.projectId as string; 

  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [board, setBoard] = useState<Board | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      if (!projectId) return;
      try {
        setLoading(true);

        const [projectsData, tasksData, usersData, boardData] = await Promise.all([
          boardService.getProjects(),
          boardService.getTasks(projectId),
          boardService.getUsers(),
          boardService.getBoard(projectId),
        ]);

        const projectData = projectsData.find(p => p.id === projectId);

        if (!projectData) {
          toast.error("The project you're looking for doesn't exist.");
          router.push('/');
          return;
        }

        setProject(projectData);
        setTasks(tasksData);
        setUsers(usersData);
        setBoard(boardData);
      } catch (error) {
        console.error('Error loading data:', error);
        toast.error("There was a problem loading the project data.");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [projectId]);
  
  const handleColumnCreate = async (name: string) => {
    try {
      const board =  boardService.getBoard(projectId);
      (await board).columns[name] = {id: name, title: name, taskIds: []};
      const newColumn = await boardService.updateBoard(projectId, (await board).columns, [])
    }catch(error) {
      console.error('Error loading data:', error);
      toast.error("Error updating board");
    } finally {
      setLoading(false)
    }
  }

  const handleTaskCreate = async (task: Partial<Task>) => {
    try {
      const newTask = await boardService.createTask(task);
      setTasks(prevTasks => [...prevTasks, newTask]);
      toast.success("The task has been successfully created.");
    } catch (error) {
      console.error('Error creating task:', error);
      toast.error("There was a problem creating the task.");
    }
  };

  const handleTaskUpdate = async (task: Partial<Task>) => {
    try {
      const updatedTask = await boardService.updateTask(task);
      setTasks(prevTasks => 
        prevTasks.map(t => t.id === updatedTask.id ? updatedTask : t)
      );
      toast.success("The task has been successfully updated.");
    } catch (error) {
      console.error('Error updating task:', error);
      toast.error("There was a problem updating the task.");
    }
  };

  const handleTaskDelete = async (taskId: string) => {
    try {
      await boardService.deleteTask(taskId);
      setTasks(prevTasks => prevTasks.filter(t => t.id !== taskId));
      toast.success("The task has been successfully deleted.");
    } catch (error) {
      console.error('Error deleting task:', error);
      toast.error("There was a problem deleting the task.");
    }
  };

  const handleBoardUpdate = async (columns: Record<string, Column>, columnOrder: string[]) => {
    try {
      const updatedBoard = await boardService.updateBoard(projectId, columns, columnOrder);
      setBoard(updatedBoard);
    } catch (error) {
      console.error('Error updating board:', error);
      toast.error("There was a problem updating the board layout.");
    }
  };

  return (
    <Layout>
      <div className="h-[calc(100vh-5rem)] overflow-hidden flex flex-col animate-fade-in">
        <header className="mb-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center">
              <Button 
                variant="ghost" 
                size="icon" 
                className="mr-2" 
                onClick={() => router.push('/')}
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-medium">
                  {loading ? "Loading..." : project?.name}
                </h1>
                {project?.description && (
                  <p className="text-muted-foreground text-sm">
                    {project.description}
                  </p>
                )}
              </div>
            </div>
          </div>
        </header>

        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="flex flex-col items-center">
              <div className="h-12 w-12 rounded-full border-4 border-primary border-t-transparent animate-spin mb-4"></div>
              <p className="text-muted-foreground">Loading board...</p>
            </div>
          </div>
        ) : (
          board && (
            <div className="flex-1 flex flex-col overflow-hidden">
              <KanbanBoard
                projectId={projectId}
                columns={board.columns}
                columnOrder={board.columnOrder}
                tasks={tasks}
                users={users}
                onTaskCreate={handleTaskCreate}
                onTaskUpdate={handleTaskUpdate}
                onTaskDelete={handleTaskDelete}
                onBoardUpdate={handleBoardUpdate}
              />
            </div>
          )
        )}
      </div>
    </Layout>
  );
};

export default ProjectPage;
