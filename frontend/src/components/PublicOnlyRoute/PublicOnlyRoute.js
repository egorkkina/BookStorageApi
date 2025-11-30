import { useAuth } from '../../context/AuthContext';
import { Navigate } from 'react-router-dom';

export default function PublicOnlyRoute({ children }) {
  const { isAuth } = useAuth();

  if (isAuth) {
    return <Navigate to="/books" replace />;
  }

  return children;
}