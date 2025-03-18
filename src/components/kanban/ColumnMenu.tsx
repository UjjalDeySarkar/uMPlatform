import React from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ColumnMenuProps {
  columnId: string;
  onDeleteColumn: (columnId: string) => void;
}

const ColumnMenu: React.FC<ColumnMenuProps> = ({ 
  columnId, 
  onDeleteColumn 
}) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem 
          className="text-red-500 focus:text-red-600"
          onClick={() => onDeleteColumn(columnId)}
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Delete Column
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ColumnMenu;