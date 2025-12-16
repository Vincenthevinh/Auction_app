import { Link } from 'react-router-dom';
import { Home, Search } from 'lucide-react';
import '../styles/NotFound.css';

export default function NotFound() {
  return (
    <div className="not-found-page">
      <div className="not-found-content">
        <h1>404</h1>
        <h2>Page Not Found</h2>
        <p>Sorry, the page you're looking for doesn't exist.</p>
        <div className="not-found-actions">
          <Link to="/" className="btn btn-primary">
            <Home size={18} /> Back to Home
          </Link>
          <Link to="/products" className="btn btn-secondary">
            <Search size={18} /> Browse Products
          </Link>
        </div>
      </div>
    </div>
  );
}