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
  const [searchParams, setSearchParams] = useSearchParams();
  const { items: products, pagination, loading } = useSelector(state => state.products);

  const [filters, setFilters] = useState({
    page: 1,
    limit: 12,
    category: '',
    search: '',
    sort: ''
  });

  // Sync URL params with filters
  useEffect(() => {
    const newCategory = searchParams.get('category') || '';
    const newSearch = searchParams.get('search') || '';
    const newSort = searchParams.get('sort') || '';
    const newPage = parseInt(searchParams.get('page')) || 1;
    
    setFilters(prev => ({
      ...prev,
      page: newPage,
      category: newCategory,
      search: newSearch,
      sort: newSort,
    }));
  }, [searchParams]);

  // Fetch products when filters change
  useEffect(() => {
    console.log('Fetching products with filters:', filters);
    dispatch(fetchProducts(filters));
  }, [filters, dispatch]);

  const handleFilterChange = (newFilters) => {
    const updatedFilters = {
      ...filters,
      ...newFilters,
      page: 1
    };
    
    setFilters(updatedFilters);
    
    // Update URL params
    const params = new URLSearchParams();
    if (updatedFilters.category) params.set('category', updatedFilters.category);
    if (updatedFilters.search) params.set('search', updatedFilters.search);
    if (updatedFilters.sort) params.set('sort', updatedFilters.sort);
    params.set('page', '1');
    
    setSearchParams(params);
  };

  const handlePageChange = (page) => {
    const updatedFilters = { ...filters, page };
    setFilters(updatedFilters);
    
    // Update URL
    const params = new URLSearchParams(searchParams);
    params.set('page', page.toString());
    setSearchParams(params);
    
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
          <p>
            {loading ? 'Loading...' : `Found ${pagination.total || 0} products`}
            {filters.category && ' in this category'}
            {filters.search && ` matching "${filters.search}"`}
          </p>
        </div>

        <div className="products-content">
          <aside className="products-sidebar">
            <FilterSidebar 
              onFilterChange={handleFilterChange}
              currentFilters={filters}
            />
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
                <p>
                  {filters.category || filters.search 
                    ? 'Try adjusting your filters or search criteria'
                    : 'No products available at the moment'}
                </p>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}