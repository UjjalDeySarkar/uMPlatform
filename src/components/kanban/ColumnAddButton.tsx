import React, { useState } from 'react';
import { PlusIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import ColorPicker from './ColorPicker';

interface ColumnAddButtonProps {
  onColumnAdd: (columnName: string, columnColor: string) => void;
}

const ColumnAddButton: React.FC<ColumnAddButtonProps> = ({ onColumnAdd }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [columnName, setColumnName] = useState('');
  const [columnColor, setColumnColor] = useState('#3b82f6'); // Default blue
  const [error, setError] = useState('');

  const handleOpen = () => {
    setIsOpen(true);
    setColumnName('');
    setError('');
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!columnName.trim()) {
      setError('Column name is required');
      return;
    }
    
    onColumnAdd(columnName.trim(), columnColor);
    setIsOpen(false);
  };

  return (
    <>
      <div 
        className="h-full flex-shrink-0 flex flex-col items-center justify-center min-w-[280px] w-[280px] border border-dashed border-gray-300 dark:border-gray-600 rounded-md bg-gray-50/50 dark:bg-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer"
        onClick={handleOpen}
      >
        <div className="flex flex-col items-center gap-2 py-6 text-gray-500 dark:text-gray-400">
          <PlusIcon className="h-5 w-5" />
          <span>Add Column</span>
        </div>
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Column</DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="columnName">Column Name</Label>
                <Input
                  id="columnName"
                  value={columnName}
                  onChange={(e) => setColumnName(e.target.value)}
                  placeholder="Enter column name..."
                  autoFocus
                />
                {error && <p className="text-sm text-red-500 dark:text-red-400">{error}</p>}
              </div>
              
              <ColorPicker 
                selectedColor={columnColor}
                onChange={setColumnColor}
              />
            </div>
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button type="submit">Add Column</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ColumnAddButton;