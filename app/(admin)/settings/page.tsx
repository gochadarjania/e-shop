'use client';

import { useAuth } from '@/lib/context/AuthContext';
import authService from '@/lib/services/authService';

export default function Settings() {
  const { user } = useAuth();
  const token = authService.getToken();

  return (
    <div className="p-3 md:p-6">
      <h1 className="text-2xl font-semibold text-gray-800 mb-6">Settings</h1>

      {/* User Info Debug Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">User Information</h2>
        <div className="space-y-3">
          <div className="flex items-start">
            <span className="font-medium text-gray-700 w-32">Email:</span>
            <span className="text-gray-600">{user?.email || 'N/A'}</span>
          </div>
          <div className="flex items-start">
            <span className="font-medium text-gray-700 w-32">Full Name:</span>
            <span className="text-gray-600">{user?.fullName as string || 'N/A'}</span>
          </div>
          <div className="flex items-start">
            <span className="font-medium text-gray-700 w-32">User ID:</span>
            <span className="text-gray-600 font-mono text-sm">{(user as any)?.sub || (user as any)?.id || 'N/A'}</span>
          </div>
          <div className="flex items-start">
            <span className="font-medium text-gray-700 w-32">Roles:</span>
            <span className="text-gray-600">
              {user?.role ? (
                Array.isArray(user.role) ? (
                  <span className="space-x-2">
                    {(user.role as string[]).map((r, i) => (
                      <span key={i} className={`inline-block px-2 py-1 rounded text-xs ${
                        r === 'Admin' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {r}
                      </span>
                    ))}
                  </span>
                ) : (
                  <span className={`inline-block px-2 py-1 rounded text-xs ${
                    user.role === 'Admin' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                  }`}>
                    {user.role as string}
                  </span>
                )
              ) : (
                'No roles assigned'
              )}
            </span>
          </div>
          <div className="flex items-start">
            <span className="font-medium text-gray-700 w-32">Token:</span>
            <span className="text-gray-600 font-mono text-xs break-all">
              {token ? `${token.substring(0, 50)}...` : 'No token'}
            </span>
          </div>
        </div>
      </div>

      {/* Warning if not Admin */}
      {user && user.role !== 'Admin' && !(Array.isArray(user.role) && user.role.includes('Admin')) && (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded mb-6">
          <p className="font-semibold">⚠️ Admin Role Required</p>
          <p className="text-sm mt-1">
            Your account does not have Admin role. You need Admin role to access product management features.
          </p>
        </div>
      )}

      {/* Raw User Object (Debug) */}
      <div className="bg-gray-50 rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Debug: Raw User Object</h2>
        <pre className="bg-gray-800 text-green-400 p-4 rounded overflow-x-auto text-xs font-mono">
          {JSON.stringify(user, null, 2)}
        </pre>
      </div>
    </div>
  );
}
