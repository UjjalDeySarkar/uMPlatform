import React from 'react';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Priority, Task, User } from '@/types/kanban';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from '@/components/ui/command';

interface TaskFormProps {
  open: boolean;
  task: Task | null;
  statuses: string[];
  users: User[];
  projectId: string;
  onOpenChange: (open: boolean) => void;
  onSave: (task: Partial<Task>) => void;
}

const TaskForm: React.FC<TaskFormProps> = ({
  open,
  task,
  statuses,
  users,
  projectId,
  onOpenChange,
  onSave,
}) => {
  const [title, setTitle] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [status, setStatus] = React.useState('');
  const [priority, setPriority] = React.useState<Priority>('medium');
  const [dueDate, setDueDate] = React.useState<Date | undefined>(undefined);
  const [assignedUserId, setAssignedUserId] = React.useState<string | undefined>(undefined);
  const [userDropdownOpen, setUserDropdownOpen] = React.useState(false);

  // Initialize form with task data if editing
  React.useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description || '');
      setStatus(task.status);
      setPriority(task.priority);
      setAssignedUserId(task.assignedUserId);
      setDueDate(task.dueDate ? new Date(task.dueDate) : undefined);
    } else {
      // Default values for new task
      setTitle('');
      setDescription('');
      setStatus(statuses[0]);
      setPriority('medium');
      setAssignedUserId(undefined);
      setDueDate(undefined);
    }
  }, [task, statuses]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const updatedTask: Partial<Task> = {
      ...task,
      title,
      description: description || undefined,
      status,
      priority,
      assignedUserId,
      projectId,
      dueDate: dueDate ? dueDate.toISOString() : undefined,
    };
    
    onSave(updatedTask);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{task ? 'Edit Task' : 'Create Task'}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Task title"
              className="glass-input"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Task description"
              className="glass-input resize-none min-h-24"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger className="glass-input">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {statuses.map((statusOption) => (
                    <SelectItem key={statusOption} value={statusOption}>
                      {statusOption}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select value={priority} onValueChange={(value: Priority) => setPriority(value)}>
                <SelectTrigger className="glass-input">
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="assignedUser">Assigned To</Label>
              <Popover open={userDropdownOpen} onOpenChange={setUserDropdownOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={userDropdownOpen}
                    className="glass-input justify-between w-full"
                  >
                    {assignedUserId
                      ? users.find((user) => user.id === assignedUserId)?.name
                      : "Assign to..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0">
                  <Command>
                    <CommandInput placeholder="Search users..." />
                    <CommandEmpty>No user found.</CommandEmpty>
                    <CommandGroup>
                      {users.map((user) => (
                        <CommandItem
                          key={user.id}
                          value={user.name}
                          onSelect={() => {
                            setAssignedUserId(user.id === assignedUserId ? undefined : user.id);
                            setUserDropdownOpen(false);
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              assignedUserId === user.id ? "opacity-100" : "opacity-0"
                            )}
                          />
                          {user.name}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="dueDate">Due Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "glass-input justify-start text-left font-normal w-full",
                      !dueDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dueDate ? format(dueDate, "PPP") : "Set due date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={dueDate}
                    onSelect={setDueDate}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
          
          <DialogFooter>
            <Button type="submit" className="w-full sm:w-auto">
              {task ? 'Save Changes' : 'Create Task'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default TaskForm;
