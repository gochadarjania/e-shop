'use client';

interface User {
  email?: string;
  fullName?: string;
  [key: string]: unknown;
}

interface SidebarUserInfoProps {
  isOpen: boolean;
  user: User | null;
}

const SidebarUserInfo = ({ isOpen, user }: SidebarUserInfoProps) => {
  const userInitial = user?.email?.charAt(0).toUpperCase() || 'U';

  if (isOpen) {
    return (
      <div className="p-3 flex items-center space-x-3">
        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
          <span className="text-white font-semibold text-sm">
            {userInitial}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-xs text-gray-300 truncate">
            {user?.email || 'User'}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-3 text-center">
      <div className="w-10 h-10 mx-auto bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
        <span className="text-white font-semibold text-sm">
          {userInitial}
        </span>
      </div>
    </div>
  );
};

export default SidebarUserInfo;
