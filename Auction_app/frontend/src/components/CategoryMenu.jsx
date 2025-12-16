import { useState, useEffect } from 'react';
import api from '../services/api';
import { ChevronDown } from 'lucide-react';

export function CategoryMenu() {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await api.get('/categories');
        setCategories(response.data);
      } catch (error) {
        console.error('Failed to fetch categories:', error);
      }
    };
    fetchCategories();
  }, []);

  return (
    <div className="category-menu">
      {categories.map(cat => (
        <div key={cat._id} className="category-item">
          <a href={`/products?category=${cat._id}`} className="category-link">
            {cat.name}
            {cat.children?.length > 0 && <ChevronDown size={16} />}
          </a>
          {cat.children?.length > 0 && (
            <div className="submenu">
              {cat.children.map(subcat => (
                <a key={subcat._id} href={`/products?category=${subcat._id}`}>
                  {subcat.name}
                </a>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}