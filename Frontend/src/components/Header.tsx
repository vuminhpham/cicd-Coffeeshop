import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import { logout } from '@/redux/reducers/authSlice';
import { Button } from '@/components/ui/button';

const Header = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    navigate('/login');
  };

  return (
    <header className="bg-gray-800 text-white p-4">
      <nav className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-xl font-bold">
          Vu Coffee Shop
        </Link>
        <div className="space-x-4">
          <Link to="/menu" className='hover:text-gray-400'>Menu</Link>
          <Link to="/reservation" className='hover:text-gray-400'>book a table</Link>
          <Link to="/order" className='hover:text-gray-400'>Order</Link>
          {user ? (
            <>
              <Link to="/profile" className='hover:text-gray-400'>{user.name}</Link>
              <Button variant="outline" className='text-black' onClick={handleLogout}>
                Logout
              </Button>
            </>
          ) : (
            <>
              <Link to="/login">Login</Link>
              <Link to="/register">Register</Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Header;