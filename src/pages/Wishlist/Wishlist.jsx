import { Link } from 'react-router-dom';
import { HeartCrack } from 'lucide-react';
import { useShop } from '../../context/ShopContext';
import ProductCard from '../../components/ProductCard/ProductCard';
import './Wishlist.scss';

const Wishlist = () => {
  // Pull the global wishlist array
  const { wishlist } = useShop();

  // 🔥 SAFETY NET: Filter out any deleted ghost products before rendering
  const safeWishlist = wishlist.filter(product => product != null);

  if (safeWishlist.length === 0) {
    return (
      // OUTER DIV: Stretches the dark background edge-to-edge
      <div className="wishlist-page">
        {/* INNER DIV: Keeps the content perfectly centered */}
        <div className="container">
          <div className="wishlist-empty">
            <HeartCrack size={64} className="empty-icon" />
            <h2>Your Wishlist is Empty</h2>
            <p>Save your favorite gear here to grab them later!</p>
            <Link to="/catalog" className="btn-primary">Explore Gear</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    // OUTER DIV: Stretches the dark background edge-to-edge
    <div className="wishlist-page">
      {/* INNER DIV: Keeps the content perfectly centered */}
      <div className="container">
        <h1>My Wishlist</h1>
        <div className="wishlist-grid">
          {/* Reuse our brand new ProductCard to display wishlist items! */}
          {safeWishlist.map(product => (
            <ProductCard key={product._id || product.id} product={product} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Wishlist;