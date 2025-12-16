import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { showNotification } from '../redux/slices/uiSlice';
import api from '../services/api';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { Upload, Plus, Trash2 } from 'lucide-react';
import { PRODUCT_CONDITIONS } from '../utils/constants';
import '../styles/CreateProduct.css';

export default function CreateProduct() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useSelector(state => state.auth);

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    startPrice: '',
    minIncrement: '',
    buyNowPrice: '',
    condition: 'new',
    startTime: '',
    endTime: '',
    location: '',
    shippingCost: '',
    shippingMethod: 'Standard'
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'seller') {
      navigate('/login');
    }
    fetchCategories();
  }, [isAuthenticated, user, navigate]);

  const fetchCategories = async () => {
    try {
      const response = await api.get('/categories');
      const flatCategories = flattenCategories(response.data);
      setCategories(flatCategories);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  const flattenCategories = (cats, parent = '') => {
    return cats.reduce((acc, cat) => {
      acc.push({
        value: cat._id,
        label: parent ? `${parent} > ${cat.name}` : cat.name
      });
      if (cat.children?.length > 0) {
        acc.push(...flattenCategories(cat.children, cat.name));
      }
      return acc;
    }, []);
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const maxFiles = 10;

    if (images.length + files.length > maxFiles) {
      dispatch(showNotification({
        type: 'error',
        message: `Maximum ${maxFiles} images allowed`
      }));
      return;
    }

    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImages(prev => [...prev, file]);
        setImagePreviews(prev => [...prev, reader.result]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.category) newErrors.category = 'Category is required';
    if (!formData.startPrice || parseFloat(formData.startPrice) <= 0) {
      newErrors.startPrice = 'Valid start price required';
    }
    if (!formData.minIncrement || parseFloat(formData.minIncrement) <= 0) {
      newErrors.minIncrement = 'Minimum increment required';
    }
    if (!formData.startTime) newErrors.startTime = 'Start time is required';
    if (!formData.endTime) newErrors.endTime = 'End time is required';

    if (new Date(formData.endTime) <= new Date(formData.startTime)) {
      newErrors.endTime = 'End time must be after start time';
    }

    if (imagePreviews.length === 0) newErrors.images = 'At least one image is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    try {
      const formDataObj = new FormData();
      formDataObj.append('title', formData.title);
      formDataObj.append('description', formData.description);
      formDataObj.append('category', formData.category);
      formDataObj.append('startPrice', parseFloat(formData.startPrice));
      formDataObj.append('minIncrement', parseFloat(formData.minIncrement));
      if (formData.buyNowPrice) {
        formDataObj.append('buyNowPrice', parseFloat(formData.buyNowPrice));
      }
      formDataObj.append('condition', formData.condition);
      formDataObj.append('startTime', new Date(formData.startTime).toISOString());
      formDataObj.append('endTime', new Date(formData.endTime).toISOString());
      formDataObj.append('location', formData.location);
      formDataObj.append('shippingCost', parseFloat(formData.shippingCost) || 0);
      formDataObj.append('shippingMethod', formData.shippingMethod);

      images.forEach(img => {
        formDataObj.append('images', img);
      });

      const response = await api.post('/products', formDataObj, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      dispatch(showNotification({
        type: 'success',
        message: 'Product created successfully!'
      }));

      navigate(`/products/${response.data._id}`);
    } catch (error) {
      dispatch(showNotification({
        type: 'error',
        message: error.message
      }));
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleDescriptionChange = (content) => {
    setFormData(prev => ({
      ...prev,
      description: content
    }));
  };

  return (
    <div className="create-product-page">
      <div className="container">
        <div className="create-header">
          <h1>Create New Auction</h1>
          <p>List a product and start receiving bids</p>
        </div>

        <form onSubmit={handleSubmit} className="create-form">
          {/* Basic Info Section */}
          <section className="form-section">
            <h2>Product Information</h2>

            <div className="form-group">
              <label>Product Title *</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="E.g., iPhone 13 Pro Max 256GB"
                className={errors.title ? 'input-error' : ''}
              />
              {errors.title && <span className="error-text">{errors.title}</span>}
            </div>

            <div className="form-group">
              <label>Category *</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className={errors.category ? 'input-error' : ''}
              >
                <option value="">Select a category</option>
                {categories.map(cat => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
              {errors.category && <span className="error-text">{errors.category}</span>}
            </div>

            <div className="form-group">
              <label>Product Condition *</label>
              <div className="condition-options">
                {PRODUCT_CONDITIONS.map(condition => (
                  <label key={condition.value} className="radio-label">
                    <input
                      type="radio"
                      name="condition"
                      value={condition.value}
                      checked={formData.condition === condition.value}
                      onChange={handleChange}
                    />
                    {condition.label}
                  </label>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label>Description</label>
              <ReactQuill
                theme="snow"
                value={formData.description}
                onChange={handleDescriptionChange}
                placeholder="Describe your product in detail..."
              />
            </div>
          </section>

          {/* Images Section */}
          <section className="form-section">
            <h2>Product Images</h2>
            <div className="image-upload">
              <label className="upload-area">
                <Upload size={32} />
                <span>Click to upload or drag and drop</span>
                <small>PNG, JPG, GIF up to 5MB. Max 10 images.</small>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                />
              </label>

              {imagePreviews.length > 0 && (
                <div className="image-previews">
                  {imagePreviews.map((preview, idx) => (
                    <div key={idx} className="image-preview">
                      <img src={preview} alt={`Preview ${idx}`} />
                      <button
                        type="button"
                        onClick={() => removeImage(idx)}
                        className="btn-remove"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {errors.images && <span className="error-text">{errors.images}</span>}
            </div>
          </section>

          {/* Pricing Section */}
          <section className="form-section">
            <h2>Auction Pricing</h2>

            <div className="form-row">
              <div className="form-group">
                <label>Starting Price (₫) *</label>
                <input
                  type="number"
                  name="startPrice"
                  value={formData.startPrice}
                  onChange={handleChange}
                  placeholder="0"
                  min="0"
                  className={errors.startPrice ? 'input-error' : ''}
                />
                {errors.startPrice && <span className="error-text">{errors.startPrice}</span>}
              </div>

              <div className="form-group">
                <label>Minimum Increment (₫) *</label>
                <input
                  type="number"
                  name="minIncrement"
                  value={formData.minIncrement}
                  onChange={handleChange}
                  placeholder="0"
                  min="0"
                  className={errors.minIncrement ? 'input-error' : ''}
                />
                {errors.minIncrement && <span className="error-text">{errors.minIncrement}</span>}
              </div>

              <div className="form-group">
                <label>Buy Now Price (Optional)</label>
                <input
                  type="number"
                  name="buyNowPrice"
                  value={formData.buyNowPrice}
                  onChange={handleChange}
                  placeholder="0"
                  min="0"
                />
              </div>
            </div>
          </section>

          {/* Timing Section */}
          <section className="form-section">
            <h2>Auction Timing</h2>

            <div className="form-row">
              <div className="form-group">
                <label>Start Time *</label>
                <input
                  type="datetime-local"
                  name="startTime"
                  value={formData.startTime}
                  onChange={handleChange}
                  className={errors.startTime ? 'input-error' : ''}
                />
                {errors.startTime && <span className="error-text">{errors.startTime}</span>}
              </div>

              <div className="form-group">
                <label>End Time *</label>
                <input
                  type="datetime-local"
                  name="endTime"
                  value={formData.endTime}
                  onChange={handleChange}
                  className={errors.endTime ? 'input-error' : ''}
                />
                {errors.endTime && <span className="error-text">{errors.endTime}</span>}
              </div>
            </div>
          </section>

          {/* Shipping Section */}
          <section className="form-section">
            <h2>Shipping Information</h2>

            <div className="form-row">
              <div className="form-group">
                <label>Location</label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="E.g., Ho Chi Minh City"
                />
              </div>

              <div className="form-group">
                <label>Shipping Cost (₫)</label>
                <input
                  type="number"
                  name="shippingCost"
                  value={formData.shippingCost}
                  onChange={handleChange}
                  placeholder="0"
                  min="0"
                />
              </div>

              <div className="form-group">
                <label>Shipping Method</label>
                <select name="shippingMethod" value={formData.shippingMethod} onChange={handleChange}>
                  <option>Standard</option>
                  <option>Express</option>
                  <option>Pickup</option>
                </select>
              </div>
            </div>
          </section>

          {/* Submit */}
          <div className="form-actions">
            <button type="submit" disabled={loading} className="btn btn-primary btn-lg">
              {loading ? 'Creating...' : 'Create Auction'}
            </button>
            <button type="button" onClick={() => navigate('/profile')} className="btn btn-secondary btn-lg">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}