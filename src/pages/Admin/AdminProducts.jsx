import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Trash2, Plus, X, Upload, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';
import { getProducts, deleteProductApi, createProductApi } from '../../api/productApi';
import './Admin.scss';

const AdminProducts = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    // Modal & Form State
    const [showModal, setShowModal] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        price: '',
        description: '',
        countInStock: '',
        category: 'Equipment' // Default fallback
    });

    useEffect(() => {
        fetchInventory();
    }, []);

    const fetchInventory = async () => {
        try {
            const data = await getProducts();
            setProducts(data);
        } catch (error) {
            toast.error('Failed to load products');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id, name) => {
        if (!window.confirm(`Are you sure you want to delete ${name}?`)) return;
        try {
            await deleteProductApi(id);
            toast.success(`${name} deleted successfully!`);
            setProducts(products.filter(p => p._id !== id));
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to delete product');
        }
    };

    // Form Handlers
    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!imageFile) return toast.error('Please upload a product image!');

        setSubmitting(true);
        const data = new FormData();
        data.append('name', formData.name);
        data.append('price', formData.price);
        data.append('description', formData.description);
        data.append('countInStock', formData.countInStock);
        // If your backend expects a category ID instead of a string, you can omit this or adjust based on your Category model
        data.append('category', formData.category);
        data.append('image', imageFile); // Matches your backend upload.single('image')

        try {
            await createProductApi(data);
            toast.success('Product added successfully!');

            // Close modal, reset form, and refresh the table
            setShowModal(false);
            setImageFile(null);
            setImagePreview(null);
            setFormData({ name: '', price: '', description: '', countInStock: '', category: 'Equipment' });
            fetchInventory();

        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to add product');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div className="loader">Loading Inventory...</div>;

    return (
        <div className="admin-page">
            <div className="admin-header">
                <h1>Dashboard Overview</h1>
                <div className="admin-nav">
                    <Link to="/admin/orders">Manage Orders</Link>
                    <Link to="/admin/products" className="active">Manage Products</Link>
                </div>
            </div>

            <div className="admin-card">
                <div className="card-header">
                    <h2>Product Inventory ({products.length})</h2>
                    <button className="btn-add-product" onClick={() => setShowModal(true)}>
                        <Plus size={18} /> New Product
                    </button>
                </div>

                <div className="table-responsive">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Image</th>
                                <th>Name</th>
                                <th>Price</th>
                                <th>Stock</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {products.length === 0 ? (
                                <tr><td colSpan="5" style={{ textAlign: 'center', padding: '2rem' }}>No products yet. Add your first item!</td></tr>
                            ) : (
                                products.map(product => (
                                    <tr key={product._id}>
                                        <td>
                                            <img className="product-thumb" src={product.images?.[0] || 'https://via.placeholder.com/50'} alt="product" />
                                        </td>
                                        <td className="bold">{product.name}</td>
                                        <td className="price">₹{product.price}</td>
                                        <td>{product.countInStock > 0 ? product.countInStock : <span className="text-red" style={{ color: '#ef4444' }}>Out of Stock</span>}</td>
                                        <td>
                                            <button className="btn-delete" onClick={() => handleDelete(product._id, product.name)}>
                                                <Trash2 size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* --- ADD PRODUCT MODAL --- */}
            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h2>Add New Gear</h2>
                            <button className="btn-close" onClick={() => setShowModal(false)}><X size={24} /></button>
                        </div>

                        <form onSubmit={handleSubmit} className="admin-form">
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Product Name</label>
                                    <input type="text" name="name" value={formData.name} onChange={handleInputChange} placeholder="e.g. 20kg Dumbbell Set" required />
                                </div>
                                <div className="form-group">
                                    <label>Price (₹)</label>
                                    <input type="number" name="price" value={formData.price} onChange={handleInputChange} placeholder="2500" required />
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Stock Quantity</label>
                                    <input type="number" name="countInStock" value={formData.countInStock} onChange={handleInputChange} placeholder="50" required />
                                </div>
                                <div className="form-group">
                                    <label>Category</label>
                                    <input type="text" name="category" value={formData.category} onChange={handleInputChange} placeholder="Supplements, Gear, etc." required />
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Description</label>
                                <textarea name="description" value={formData.description} onChange={handleInputChange} rows="3" placeholder="High quality cast iron..." required></textarea>
                            </div>

                            <div className="form-group upload-group">
                                <label>Product Image</label>
                                <div className="image-upload-wrapper">
                                    <label className="upload-btn">
                                        <input type="file" accept="image/*" onChange={handleImageChange} hidden />
                                        <Upload size={20} /> Choose Image File
                                    </label>
                                    {imagePreview ? (
                                        <img src={imagePreview} alt="Preview" className="img-preview" />
                                    ) : (
                                        <div className="img-placeholder"><ImageIcon size={30} /></div>
                                    )}
                                </div>
                            </div>

                            <button type="submit" className="btn-submit-modal" disabled={submitting}>
                                {submitting ? 'Uploading to Cloudinary...' : 'Save Product'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminProducts;