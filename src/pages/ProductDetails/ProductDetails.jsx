import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ShoppingCart, Zap, Star, Camera, Upload, Trash2, X, ChevronLeft, ChevronRight, AlertTriangle } from 'lucide-react';
import axiosClient from '../../api/axiosClient';
import { useShop } from '../../context/ShopContext';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'sonner';
import ProductCard from '../../components/ProductCard/ProductCard';
import './ProductDetails.scss';

const ProductDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { addToCart } = useShop();
    const { isAuthenticated, user, isAdmin } = useAuth();

    const [product, setProduct] = useState(null);
    const [relatedProducts, setRelatedProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    const [activeImageIndex, setActiveImageIndex] = useState(0);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Review States
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [comment, setComment] = useState('');
    const [reviewImage, setReviewImage] = useState(null);
    const [reviewPreview, setReviewPreview] = useState(null);
    const [submittingReview, setSubmittingReview] = useState(false);

    // Delete Modal State
    const [reviewToDelete, setReviewToDelete] = useState(null);

    useEffect(() => {
        const fetchProductData = async () => {
            try {
                const res = await axiosClient.get(`/products/${id}`);
                setProduct(res.data);

                const allProdsRes = await axiosClient.get('/products');
                const allProds = allProdsRes.data.products || allProdsRes.data || [];

                let related = allProds.filter(p => p.category === res.data.category && (p._id || p.id) !== id).slice(0, 4);

                if (related.length === 0) {
                    related = allProds.filter(p => (p._id || p.id) !== id).slice(0, 4);
                }

                setRelatedProducts(related);

            } catch (error) {
                toast.error("Failed to load product details");
            } finally {
                setLoading(false);
            }
        };
        fetchProductData();

        setActiveImageIndex(0);
        setRating(0);
        setComment('');
        clearReviewImage();
    }, [id]);

    const handleReviewImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setReviewImage(file);
            setReviewPreview(URL.createObjectURL(file));
        }
    };

    const clearReviewImage = () => {
        setReviewImage(null);
        setReviewPreview(null);
    };

    const handleAddToCartClick = () => {
        if (!isAuthenticated) {
            toast.error("Please login to access this feature!");
            navigate('/login');
            return;
        }
        addToCart(product);
    };

    const handleBuyNowClick = () => {
        if (!isAuthenticated) {
            toast.error("Please login to access this feature!");
            navigate('/login');
            return;
        }
        navigate('/checkout', { state: { directItem: { product, qty: 1 } } });
    };

    const handleReviewSubmit = async (e) => {
        e.preventDefault();

        if (!isAuthenticated) {
            toast.error("Please login to access this feature!");
            return navigate('/login');
        }
        if (rating === 0) return toast.error("Please select a star rating!");

        const formData = new FormData();
        formData.append('rating', rating);
        formData.append('comment', comment);
        if (reviewImage) formData.append('image', reviewImage);

        setSubmittingReview(true);
        try {
            await axiosClient.post(`/products/${id}/reviews`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            toast.success("Review submitted successfully!");
            setComment('');
            setRating(0);
            clearReviewImage();

            const res = await axiosClient.get(`/products/${id}`);
            setProduct(res.data);
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to submit review");
        } finally {
            setSubmittingReview(false);
        }
    };

    const confirmDeleteReview = async () => {
        if (!reviewToDelete) return;
        try {
            await axiosClient.delete(`/products/${id}/reviews/${reviewToDelete}`);
            toast.success("Review removed successfully.");

            const res = await axiosClient.get(`/products/${id}`);
            setProduct(res.data);
        } catch (error) {
            toast.error("Failed to delete review");
        } finally {
            setReviewToDelete(null);
        }
    };

    if (loading) return <div className="product-details-page"><div className="loader container">Loading...</div></div>;
    if (!product) return <div className="product-details-page"><div className="container"><h2>Product not found</h2></div></div>;

    const images = product.images?.length > 0 ? product.images : [product.image || 'https://via.placeholder.com/800x800?text=No+Image'];

    // Auto-fill to 10 if stock is 0
    const rawStock = product.countInStock ?? product.stock;
    const stockCount = (rawStock !== undefined && rawStock !== null && Number(rawStock) > 0) ? Number(rawStock) : 10;
    const isOutOfStock = stockCount <= 0;

    // 🔥 THE FIX: Live Dynamic Math based on the reviews array!
    const liveNumReviews = product.reviews?.length || 0;
    const liveRating = liveNumReviews > 0
        ? product.reviews.reduce((acc, item) => item.rating + acc, 0) / liveNumReviews
        : 0;

    return (
        <div className="product-details-page">

            {reviewToDelete && (
                <div className="custom-modal-overlay">
                    <div className="custom-modal">
                        <button className="modal-close" onClick={() => setReviewToDelete(null)}><X size={24} /></button>
                        <div className="modal-icon"><AlertTriangle size={40} color="#e63946" /></div>
                        <h3>Remove Review?</h3>
                        <p>Are you sure you want to delete this review? This action cannot be undone.</p>
                        <div className="modal-actions">
                            <button className="btn-cancel" onClick={() => setReviewToDelete(null)}>KEEP IT</button>
                            <button className="btn-confirm-delete" onClick={confirmDeleteReview}>YES, REMOVE</button>
                        </div>
                    </div>
                </div>
            )}

            {isModalOpen && (
                <div className="fullscreen-modal" onClick={() => setIsModalOpen(false)}>
                    <button className="modal-close" onClick={() => setIsModalOpen(false)}><X size={32} /></button>
                    {images.length > 1 && <button className="modal-prev" onClick={(e) => { e.stopPropagation(); setActiveImageIndex((prev) => (prev - 1 + images.length) % images.length); }}><ChevronLeft size={48} /></button>}
                    <div className="modal-image-wrapper" onClick={(e) => e.stopPropagation()}>
                        <img src={images[activeImageIndex]} alt="Fullscreen view" />
                    </div>
                    {images.length > 1 && <button className="modal-next" onClick={(e) => { e.stopPropagation(); setActiveImageIndex((prev) => (prev + 1) % images.length); }}><ChevronRight size={48} /></button>}
                </div>
            )}

            <div className="container">
                <div className="product-details-grid">
                    <div className="product-gallery">
                        <div className="main-image-container" onClick={() => setIsModalOpen(true)} title="Click to expand">
                            <img src={images[activeImageIndex]} alt={product.name} />
                            <div className="expand-hint">Click to Enlarge</div>
                        </div>
                        <div className="thumbnail-slider">
                            {images.map((img, idx) => (
                                <button key={idx} className={`thumb-btn ${activeImageIndex === idx ? 'active' : ''}`} onClick={() => setActiveImageIndex(idx)}>
                                    <img src={img} alt={`Thumbnail ${idx + 1}`} />
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="product-info-section">
                        <span className="badge-category">{product.category}</span>
                        <h1>{product.name}</h1>
                        <div className="rating-row">
                            <Star size={18} fill="#fca311" color="#fca311" />
                            {/* 🔥 Replaced with liveRating & liveNumReviews */}
                            <span>{liveRating.toFixed(1)} ({liveNumReviews} reviews)</span>
                        </div>
                        <div className="price-tag">₹{product.price}</div>
                        <div className={`stock-status ${isOutOfStock ? 'out' : 'in'}`}>
                            {isOutOfStock ? 'Out of Stock' : `In Stock (${stockCount} units available)`}
                        </div>
                        <p className="description">{product.description}</p>
                        <div className="action-buttons">
                            <button className="btn-cart" onClick={handleAddToCartClick} disabled={isOutOfStock}>
                                <ShoppingCart size={20} /> Add to Cart
                            </button>
                            <button className="btn-order" onClick={handleBuyNowClick} disabled={isOutOfStock}>
                                <Zap size={20} /> Buy Now
                            </button>
                        </div>
                    </div>
                </div>

                <div className="reviews-section">
                    <h2>Athlete Reviews & Community Photos</h2>
                    <div className="reviews-grid">

                        <form className="review-form order-summary-style" onSubmit={handleReviewSubmit}>
                            <h3>Leave Your Review</h3>
                            <div className="form-group interactive-rating">
                                <label>Rating</label>
                                <div className="stars-container">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <Star key={star} size={32} onClick={() => setRating(star)} onMouseEnter={() => setHoverRating(star)} onMouseLeave={() => setHoverRating(0)} fill={(hoverRating || rating) >= star ? "#fca311" : "none"} color={(hoverRating || rating) >= star ? "#fca311" : "rgba(255,255,255,0.3)"} className="clickable-star" />
                                    ))}
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Your Feedback</label>
                                <textarea rows="3" value={comment} onChange={(e) => setComment(e.target.value)} placeholder="How did this product impact your training?" required />
                            </div>
                            <div className="form-group camera-group">
                                <label>Upload Photo / Use Camera</label>
                                <div className="dual-upload-buttons">
                                    <label className="camera-btn primary">
                                        <input type="file" accept="image/*" capture="environment" onChange={handleReviewImageChange} hidden />
                                        <Camera size={18} /> Take Photo
                                    </label>
                                    <label className="camera-btn secondary">
                                        <input type="file" accept="image/*" onChange={handleReviewImageChange} hidden />
                                        <Upload size={18} /> Upload Gallery
                                    </label>
                                </div>
                                {reviewPreview && (
                                    <div className="review-preview-alert">
                                        <div className="preview-img-wrapper"><img src={reviewPreview} alt="Review Preview" /></div>
                                        <div className="preview-actions">
                                            <span className="success-text">Image Attached</span>
                                            <button type="button" className="btn-delete-preview" onClick={clearReviewImage}><Trash2 size={16} /> Remove</button>
                                        </div>
                                    </div>
                                )}
                            </div>
                            <button type="submit" className="btn-submit-review" disabled={submittingReview}>
                                {submittingReview ? 'Submitting...' : 'Post Review'}
                            </button>
                        </form>

                        <div className="reviews-list">
                            {product.reviews && product.reviews.length > 0 ? (
                                product.reviews.map((rev, idx) => {

                                    const isAuthor = user?._id === rev.user;
                                    const authorName = rev.name || (isAuthor ? user?.name : 'Athlete');

                                    return (
                                        <div key={idx} className="review-card order-summary-style">
                                            <div className="review-header">
                                                <div className="reviewer-info">
                                                    <strong className="verified-label">
                                                        Verified Athlete
                                                    </strong>
                                                    <span className="reviewer-name" style={{ textTransform: 'capitalize' }}>
                                                        {authorName}
                                                    </span>
                                                    <span className="review-date">
                                                        {rev.createdAt ? new Date(rev.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : 'Just now'}
                                                    </span>
                                                </div>

                                                <div className="review-actions-wrapper">
                                                    <div className="stars">
                                                        {[...Array(5)].map((_, i) => (
                                                            <Star key={i} size={16} fill={i < rev.rating ? "#fca311" : "none"} color={i < rev.rating ? "#fca311" : "rgba(255,255,255,0.2)"} />
                                                        ))}
                                                    </div>
                                                    {(isAuthor || isAdmin) && (
                                                        <button className="btn-delete-review" onClick={() => setReviewToDelete(rev._id)} title="Delete your review">
                                                            <Trash2 size={15} /> Delete
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                            <p className="review-comment">{rev.comment}</p>
                                            {rev.image && (
                                                <div className="review-photo" onClick={() => window.open(rev.image, '_blank')}>
                                                    <img src={rev.image} alt="User Review" />
                                                </div>
                                            )}
                                        </div>
                                    );
                                })
                            ) : (
                                <p className="no-reviews order-summary-style">No reviews yet. Click the stars above to be the first athlete to review this product!</p>
                            )}
                        </div>
                    </div>
                </div>

                {relatedProducts.length > 0 && (
                    <div className="related-gear-section">
                        <h2>Related Gear</h2>
                        <div className="products-grid">
                            {relatedProducts.map(prod => (
                                <ProductCard key={prod._id || prod.id} product={prod} />
                            ))}
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
};

export default ProductDetails;