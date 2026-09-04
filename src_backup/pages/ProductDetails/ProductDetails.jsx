import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import { ShoppingCart, Star, Camera, Upload, CheckCircle, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';
import { getProductById, addProductReview } from '../../api/productApi';
import { useCart } from '../../context/CartContext'; // <-- Imported Cart Context

// Swiper core styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import './ProductDetails.scss';

const ProductDetails = () => {
    const { id } = useParams();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);

    const { addToCart } = useCart(); // <-- Destructured addToCart function

    // Review Form State
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [submittingReview, setSubmittingReview] = useState(false);

    useEffect(() => {
        fetchProduct();
    }, [id]);

    const fetchProduct = async () => {
        try {
            const data = await getProductById(id);
            setProduct(data);
        } catch (error) {
            toast.error('Failed to load product details');
        } finally {
            setLoading(false);
        }
    };

    // Handle Image Selection (Gallery or Camera)
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file)); // Show preview instantly
        }
    };

    const handleReviewSubmit = async (e) => {
        e.preventDefault();
        if (!comment) return toast.error('Please write a comment');

        setSubmittingReview(true);

        // Construct FormData to send text AND the file to Multer
        const formData = new FormData();
        formData.append('rating', rating);
        formData.append('comment', comment);
        if (imageFile) {
            formData.append('image', imageFile); // 'image' matches upload.single('image') in backend
        }

        try {
            await addProductReview(id, formData);
            toast.success('Review posted successfully!');

            // Reset form and refresh product to show new review
            setComment('');
            setRating(5);
            setImageFile(null);
            setImagePreview(null);
            fetchProduct();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to post review');
        } finally {
            setSubmittingReview(false);
        }
    };

    if (loading) return <div className="loader">Loading Product...</div>;
    if (!product) return <div className="loader">Product not found.</div>;

    return (
        <div className="product-details-page">
            {/* TOP SECTION: Images and Info */}
            <div className="product-hero">

                {/* Left: Swiper Image Carousel */}
                <div className="image-slider-container">
                    {product.images && product.images.length > 0 ? (
                        <Swiper
                            modules={[Navigation, Pagination]}
                            navigation
                            pagination={{ clickable: true }}
                            className="product-swiper"
                        >
                            {product.images.map((imgUrl, index) => (
                                <SwiperSlide key={index}>
                                    <img src={imgUrl} alt={`${product.name} view ${index + 1}`} />
                                </SwiperSlide>
                            ))}
                        </Swiper>
                    ) : (
                        <div className="no-image-placeholder">
                            <ImageIcon size={48} />
                            <p>No images available</p>
                        </div>
                    )}
                </div>

                {/* Right: Product Info & Cart */}
                <div className="product-info">
                    <span className="category-badge">{product.category?.name || 'Equipment'}</span>
                    <h1>{product.name}</h1>
                    <p className="price">₹{product.price}</p>

                    <p className="description">{product.description}</p>

                    {/* <-- Updated button to trigger addToCart --> */}
                    <button
                        className="btn-add-cart"
                        onClick={() => addToCart(product, 1)}
                    >
                        <ShoppingCart size={20} /> Add to Cart
                    </button>
                </div>
            </div>

            {/* BOTTOM SECTION: Reviews & Uploads */}
            <div className="reviews-section">
                <h2>Customer Reviews</h2>

                {/* Review Submission Form */}
                <div className="add-review-card">
                    <h3>Write a Review</h3>
                    <form onSubmit={handleReviewSubmit}>
                        <div className="form-group">
                            <label>Rating (1-5)</label>
                            <select value={rating} onChange={(e) => setRating(e.target.value)}>
                                {[5, 4, 3, 2, 1].map(num => (
                                    <option key={num} value={num}>{num} Stars</option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Your Experience</label>
                            <textarea
                                rows="3"
                                placeholder="How was the product?"
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                            ></textarea>
                        </div>

                        {/* Camera / Photo Upload UI */}
                        <div className="upload-group">
                            <label className="upload-label">
                                <input
                                    type="file"
                                    accept="image/*"
                                    capture="environment"
                                    onChange={handleImageChange}
                                    hidden
                                />
                                <div className="upload-btn">
                                    <Camera size={20} /> / <Upload size={20} />
                                    <span>{imageFile ? 'Change Photo' : 'Snap or Upload Photo'}</span>
                                </div>
                            </label>

                            {imagePreview && (
                                <div className="image-preview">
                                    <img src={imagePreview} alt="Review preview" />
                                    <span className="preview-badge"><CheckCircle size={14} /> Attached</span>
                                </div>
                            )}
                        </div>

                        <button type="submit" className="btn-submit-review" disabled={submittingReview}>
                            {submittingReview ? 'Uploading...' : 'Post Review'}
                        </button>
                    </form>
                </div>

                {/* Display Existing Reviews */}
                <div className="reviews-list">
                    {product.reviews?.length === 0 ? (
                        <p className="no-reviews">No reviews yet. Be the first!</p>
                    ) : (
                        product.reviews?.map((review) => (
                            <div key={review._id} className="review-card">
                                <div className="review-header">
                                    <div className="stars">
                                        {[...Array(review.rating)].map((_, i) => <Star key={i} size={16} fill="#e50914" color="#e50914" />)}
                                    </div>
                                </div>
                                <p className="review-comment">{review.comment}</p>
                                {/* Display Cloudinary Image if it exists */}
                                {review.image && (
                                    <div className="review-image">
                                        <img src={review.image} alt="User review" />
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProductDetails;