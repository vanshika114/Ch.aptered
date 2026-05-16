import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@hooks/useAuth';
import { Button } from './Button';

export const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
        <Link to="/dashboard" className="text-2xl font-bold text-primary">
          📚 Chaptered
        </Link>

        {user && (
          <div className="flex items-center gap-4">
            <span className="text-gray-700">{user.name}</span>
            {user.isPremium && (
              <span className="px-2 py-1 bg-accent text-white text-sm rounded">
                Premium ⭐
              </span>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
            >
              Logout
            </Button>
          </div>
        )}
      </div>
    </header>
  );
};