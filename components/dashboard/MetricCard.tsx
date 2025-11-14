'use client';

import { IconType } from 'react-icons';

interface MetricCardProps {
  icon: IconType;
  title: string;
  value: string | number;
  change: string;
  changeType?: 'positive' | 'negative';
}

const MetricCard = ({ icon: Icon, title, value, change, changeType = 'positive' }: MetricCardProps) => {
  return (
    <div className="bg-white rounded-lg p-6 flex items-center gap-4 shadow-sm border border-gray-200 transition-all duration-200 hover:shadow-md">
      <div className="w-14 h-14 flex items-center justify-center bg-blue-100 rounded-lg text-blue-600">
        <Icon style={{ fontSize: '32px' }} />
      </div>
      <div className="flex-1">
        <h3 className="m-0 mb-1 text-sm font-medium text-gray-600">{title}</h3>
        <p className="m-0 mb-1 text-2xl font-bold text-gray-900">{value}</p>
        <span
          className={`text-xs font-medium ${
            changeType === 'positive'
              ? 'text-green-600'
              : 'text-red-600'
          }`}
        >
          {change}
        </span>
      </div>
    </div>
  );
};

export default MetricCard;
