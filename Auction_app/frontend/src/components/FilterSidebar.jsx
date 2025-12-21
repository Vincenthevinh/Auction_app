import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

export default function FilterSidebar({ onFilterChange }) {
  const [filters, setFilters] = useState({
    search: '',
    sort: ''
  });

  const handleChange = (name, value) => {
    const newFilters = { ...filters, [name]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  return (
    <div className="filter-sidebar">
      <h2>Filters</h2>
      
      <div className="filter-group">
        <label>Search</label>
        <input
          type="text"
          placeholder="Search products..."
          value={filters.search}
          onChange={(e) => handleChange('search', e.target.value)}
        />
      </div>

      <div className="filter-group">
        <label>Sort By</label>
        <select value={filters.sort} onChange={(e) => handleChange('sort', e.target.value)}>
          <option value="">Newest</option>
          <option value="price-asc">Price: Low to High</option>
          <option value="price-desc">Price: High to Low</option>
          <option value="views">Most Views</option>
          <option value="bids">Most Bids</option>
          <option value="ending-soon">Ending Soon</option>
        </select>
      </div>
    </div>
  );
}