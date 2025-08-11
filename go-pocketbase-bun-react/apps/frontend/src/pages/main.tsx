import { useAuth } from "../hooks/useAuth";

export const MainPage = () => {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold">Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">Welcome, {user?.email}</span>
              <button
                className="py-2 px-4 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
                onClick={logout}
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="py-6 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="py-6 px-4 sm:px-0">
          <div className="flex justify-center items-center h-96 rounded-lg border-4 border-gray-200 border-dashed">
            <div className="text-center">
              <h2 className="mb-2 text-2xl font-bold text-gray-900">Welcome to your Dashboard</h2>
              <p className="text-gray-600">You are successfully authenticated with PocketBase!</p>
              <p className="mt-4 text-sm text-gray-500">User ID: {user?.id}</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
