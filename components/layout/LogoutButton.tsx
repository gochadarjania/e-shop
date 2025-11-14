'use client';

import { MdLogout } from 'react-icons/md';

interface LogoutButtonProps {
  isOpen: boolean;
  onLogout: () => void;
}

const LogoutButton = ({ isOpen, onLogout }: LogoutButtonProps) => {
  return (
    <button
      onClick={onLogout}
      className={`w-full flex items-center py-3 px-3 text-gray-400 hover:bg-gray-700 transition-colors ${
        isOpen ? 'justify-start' : 'flex-col justify-center'
      }`}
    >
      <MdLogout className={`text-xl ${isOpen ? 'mr-3' : 'mb-1'}`} />
      {isOpen ? (
        <span className="text-sm">Logout</span>
      ) : (
        <span className="text-[10px]">Logout</span>
      )}
    </button>
  );
};

export default LogoutButton;
