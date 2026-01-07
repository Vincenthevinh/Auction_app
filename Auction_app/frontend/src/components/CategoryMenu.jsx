import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { ChevronDown } from 'lucide-react';
import '../styles/CategoryMenu.css';

export function CategoryMenu() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [openCategoryId, setOpenCategoryId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const menuRef = useRef(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  // FIX 1: Improved click-outside detection
  useEffect(() => {
    // Only attach listener when popup is open
    if (openCategoryId === null) return;

    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpenCategoryId(null);
      }
    }

    // Use mousedown instead of click to capture earlier in event chain
    // Delay attachment to avoid immediate triggering from the click that opened it
    const timeoutId = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside);
    }, 0);

    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [openCategoryId]); // Re-attach when openCategoryId changes

  const fetchCategories = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/categories');
      setCategories(response.data);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
      setError('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  // FIX 2: Removed stopPropagation to avoid interference
  const handleParentClick = (e, category) => {
    e.preventDefault();
    // Removed: e.stopPropagation();

    // If has children, toggle dropdown
    if (category.children && category.children.length > 0) {
      setOpenCategoryId(prev => prev === category._id ? null : category._id);
    } else {
      // If no children, navigate directly
      navigate(`/products?category=${category._id}`);
      setOpenCategoryId(null);
    }
  };

  const handleSubCategoryClick = (e, subcategory) => {
    e.preventDefault();
    // Keep stopPropagation here to prevent parent click handler
    e.stopPropagation();
    
    // Navigate to products with subcategory filter
    navigate(`/products?category=${subcategory._id}`);
    setOpenCategoryId(null);
  };

  if (loading) {
    return (
      <div className="category-menu">
        <div className="category-loading">Loading categories...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="category-menu">
        <div className="category-error">{error}</div>
      </div>
    );
  }

  return (
    <div className="category-menu" ref={menuRef}>
      {categories.map(category => (
        <div key={category._id} className="category-item">
          <button
            className="category-link"
            onClick={(e) => handleParentClick(e, category)}
            aria-expanded={openCategoryId === category._id}
            aria-haspopup={category.children?.length > 0 ? "true" : "false"}
          >
            {category.name}
            {category.children?.length > 0 && (
              <ChevronDown 
                size={16} 
                className={openCategoryId === category._id ? 'rotate' : ''}
                aria-hidden="true"
              />
            )}
          </button>

          {/* Subcategory Dropdown */}
          {category.children?.length > 0 && openCategoryId === category._id && (
            <div className="submenu" role="menu">
              {category.children.map(subcategory => (
                <button
                  key={subcategory._id}
                  className="submenu-item"
                  onClick={(e) => handleSubCategoryClick(e, subcategory)}
                  role="menuitem"
                >
                  {subcategory.name}
                </button>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}