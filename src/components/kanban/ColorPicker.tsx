import React from 'react';
import { Label } from '@/components/ui/label';

interface ColorPickerProps {
  selectedColor: string;
  onChange: (color: string) => void;
}

const ColorPicker: React.FC<ColorPickerProps> = ({ 
  selectedColor, 
  onChange 
}) => {
  // Predefined color options
  const colors = [
    '#ef4444', // red
    '#f97316', // orange
    '#f59e0b', // amber
    '#10b981', // green
    '#14b8a6', // teal
    '#3b82f6', // blue
    '#6366f1', // indigo
    '#8b5cf6', // violet
    '#d946ef', // pink
    '#ec4899', // fuchsia
    '#6b7280', // gray
    '#1e293b', // slate
  ];

  return (
    <div className="space-y-2">
      <Label htmlFor="columnColor">Column Color</Label>
      <div className="flex flex-wrap gap-2">
        {colors.map((color) => (
          <div
            key={color}
            className={`w-6 h-6 rounded-full cursor-pointer border-2 ${
              selectedColor === color ? 'border-black' : 'border-transparent'
            }`}
            style={{ backgroundColor: color }}
            onClick={() => onChange(color)}
          />
        ))}
      </div>
    </div>
  );
};

export default ColorPicker;