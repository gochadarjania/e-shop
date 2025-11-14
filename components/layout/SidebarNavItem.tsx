'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { IconType } from 'react-icons';

interface NavItem {
  id: string;
  title: string;
  icon: IconType;
  path: string;
}

interface SidebarNavItemProps {
  item: NavItem;
  isOpen: boolean;
}

const SidebarNavItem = ({ item, isOpen }: SidebarNavItemProps) => {
  const pathname = usePathname();
  const isActive = pathname === item.path;

  return (
    <Link
      href={item.path}
      className={`w-full flex items-center py-3 px-3 text-gray-400 hover:bg-gray-700 transition-colors relative ${
        isActive ? 'bg-gray-700 text-white' : ''
      } ${isOpen ? 'justify-start' : 'flex-col justify-center'}`}
    >
      <item.icon className={`text-xl ${isOpen ? 'mr-3' : 'mb-1'}`} />
      {isOpen ? (
        <span className="text-sm">{item.title}</span>
      ) : (
        <span className="text-[10px] text-center leading-tight">{item.title}</span>
      )}
    </Link>
  );
};

export default SidebarNavItem;
