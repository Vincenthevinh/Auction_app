import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { fetchFeaturedProducts } from '../redux/slices/productSlice';
import ProductCard from '../components/ProductCard';
import { TrendingUp, Clock, DollarSign } from 'lucide-react';
import '../styles/Home.css';

export default function Home() {
  const dispatch = useDispatch();
  const { featured } = useSelector(state => state.products);

  useEffect(() => {
    dispatch(fetchFeaturedProducts('ending-soon'));
    dispatch(fetchFeaturedProducts('trending'));
    dispatch(fetchFeaturedProducts('high-price'));
  }, [dispatch]);

  return (
    <div className="home">
      {/* Hero Section */}
      <section className="hero">
        <div className="container">
          <div className="hero-content">
            <h1>Welcome to AuctionHub</h1>
            <p>Discover amazing deals and bid on products you love</p>
            <div className="hero-actions">
              <Link to="/products" className="btn btn-primary btn-lg">
                Start Browsing
              </Link>
              <a href="#featured" className="btn btn-secondary btn-lg">
                See Featured Items
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Sections */}
      <section className="featured-section" id="featured">
        <div className="container">
          {/* Ending Soon */}
          <div className="section-block">
            <div className="section-header">
              <Clock size={28} />
              <div>
                <h2>Ending Soon</h2>
                <p>Don't miss out on these hot items</p>
              </div>
              <Link to="/products?sort=ending-soon" className="view-all">
                View All →
              </Link>
            </div>
            <div className="products-grid">
              {featured['ending-soon']?.map(product => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          </div>

          {/* Trending */}
          <div className="section-block">
            <div className="section-header">
              <TrendingUp size={28} />
              <div>
                <h2>Trending Now</h2>
                <p>Most bids in the last 24 hours</p>
              </div>
              <Link to="/products?sort=bids" className="view-all">
                View All →
              </Link>
            </div>
            <div className="products-grid">
              {featured['trending']?.map(product => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          </div>

          {/* High Price */}
          <div className="section-block">
            <div className="section-header">
              <DollarSign size={28} />
              <div>
                <h2>Premium Items</h2>
                <p>Highest priced auctions</p>
              </div>
              <Link to="/products?sort=price-desc" className="view-all">
                View All →
              </Link>
            </div>
            <div className="products-grid">
              {featured['high-price']?.map(product => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-content">
            <h2>Want to Sell?</h2>
            <p>Create an account as a seller and start listing your items</p>
            <Link to="/seller/create-product" className="btn btn-primary">
              Start Selling
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}