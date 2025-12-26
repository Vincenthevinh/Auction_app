import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { ChevronDown } from 'lucide-react';

export function CategoryMenu() {
  const [categories, setCategories] = useState([]);
  const [openCategoryId, setOpenCategoryId] = useState(null);
  const menuRef = useRef(null);

  useEffect(() => {
    api.get('/categories')
      .then(res => setCategories(res.data))
      .catch(err => console.error(err));
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

  const handleParentClick = (e, cat) => {
    e.stopPropagation();

    if (cat.children?.length > 0) {
      e.preventDefault();
      setOpenCategoryId(prev =>
        prev === cat._id ? null : cat._id
      );
    }
  };

  const handleSubClick = () => {
    setOpenCategoryId(null);
  };

  return (
    <div className="category-menu" ref={menuRef}>
      {categories.map(cat => (
        <div key={cat._id} className="category-item">
          <a
            href={`/products?category=${cat._id}`}
            className="category-link"
            onClick={(e) => handleParentClick(e, cat)}
          >
            {cat.name}
            {cat.children?.length > 0 && <ChevronDown size={16} />}
          </a>

          {cat.children?.length > 0 &&
            openCategoryId === cat._id && (
              <div
                className="submenu"
              >
                {cat.children.map(sub => (
                  <Link
                    key={sub._id}
                    to={`/products?category=${sub._id}`}
                    onClick={handleSubClick}
                  >
                    {sub.name}
                  </Link>
                ))}
              </div>
            )}
        </div>
      ))}
    </div>
  );
}
