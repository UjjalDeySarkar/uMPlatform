'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PanelsTopLeft, SquareKanban, View } from 'lucide-react';
import SearchAndButton from '../Search';
import { ProjectList } from '../ProjectList';
import { createClient } from '@/utils/supabase/client';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const supabase = await createClient();


export const ProjectTabs = () => {
  const [projects, setProjects] = useState<IProject[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');

  useEffect(() => {
    const fetchProjects = async () => {
      const { data, error } = await supabase.from('projects').select('*');
      if (error) {
        console.error('Error fetching projects:', error);
      } else {
        console.log('Fetched projects:', data);
        setProjects(data);
      }
    };

    fetchProjects();
  }, []);

  // Function to add new project without reloading
  const addProjectToList = (newProject: IProject) => {
    setProjects((prevProjects) => [newProject, ...prevProjects]);
  };

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(new Date(dateString));
  };

  // **FILTER PROJECTS BASED ON SEARCH TERM**
  const filterProjects = (projects: IProject[]) => {
    return projects.filter((p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  // const activeProjects = projects.filter((p) => !p.closed);
  // const closedProjects = projects.filter((p) => p.closed);

  const activeProjects = filterProjects(projects.filter((p) => !p.closed));
  const closedProjects = filterProjects(projects.filter((p) => p.closed));
  const allProjects = filterProjects(projects);

  return (
    <Tabs defaultValue="active-projects">
      <TabsList className="bg-slate-100 dark:bg-slate-900 rounded-none">
        <TabsTrigger value="active-projects">
          <PanelsTopLeft className="w-4 h-4 mr-2" />
          <span>Active Projects</span>
        </TabsTrigger>
        <TabsTrigger value="closed-projects">
          <SquareKanban className="w-4 h-4 mr-2" />
          <span>Closed Projects</span>
        </TabsTrigger>
        <TabsTrigger value="all-projects">
          <SquareKanban className="w-4 h-4 mr-2" />
          <span>All Projects</span>
        </TabsTrigger>
      </TabsList>

      <TabsContent value="active-projects">
        <SearchAndButton placeholderText="Search active projects" onSearch={setSearchTerm} onProjectCreated={addProjectToList}/>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {activeProjects.map((project) => (
            <Card key={project.id} className="shadow-sm border border-gray-200">
              <CardHeader className='h-30'>
                <Badge variant="outline" className="mb-2">Active</Badge>
                <CardTitle className="text-lg font-semibold">{project.name}</CardTitle>
                <CardDescription className="line-clamp-2" >{project.description}</CardDescription>
              </CardHeader>
              <CardContent  >
                <p className="text-sm text-gray-400">Created on {formatDate(project.created_at)}</p>
              </CardContent>
                <CardFooter>
                  <Button className="w-full">
                    <View />View Board
                  </Button>
                </CardFooter>
            </Card>
          ))}
        </div>
      </TabsContent>

      <TabsContent value="closed-projects">
        <SearchAndButton placeholderText="Search closed projects" onSearch={setSearchTerm} onProjectCreated={addProjectToList}/>
        {/* <ProjectList tab="closed" projects={closedProjects} sortOrder={sortOrder} /> */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {closedProjects.map((project) => (
            <Card key={project.id} className="shadow-sm border border-gray-200">
              <CardHeader className='h-30'>
                <Badge variant="outline" className="mb-2">Closed</Badge>
                <CardTitle className="text-lg font-semibold">{project.name}</CardTitle>
                <CardDescription className="line-clamp-2" >{project.description}</CardDescription>
              </CardHeader>
              <CardContent  >
                <p className="text-sm text-gray-400">Created on {formatDate(project.created_at)}</p>
              </CardContent>
                <CardFooter>
                  <Button className="w-full">
                    <View />View Board
                  </Button>
                </CardFooter>
            </Card>
          ))}
        </div>
      </TabsContent>

      <TabsContent value="all-projects">
        <SearchAndButton placeholderText="Search all projects" onSearch={setSearchTerm} onProjectCreated={addProjectToList}/>
        {/* <ProjectList tab="all" projects={projects} sortOrder={sortOrder} /> */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {allProjects.map((project) => (
            <Card key={project.id} className="shadow-sm border border-gray-200">
              <CardHeader className='h-30'>
                <Badge variant="outline" className="mb-2">
                {project.closed ? 'Closed' : 'Active'}
                </Badge>
                <CardTitle className="text-lg font-semibold">{project.name}</CardTitle>
                <CardDescription className="line-clamp-2" >{project.description}</CardDescription>
              </CardHeader>
              <CardContent  >
                <p className="text-sm text-gray-400">Created on {formatDate(project.created_at)}</p>
              </CardContent>
                <CardFooter>
                  <Button className="w-full">
                    <View  />View Board
                  </Button>
                </CardFooter>
            </Card>
          ))}
        </div>
        </TabsContent>
    </Tabs>
  );
};