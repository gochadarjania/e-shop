'use client';

import { MdPeople, MdInventory, MdShoppingCart, MdAttachMoney, MdCheckCircle, MdPerson, MdInbox } from 'react-icons/md';

import MetricCard from '@/components/dashboard/MetricCard';
import ActivityItem from '@/components/dashboard/ActivityItem';

export default function Home() {

  const stats = [
    {
      id: 1,
      icon: MdPeople,
      title: 'მომხმარებლები',
      value: '1,234',
      change: '+12%',
      changeType: 'positive' as const
    },
    {
      id: 2,
      icon: MdInventory,
      title: 'პროდუქტები',
      value: '567',
      change: '+8%',
      changeType: 'positive' as const
    },
    {
      id: 3,
      icon: MdShoppingCart,
      title: 'შეკვეთები',
      value: '891',
      change: '-3%',
      changeType: 'negative' as const
    },
    {
      id: 4,
      icon: MdAttachMoney,
      title: 'შემოსავალი',
      value: '$45,678',
      change: '+15%',
      changeType: 'positive' as const
    }
  ];

  const activities = [
    {
      id: 1,
      icon: MdCheckCircle,
      iconColor: '#22c55e',
      message: 'ახალი შეკვეთა #1234',
      time: '5 წუთის წინ'
    },
    {
      id: 2,
      icon: MdPerson,
      iconColor: '#3b82f6',
      message: 'ახალი მომხმარებელი დარეგისტრირდა',
      time: '15 წუთის წინ'
    },
    {
      id: 3,
      icon: MdInbox,
      iconColor: '#a855f7',
      message: 'პროდუქტი დაემატა კატალოგში',
      time: '1 საათის წინ'
    }
  ];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold text-gray-800 mb-8">Dashboard</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => (
          <MetricCard
            key={stat.id}
            icon={stat.icon}
            title={stat.title}
            value={stat.value}
            change={stat.change}
            changeType={stat.changeType}
          />
        ))}
      </div>

      {/* Activity Section */}
      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
        <h2 className="text-xl font-semibold text-gray-800 mb-5">ბოლო აქტივობები</h2>
        <div className="flex flex-col gap-4">
          {activities.map((activity) => (
            <ActivityItem
              key={activity.id}
              icon={activity.icon}
              iconColor={activity.iconColor}
              message={activity.message}
              time={activity.time}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
