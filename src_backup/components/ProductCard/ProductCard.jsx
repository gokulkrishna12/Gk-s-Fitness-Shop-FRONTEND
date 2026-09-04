import { Link } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';
import { useCart } from '../../context/CartContext'; // <-- Imported Cart Context
import './ProductCard.scss';

const ProductCard = ({ product }) => {
    const { addToCart } = useCart(); // <-- Destructured addToCart function

    // Use the first image from the array, or a fallback if none exist
    const mainImage = product.images?.[0] || 'https://via.placeholder.com/300x300?text=No+Image';

    return (
        <div className="product-card">
            <Link to={`/product/${product._id}`} className="card-img-wrapper">
                <img src={mainImage} alt={product.name} />
            </Link>

            <div className="card-body">
                <span className="category">{product.category?.name || 'Gear'}</span>
                <Link to={`/product/${product._id}`} className="product-name">
                    <h3>{product.name}</h3>
                </Link>

                <div className="card-footer">
                    <span className="price">₹{product.price}</span>
                    {/* <-- Updated button to trigger addToCart with qty 1 --> */}
                    <button
                        className="btn-add"
                        aria-label="Add to cart"
                        onClick={() => addToCart(product, 1)}
                    >
                        <ShoppingCart size={18} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProductCard;