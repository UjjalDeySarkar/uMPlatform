'use client'
import React from 'react';
import Link from 'next/link';
import Layout from '@/components/kanban/Layout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { boardService } from '@/utils/boardService';
import { Project } from '@/types/kanban';

const Projects = () => {
  const [projects, setProjects] = React.useState<Project[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchProjects = async () => {
      try {
        const data = await boardService.getProjects();
        setProjects(data);
      } catch (error) {
        console.error('Error fetching projects:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  return (
    <Layout>
      <div className="container animate-fade-in">
        <header className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-medium">Projects</h1>
              <p className="text-muted-foreground mt-2">
                Manage your projects and view their kanban boards
              </p>
            </div>

            <Button asChild>
              <Link href="/projects/new">
                New Project
              </Link>
            </Button>
          </div>
        </header>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <Card key={i} className="glass-panel h-[180px] animate-pulse">
                <div className="h-full"></div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map(project => (
              <Card key={project.id} className="glass-panel overflow-hidden hover:shadow-md transition-all duration-300">
                <CardHeader className="pb-4">
                  <div className="flex justify-between items-start">
                    <Badge variant="secondary" className="mb-2">
                      Project
                    </Badge>
                  </div>
                  <CardTitle className="text-xl">{project.name}</CardTitle>
                  <CardDescription className="line-clamp-2">{project.description}</CardDescription>
                </CardHeader>
                <CardContent className="pb-4">
                  <div className="text-sm text-muted-foreground">
                    Created on {new Date(project.createdAt).toLocaleDateString()}
                  </div>
                </CardContent>
                <CardFooter className="pt-0">
                  <Button asChild variant="ghost" className="w-full justify-center">
                    <Link href={`/projects/${project.id}`}>
                      View Board
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Projects;