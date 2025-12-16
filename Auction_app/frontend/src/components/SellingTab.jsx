import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { Plus, Edit, Trash2 } from 'lucide-react';

export function SellingTab() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSellingProducts();
  }, []);

  const fetchSellingProducts = async () => {
    try {
      const response = await api.get('/products/my-products');
      setProducts(response.data);
    } catch (error) {
      console.error('Failed to fetch products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (productId) => {
    if (window.confirm('Delete this auction?')) {
      try {
        await api.delete(`/products/${productId}`);
        fetchSellingProducts();
      } catch (error) {
        alert('Failed to delete product');
      }
    }
  };

  return (
    <div className="profile-card">
      <div className="section-header">
        <h2>My Auctions</h2>
        <Link to="/seller/create-product" className="btn btn-primary">
          <Plus size={18} /> New Auction
        </Link>
      </div>

      {loading ? (
        <div>Loading...</div>
      ) : products.length > 0 ? (
        <table className="products-table">
          <thead>
            <tr>
              <th>Product</th>
              <th>Current Price</th>
              <th>Bids</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map(product => (
              <tr key={product._id}>
                <td>{product.title}</td>
                <td>₫{product.currentPrice.toLocaleString()}</td>
                <td>{product.bidCount}</td>
                <td><span className={`badge badge-${product.status}`}>{product.status}</span></td>
                <td>
                  <Link to={`/seller/edit/${product._id}`} className="btn-icon">
                    <Edit size={16} />
                  </Link>
                  <button onClick={() => handleDelete(product._id)} className="btn-icon btn-danger">
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div className="empty-state">
          <p>You haven't created any auctions yet</p>
          <Link to="/seller/create-product" className="btn btn-primary">
            Start Your First Auction
          </Link>
        </div>
      )}
    </div>
  );
}

// ===== frontend/src/components/SalesTab.jsx =====
export function SalesTab() {
  const [sales, setSales] = useState([]);

  return (
    <div className="profile-card">
      <h2>Sales History</h2>
      {sales.length > 0 ? (
        <table className="sales-table">
          <thead>
            <tr>
              <th>Product</th>
              <th>Winner</th>
              <th>Sale Price</th>
              <th>Date</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {/* Add sales data here */}
          </tbody>
        </table>
      ) : (
        <p>No sales yet</p>
      )}
    </div>
  );
}