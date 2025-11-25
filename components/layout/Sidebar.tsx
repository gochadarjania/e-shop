'use client';

import { MdDashboard, MdPeople, MdInventory, MdShoppingCart, MdSettings, MdCategory } from 'react-icons/md';
import { useAdminAuth } from '@/lib/context/AdminAuthContext';
import SidebarOverlay from './SidebarOverlay';
import SidebarLogo from './SidebarLogo';
import SidebarNavItem from './SidebarNavItem';
import SidebarUserInfo from './SidebarUserInfo';
import LogoutButton from './LogoutButton';

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const Sidebar = ({ isOpen, setIsOpen }: SidebarProps) => {
  const { logout, user } = useAdminAuth();

  const menuSections = [
    {
      items: [
        { id: 'dashboard', title: 'Dashboard', icon: MdDashboard, path: '/admin/dashboard' },
        { id: 'orders', title: 'Orders', icon: MdShoppingCart, path: '/admin/orders' },
        { id: 'products', title: 'Products', icon: MdInventory, path: '/admin/products' },
        { id: 'categories', title: 'Categories', icon: MdCategory, path: '/admin/categories' },
        { id: 'customers', title: 'Customers', icon: MdPeople, path: '/admin/customers' },
      ]
    },
    {
      items: [
        { id: 'settings', title: 'Settings', icon: MdSettings, path: '/admin/settings' },
      ]
    }
  ];

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      logout();
    }
  };

  return (
    <>
      <SidebarOverlay isOpen={isOpen} onClose={() => setIsOpen(false)} />

      <aside className={`fixed left-0 top-0 h-screen bg-[#2d3035] flex flex-col shadow-lg z-50 transition-all duration-300
      ${
        isOpen ? 'w-[200px]' : 'w-16'
      }`}>
        <SidebarLogo isOpen={isOpen} setIsOpen={setIsOpen} />

        <nav className="flex-1 overflow-y-auto py-4">
          {menuSections.map((section, sectionIndex) => (
            <div key={sectionIndex} className={sectionIndex > 0 ? 'mt-6' : ''}>
              {section.items.map((item) => (
                <SidebarNavItem key={item.id} item={item} isOpen={isOpen} />
              ))}
            </div>
          ))}
        </nav>

        <div className="border-t border-gray-700">
          <SidebarUserInfo isOpen={isOpen} user={user} />
          <LogoutButton isOpen={isOpen} onLogout={handleLogout} />
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
