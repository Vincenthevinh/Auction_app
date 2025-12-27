import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { ChevronDown } from 'lucide-react';
import '../styles/CategoryMenu.css';

export function CategoryMenu() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [openCategoryId, setOpenCategoryId] = useState(null);
  const menuRef = useRef(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpenCategoryId(null);
      }
    }

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await api.get('/categories');
      setCategories(response.data);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  const handleParentClick = (e, category) => {
    e.preventDefault();
    e.stopPropagation();

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
    e.stopPropagation();
    
    // Navigate to products with subcategory filter
    navigate(`/products?category=${subcategory._id}`);
    setOpenCategoryId(null);
  };

  return (
    <div className="category-menu" ref={menuRef}>
      {categories.map(category => (
        <div key={category._id} className="category-item">
          <button
            className="category-link"
            onClick={(e) => handleParentClick(e, category)}
          >
            {category.name}
            {category.children?.length > 0 && (
              <ChevronDown 
                size={16} 
                className={openCategoryId === category._id ? 'rotate' : ''}
              />
            )}
          </button>

          {/* Subcategory Dropdown */}
          {category.children?.length > 0 && openCategoryId === category._id && (
            <div className="submenu">
              {category.children.map(subcategory => (
                <button
                  key={subcategory._id}
                  className="submenu-item"
                  onClick={(e) => handleSubCategoryClick(e, subcategory)}
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