'use client';

import { MdMenu, MdClose } from 'react-icons/md';

interface SidebarLogoProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const SidebarLogo = ({ isOpen, setIsOpen }: SidebarLogoProps) => {
  return (
    <div className="h-16 flex items-center justify-between px-3 border-b border-gray-700">
      {isOpen ? (
        <>
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">E</span>
            </div>
            <span className="text-white font-semibold">EShop</span>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="text-gray-400 hover:text-white p-1"
          >
            <MdClose className="text-xl" />
          </button>
        </>
      ) : (
        <button
          onClick={() => setIsOpen(true)}
          className="text-gray-400 hover:text-white p-1 mx-auto"
        >
          <MdMenu className="text-xl" />
        </button>
      )}
    </div>
  );
};

export default SidebarLogo;
