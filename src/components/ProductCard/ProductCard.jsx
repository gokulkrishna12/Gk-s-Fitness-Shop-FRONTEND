import { useNavigate } from 'react-router-dom';
import { ShoppingCart, Heart, Zap, Eye, Star } from 'lucide-react';
import { useShop } from '../../context/ShopContext';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'sonner';
import './ProductCard.scss';

const ProductCard = ({ product }) => {
    const { addToCart, toggleWishlist, isInWishlist } = useShop();
    const { isAuthenticated } = useAuth();
    const navigate = useNavigate();

    const pid = product?._id || product?.id;
    const isWishlisted = isInWishlist ? isInWishlist(pid) : false;

    const mainImage =
        (Array.isArray(product?.images) && product.images[0]) ||
        product?.image ||
        'https://via.placeholder.com/300x300?text=No+Image';

    // 🔥 SMART STOCK FALLBACK: Checks all possible database field names and defaults safely to 10
    const rawStock = product?.countInStock ?? product?.stock ?? product?.quantity ?? product?.qty;
    const stockCount = (rawStock !== undefined && rawStock !== null) ? Number(rawStock) : 10;
    const isOutOfStock = stockCount <= 0;

    let displayReviews = product?.numReviews || 0;
    let displayRating = product?.rating || 0;

    if (product?.reviews && product.reviews.length > 0) {
        displayReviews = product.reviews.length;
        displayRating = product.reviews.reduce((acc, item) => acc + item.rating, 0) / displayReviews;
    }

    const handleCardClick = (e) => {
        if (e.target.closest('button')) return;
        if (pid) navigate(`/catalog/${pid}`);
    };

    const handleWishlist = (e) => {
        e.stopPropagation();
        if (!isAuthenticated) {
            toast.error("Please login to access this feature!");
            navigate('/login');
            return;
        }
        if (toggleWishlist) toggleWishlist(product);
    };

    const handleAddToCart = (e) => {
        e.stopPropagation();
        if (!isAuthenticated) {
            toast.error("Please login to access this feature!");
            navigate('/login');
            return;
        }
        if (addToCart) addToCart(product);
    };

    const handleBuyNow = (e) => {
        e.stopPropagation();
        if (!isAuthenticated) {
            toast.error("Please login to access this feature!");
            navigate('/login');
            return;
        }
        if (pid) {
            navigate('/checkout', {
                state: { directItem: { product, qty: 1 } }
            });
        }
    };

    const handleView = (e) => {
        e.stopPropagation();
        if (pid) navigate(`/catalog/${pid}`);
    };

    return (
        <div className="product-card" onClick={handleCardClick}>
            <div className="product-card-image-wrapper">
                <img src={mainImage} alt={product?.name || 'Product'} />
                {product?.category && <span className="product-card-badge">{product.category}</span>}
                <button
                    type="button"
                    className={`btn-wishlist ${isWishlisted ? 'active' : ''}`}
                    onClick={handleWishlist}
                    title="Wishlist"
                >
                    <Heart size={20} fill={isWishlisted ? '#e63946' : 'none'} />
                </button>
            </div>

            <div className="product-card-content">
                <span className="product-card-category">{product?.category || 'Gear'}</span>
                <h3 className="product-card-title">{product?.name || 'Unnamed Product'}</h3>

                <div className="product-card-rating">
                    <Star
                        size={15}
                        fill={displayRating > 0 ? "#fca311" : "none"}
                        color="#fca311"
                    />
                    <span>{displayRating.toFixed(1)} ({displayReviews} reviews)</span>
                </div>

                <div className={`product-card-stock ${isOutOfStock ? 'out-of-stock' : 'in-stock'}`}>
                    {isOutOfStock ? 'Out of Stock' : `In Stock (${stockCount})`}
                </div>

                <div className="product-card-footer">
                    <span className="product-card-price">{'\u20B9'}{product?.price || 0}</span>
                </div>

                <div className="product-card-actions">
                    <button
                        type="button"
                        className="btn-add"
                        onClick={handleAddToCart}
                        disabled={isOutOfStock}
                        title={isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
                    >
                        <ShoppingCart size={18} />
                    </button>
                    <button
                        type="button"
                        className="btn-view"
                        onClick={handleView}
                        title="View Details"
                    >
                        <Eye size={18} /> View
                    </button>
                    <button
                        type="button"
                        className="btn-buy"
                        onClick={handleBuyNow}
                        disabled={isOutOfStock}
                        title={isOutOfStock ? 'Out of Stock' : 'Buy Now'}
                    >
                        <Zap size={18} /> Order
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProductCard;