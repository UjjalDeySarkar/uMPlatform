import React from 'react';
import { AlertCircle, AlertTriangle, Flag } from 'lucide-react';
import { Priority } from '@/types/kanban';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

interface PriorityBadgeProps {
  priority: Priority;
  showLabel?: boolean;
  size?: 'sm' | 'md';
}

const PriorityBadge: React.FC<PriorityBadgeProps> = ({
  priority,
  showLabel = true,
  size = 'md',
}) => {
  const config = {
    low: {
      icon: Flag,
      color: 'text-priority-low bg-priority-low/10',
      label: 'Low',
    },
    medium: {
      icon: AlertTriangle,
      color: 'text-priority-medium bg-priority-medium/10',
      label: 'Medium',
    },
    high: {
      icon: AlertCircle,
      color: 'text-priority-high bg-priority-high/10',
      label: 'High',
    },
  };

  const { icon: Icon, color, label } = config[priority];

  return (
    <Badge 
      variant="outline" 
      className={cn(
        'font-normal border-0', 
        color,
        size === 'sm' ? 'text-xs px-1.5 py-0' : 'text-xs'
      )}
    >
      <Icon className={size === 'sm' ? 'h-3 w-3 mr-1' : 'h-3.5 w-3.5 mr-1.5'} />
      {showLabel && label}
    </Badge>
  );
};

export default PriorityBadge;
