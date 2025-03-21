import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { Plus } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { successBtnStyles } from '../../commonStyles';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { createClient } from '@/utils/supabase/client';

const supabase = await createClient();
const { data: user } = await supabase.auth.getUser();

interface SearchAndButtonProps {
  placeholderText: string;
  onSearch?: (term: string) => void;
}

const SearchAndButton = ({ placeholderText, onSearch }: SearchAndButtonProps) => {
  const [open, setOpen] = useState(false);
  const [projectName, setProjectName] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [workspaceId, setWorkspaceId] = useState<string | null>(null);

  useEffect(() => {
    const fetchWorkspaceId = async () => {
      const { data, error } = await supabase
        .from('workspace')
        .select('id')
        .eq('status', true)
        .limit(1)
        .single();
      
      if (error) {
        toast.error("Error fetching workspace ID:")
        console.error("Error fetching workspace ID:", error.message);
      } else {
        setWorkspaceId(data?.id || null);
      }
    };

    fetchWorkspaceId();
  }, []);

  const handleCreateProject = async () => {
    if (!projectName || !projectDescription || !workspaceId) {
      toast.warning("Please enter project name and description.")
      alert("Please enter project name and description.");
      return;
    }

    setLoading(true);

    const { data, error } = await supabase.from('projects').insert([
      {
        name: projectName,
        description: projectDescription,
        created_by: user?.user?.id || null, // Set user ID if authenticated
        closed: false,
        workspace_id: workspaceId, // Replace with actual workspace ID
      }
    ]);

    setLoading(false);

    if (error) {
      console.error("Error creating project:", error.message);
      alert("Failed to create project.");
      toast.error("Failed to create project.")
    } else {
      console.log("Project created:", data);
      setOpen(false);
      setProjectName('');
      setProjectDescription('');
      toast.success("Project created.")
    }
  };

  return (
    <div className="flex items-center py-4">
      <div className="flex-grow mr-2">
        <Input
          type="text"
          placeholder={placeholderText}
          className="w-full p-2 rounded"
          onChange={(e) => onSearch?.(e.target.value)}
        />
      </div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button>
            <Plus className="w-4 h-4" />
            New project
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create New Project</DialogTitle>
            <DialogDescription>
              Enter the details for your new project below.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="project-name" className="text-right">
                Name
              </Label>
              <Input
                id="project-name"
                placeholder="Enter project name"
                className="col-span-3"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="project-description" className="text-right">
                Description
              </Label>
              <Input
                id="project-description"
                placeholder="Enter project description"
                className="col-span-3"
                value={projectDescription}
                onChange={(e) => setProjectDescription(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" onClick={handleCreateProject} disabled={loading}>
              {loading ? "Creating..." : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SearchAndButton;
