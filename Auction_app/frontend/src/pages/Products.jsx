import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useSearchParams } from 'react-router-dom';
import { fetchProducts } from '../redux/slices/productSlice';
import ProductCard from '../components/ProductCard';
import FilterSidebar from '../components/FilterSidebar';
import Pagination from '../components/Pagination';
import { Search, LayoutGrid } from 'lucide-react';
import '../styles/Products.css';

export default function Products() {
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const { items: products, pagination, loading } = useSelector(state => state.products);

  const [filters, setFilters] = useState({
    page: parseInt(searchParams.get('page')) || 1,
    limit: 12,
    category: searchParams.get('category') || '',
    search: searchParams.get('search') || '',
    sort: searchParams.get('sort') || ''
  });

  useEffect(() => {
    dispatch(fetchProducts(filters));
  }, [filters, dispatch]);

  const handleFilterChange = (newFilters) => {
    setFilters(prev => ({
      ...prev,
      ...newFilters,
      page: 1
    }));
  };

  const handlePageChange = (page) => {
    setFilters(prev => ({
      ...prev,
      page
    }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="products-page">
      <div className="container">
        <div className="products-header">
          <h1>
            <LayoutGrid size={32} />
            Browse Auctions
          </h1>
          <p>Found {pagination.total} products</p>
        </div>

        <div className="products-content">
          <aside className="products-sidebar">
            <FilterSidebar onFilterChange={handleFilterChange} />
          </aside>

          <main className="products-main">
            {loading ? (
              <div className="loading-skeleton">
                {[...Array(12)].map((_, i) => (
                  <div key={i} className="skeleton-card" />
                ))}
              </div>
            ) : products.length > 0 ? (
              <>
                <div className="products-grid">
                  {products.map(product => (
                    <ProductCard key={product._id} product={product} />
                  ))}
                </div>

                {pagination.pages > 1 && (
                  <Pagination
                    currentPage={pagination.page}
                    totalPages={pagination.pages}
                    onPageChange={handlePageChange}
                  />
                )}
              </>
            ) : (
              <div className="no-products">
                <Search size={48} />
                <h2>No products found</h2>
                <p>Try adjusting your filters or search criteria</p>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}