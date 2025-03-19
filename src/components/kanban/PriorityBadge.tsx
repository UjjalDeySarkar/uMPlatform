import React from 'react';
import { Flag, AlertTriangle, AlertCircle, Clock, Flame } from 'lucide-react';
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
      icon: Clock,
      color: 'text-emerald-600 bg-emerald-50 border-emerald-200',
      label: 'Low',
    },
    medium: {
      icon: AlertTriangle,
      color: 'text-amber-600 bg-amber-50 border-amber-200',
      label: 'Medium',
    },
    high: {
      icon: Flame,
      color: 'text-red-600 bg-red-50 border-red-200',
      label: 'High',
    },
  };

  const { icon: Icon, color, label } = config[priority];

  return (
    <Badge
      variant="outline"
      className={cn(
        'font-medium border',
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