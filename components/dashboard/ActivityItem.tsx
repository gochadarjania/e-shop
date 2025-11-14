'use client';

import { IconType } from 'react-icons';

interface ActivityItemProps {
  icon: IconType;
  iconColor?: string;
  message: string;
  time: string;
}

const ActivityItem = ({ icon: Icon, iconColor = '#6b7280', message, time }: ActivityItemProps) => {
  return (
    <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg transition-colors hover:bg-gray-100">
      <span className="w-12 h-12 flex items-center justify-center bg-white rounded-lg border border-gray-200">
        <Icon style={{ fontSize: '24px', color: iconColor }} />
      </span>
      <div className="flex-1">
        <p className="m-0 mb-1 text-sm font-medium text-gray-900">{message}</p>
        <span className="text-xs text-gray-500">{time}</span>
      </div>
    </div>
  );
};

export default ActivityItem;
