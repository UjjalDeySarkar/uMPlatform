import React from 'react';
import { Check, Filter, SlidersHorizontal, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Priority, User } from '@/types/kanban';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';

interface FilterMenuProps {
  users: User[];
  selectedPriority: Priority | null;
  selectedUser: User | null;
  onPriorityChange: (priority: Priority | null) => void;
  onUserChange: (user: User | null) => void;
  onReset: () => void;
}

const FilterMenu: React.FC<FilterMenuProps> = ({
  users,
  selectedPriority,
  selectedUser,
  onPriorityChange,
  onUserChange,
  onReset,
}) => {
  const [open, setOpen] = React.useState(false);
  const isFiltering = selectedPriority || selectedUser;
  
  const priorities: Priority[] = ['low', 'medium', 'high'];
  
  const priorityLabels = {
    low: 'Low Priority',
    medium: 'Medium Priority',
    high: 'High Priority',
  };
  
  const priorityColors = {
    low: 'bg-priority-low/10 text-priority-low border-priority-low/20',
    medium: 'bg-priority-medium/10 text-priority-medium border-priority-medium/20',
    high: 'bg-priority-high/10 text-priority-high border-priority-high/20',
  };

  return (
    <div className="flex items-center">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant={isFiltering ? "default" : "outline"} size="sm" className="h-9">
            {isFiltering ? <Filter className="mr-2 h-4 w-4" /> : <SlidersHorizontal className="mr-2 h-4 w-4" />}
            <span>{isFiltering ? 'Filtered' : 'Filter'}</span>
            {isFiltering && (
              <Badge variant="secondary" className="ml-2 rounded-full text-xs px-1.5">
                {(selectedPriority ? 1 : 0) + (selectedUser ? 1 : 0)}
              </Badge>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-72 p-0" align="end">
          <div className="p-3 flex items-center justify-between">
            <h4 className="font-medium text-sm">Filters</h4>
            {isFiltering && (
              <Button variant="ghost" size="sm" onClick={onReset} className="h-8 text-xs">
                <X className="mr-1.5 h-3.5 w-3.5" />
                Reset
              </Button>
            )}
          </div>
          <Separator />
          
          <div className="p-3">
            <h5 className="text-xs font-medium mb-2">Priority</h5>
            <div className="flex flex-wrap gap-1.5">
              {priorities.map((priority) => (
                <Badge
                  key={priority}
                  variant="outline"
                  className={cn(
                    "cursor-pointer border",
                    selectedPriority === priority ? priorityColors[priority] : "border-border"
                  )}
                  onClick={() => {
                    onPriorityChange(selectedPriority === priority ? null : priority);
                  }}
                >
                  {priorityLabels[priority]}
                  {selectedPriority === priority && (
                    <X className="ml-1 h-3 w-3" />
                  )}
                </Badge>
              ))}
            </div>
          </div>
          
          <Separator />
          
          <div className="p-3">
            <h5 className="text-xs font-medium mb-2">Assigned to</h5>
            <Command>
              <CommandInput placeholder="Search users..." />
              <CommandList className="max-h-[120px]">
                <CommandEmpty>No users found.</CommandEmpty>
                <CommandGroup>
                  {users.map((user) => (
                    <CommandItem
                      key={user.id}
                      value={user.name}
                      onSelect={() => {
                        onUserChange(selectedUser?.id === user.id ? null : user);
                      }}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          selectedUser?.id === user.id ? "opacity-100" : "opacity-0"
                        )}
                      />
                      {user.name}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default FilterMenu;
