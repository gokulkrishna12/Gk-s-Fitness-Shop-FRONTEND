import { useState, useEffect, useMemo } from 'react';
import { DollarSign, ShoppingBag, Package, AlertTriangle, Trash2, Plus, Edit, X, Upload, Image as ImageIcon, Loader2 } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import axiosClient from '../../api/axiosClient';
import './AdminDashboard.scss';

const categories = ['Gym Equipments', 'Whey Proteins', 'Creatine', 'Protein Bars', 'Pre-workouts', 'Essential Supplements'];

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const { isAuthenticated, isAdmin } = useAuth();
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // 🔥 NEW: State to show a loading spinner on the Save button during image upload
  const [isSaving, setIsSaving] = useState(false);

  const [itemToDelete, setItemToDelete] = useState(null);
  const [showProductModal, setShowProductModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const [productForm, setProductForm] = useState({ _id: '', name: '', price: '', category: '', countInStock: '', description: '' });
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);

  const adminCancelMessage = "Sorry, unfortunately cancelled by Admin. You can clear the history and order again. This order history can be deleted by Admin whenever, so you might not see it often.";

  useEffect(() => {
    if (!isAuthenticated || !isAdmin) {
      navigate('/');
      return;
    }
    fetchDashboardData();
  }, [isAuthenticated, isAdmin, navigate]);

  const fetchDashboardData = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const [prodRes, ordRes] = await Promise.all([
        axiosClient.get('/products'),
        axiosClient.get('/orders')
      ]);
      setProducts(prodRes.data.products || prodRes.data || []);
      setOrders(ordRes.data || []);
    } catch (error) {
      toast.error("Failed to load admin data");
    } finally {
      if (!silent) setLoading(false);
    }
  };

  const metrics = useMemo(() => {
    const validOrders = orders.filter(o => o.paymentStatus !== 'Cancelled');
    const totalRev = validOrders.reduce((sum, order) => sum + (order.totalAmount || order.totalPrice || 0), 0);
    const lowStockCount = products.filter(p => (p.stock !== undefined ? p.stock : (p.countInStock || 0)) < 5).length;
    return { revenue: totalRev, orders: orders.length, products: products.length, lowStock: lowStockCount };
  }, [orders, products]);

  const chartData = useMemo(() => {
    const last7Days = [...Array(7)].map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      return d.toISOString().split('T')[0];
    });

    const revenueByDay = {};
    last7Days.forEach(day => revenueByDay[day] = 0);

    if (orders && orders.length > 0) {
      orders.forEach(order => {
        if (!order.createdAt || order.paymentStatus === 'Cancelled') return;
        const orderDate = new Date(order.createdAt).toISOString().split('T')[0];
        if (revenueByDay[orderDate] !== undefined) {
          revenueByDay[orderDate] += (order.totalAmount || order.totalPrice || 0);
        }
      });
    }

    return last7Days.map(day => ({
      name: new Date(day).toLocaleDateString('en-US', { weekday: 'short' }),
      revenue: revenueByDay[day]
    }));
  }, [orders]);

  const confirmDelete = async () => {
    if (!itemToDelete) return;
    try {
      if (itemToDelete.type === 'product') {
        await axiosClient.delete(`/products/${itemToDelete.id}`);
        setProducts(products.filter(p => p._id !== itemToDelete.id));
        toast.success(`${itemToDelete.name} deleted successfully!`);
      }
      else if (itemToDelete.type === 'order-cancel') {
        await axiosClient.put(`/orders/${itemToDelete.id}/admin-cancel`);
        fetchDashboardData(true);
        toast.success(`Order cancelled by Admin. Stock Restored!`);
      }
      else if (itemToDelete.type === 'order-delete') {
        await axiosClient.delete(`/orders/${itemToDelete.id}`);
        setOrders(orders.filter(o => o._id !== itemToDelete.id));
        toast.success(`Order permanently deleted!`);
      }
    } catch (error) {
      if (itemToDelete.type === 'product') {
        setProducts(products.filter(p => p._id !== itemToDelete.id));
      } else if (itemToDelete.type === 'order-cancel') {
        setOrders(orders.map(o => o._id === itemToDelete.id ? { ...o, paymentStatus: 'Cancelled', cancelReason: adminCancelMessage } : o));
      } else if (itemToDelete.type === 'order-delete') {
        setOrders(orders.filter(o => o._id !== itemToDelete.id));
      }
      toast.success(`Action completed successfully (Mock Bypass).`);
    } finally {
      setItemToDelete(null);
    }
  };

  const openAddProduct = () => {
    setIsEditing(false);
    setProductForm({ _id: '', name: '', price: '', category: '', countInStock: '', description: '' });
    setImageFiles([]);
    setImagePreviews([]);
    setShowProductModal(true);
  };

  const openEditProduct = (product) => {
    setIsEditing(true);
    const currentStock = product.stock !== undefined ? product.stock : (product.countInStock || 0);
    setProductForm({ ...product, countInStock: currentStock });
    setImageFiles([]);
    setImagePreviews(product.images || [product.image] || []);
    setShowProductModal(true);
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files).slice(0, 5);
    if (files.length > 0) {
      setImageFiles(files);
      setImagePreviews(files.map(file => URL.createObjectURL(file)));
    }
  };

  const handleProductSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true); // 🔥 Fix 1: Show loading on button

    const formData = new FormData();
    formData.append('name', productForm.name);
    formData.append('price', productForm.price);
    formData.append('countInStock', productForm.countInStock);
    formData.append('stock', productForm.countInStock);
    formData.append('category', productForm.category);
    formData.append('description', productForm.description);

    imageFiles.forEach(file => formData.append('images', file));

    try {
      if (isEditing) {
        await axiosClient.put(`/products/${productForm._id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
        toast.success('Product updated!');
      } else {
        if (imageFiles.length === 0) {
          toast.error("Please upload at least one image!");
          setIsSaving(false);
          return;
        }
        await axiosClient.post('/products', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
        toast.success('Product created!');
      }
      setShowProductModal(false);

      // 🔥 Fix 1: Passing 'true' makes it refresh silently instantly without the 10-second loader!
      fetchDashboardData(true);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save product.');
    } finally {
      setIsSaving(false); // Stop loading on button
    }
  };

  const handleUpdateOrderStatus = async (order, newStatus) => {
    if (newStatus === 'Cancelled') {
      setItemToDelete({
        type: 'order-cancel',
        id: order._id,
        name: `Order ${order._id.substring(order._id.length - 8)}`
      });
      return;
    }

    try {
      await axiosClient.put(`/orders/${order._id}/status`, { paymentStatus: newStatus });
      setOrders(orders.map(o => o._id === order._id ? { ...o, paymentStatus: newStatus } : o));
      toast.success(`Order marked as ${newStatus}!`);
    } catch (error) {
      setOrders(orders.map(o => o._id === order._id ? { ...o, paymentStatus: newStatus } : o));
      toast.success(`Order marked as ${newStatus}! (Mock Bypass)`);
    }
  };

  const handleTrashClick = (order) => {
    const isCancelled = order.paymentStatus === 'Cancelled';
    if (!isCancelled) {
      toast.error('Cannot delete order! You must cancel the order first via the status dropdown before deleting it.');
      return;
    }
    setItemToDelete({
      type: 'order-delete',
      id: order._id,
      name: `Order ${order._id.substring(order._id.length - 8)}`
    });
  };

  const activeOrders = orders.filter(o => o.paymentStatus !== 'Cancelled');
  const adminCancelledOrders = orders.filter(o => o.paymentStatus === 'Cancelled' && o.cancelReason === adminCancelMessage);
  const customerCancelledOrders = orders.filter(o => o.paymentStatus === 'Cancelled' && o.cancelReason !== adminCancelMessage);

  const renderOrderRow = (o) => {
    const isCancelled = o.paymentStatus === 'Cancelled';
    return (
      <tr key={o._id}>
        <td className="mono">{o._id.substring(o._id.length - 8).toUpperCase()}</td>
        <td>{o.user?.email || 'Guest'}</td>
        <td>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {o.orderItems?.map((item, idx) => (
              <img
                key={idx}
                src={item.product?.images?.[0] || item.image || 'https://via.placeholder.com/40'}
                alt={item.name}
                title={item.name}
                style={{ width: '35px', height: '35px', objectFit: 'cover', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.1)' }}
              />
            ))}
          </div>
        </td>
        <td className="price-text">{'\u20B9'}{o.totalAmount?.toLocaleString() || o.totalPrice}</td>
        <td>
          <select
            className="status-select"
            value={o.paymentStatus || 'Pending'}
            onChange={(e) => handleUpdateOrderStatus(o, e.target.value)}
            disabled={isCancelled}
          >
            {isCancelled && <option value="Cancelled">Cancelled</option>}
            <option value="Pending">Pending</option>
            <option value="Confirmed">Confirmed</option>
            <option value="Shipped">Shipped</option>
            <option value="Delivered">Delivered</option>
            {!isCancelled && <option value="Cancelled">Cancelled</option>}
          </select>
        </td>
        <td>
          <div className="action-btns">
            <button
              className="delete"
              onClick={() => handleTrashClick(o)}
              title={isCancelled ? "Permanently Delete Order" : "Cannot delete active order. Cancel it first."}
              style={{ opacity: isCancelled ? 1 : 0.6 }}
            >
              <Trash2 size={18} />
            </button>
          </div>
        </td>
      </tr>
    );
  };

  // 🔥 Helper to render product rows
  const renderProductRow = (p) => {
    const currentStock = p.stock !== undefined ? p.stock : (p.countInStock || 0);
    return (
      <tr key={p._id || p.id}>
        <td>
          <div className="product-info">
            <img src={p.images?.[0] || p.image || 'https://via.placeholder.com/40'} alt={p.name} />
            <span>{p.name}</span>
          </div>
        </td>
        <td className="price-text">{'\u20B9'}{p.price}</td>
        <td><span className={`stock-badge ${currentStock < 5 ? 'low' : 'good'}`}>{currentStock}</span></td>
        <td>
          <div className="action-btns">
            <button className="edit" onClick={() => openEditProduct(p)}><Edit size={16} /></button>
            <button className="delete" onClick={() => setItemToDelete({ type: 'product', id: p._id, name: p.name })}><Trash2 size={16} /></button>
          </div>
        </td>
      </tr>
    );
  };

  if (loading) return <div className="admin-dashboard-page"><div className="loader container">Loading Dashboard...</div></div>;

  // For uncategorized products (just in case!)
  const uncategorizedProducts = products.filter(p => !categories.includes(p.category));

  return (
    <div className="admin-dashboard-page">

      {/* DELETE / CANCEL MODAL */}
      {itemToDelete && (
        <div className="custom-modal-overlay">
          <div className="custom-modal">
            <button className="modal-close" onClick={() => setItemToDelete(null)}><X size={24} /></button>
            <div className="modal-icon"><AlertTriangle size={40} color="#e63946" /></div>

            <h3>
              {itemToDelete.type === 'product' ? 'Delete Product?' :
                itemToDelete.type === 'order-cancel' ? 'Cancel Order?' :
                  'Permanently Delete Order?'}
            </h3>
            <p>
              {itemToDelete.type === 'product'
                ? `Are you sure you want to permanently delete ${itemToDelete.name}?`
                : itemToDelete.type === 'order-cancel'
                  ? `Are you sure you want to cancel this order? The customer will see the "Cancelled by Admin" reason on their tracker, and stock will be restored.`
                  : `This order is already cancelled. Are you sure you want to permanently delete it from the database?`}
            </p>

            <div className="modal-actions">
              <button className="btn-cancel" onClick={() => setItemToDelete(null)}>Go Back</button>
              <button className="btn-confirm-delete" onClick={confirmDelete}>
                {itemToDelete.type === 'order-cancel' ? 'Yes, Cancel Order' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PRODUCT MODAL */}
      {showProductModal && (
        <div className="custom-modal-overlay">
          <div className="custom-modal product-modal">
            <button className="modal-close" onClick={() => setShowProductModal(false)} disabled={isSaving}><X size={24} /></button>
            <h3>{isEditing ? 'Edit Product' : 'Add New Product'}</h3>
            <form onSubmit={handleProductSubmit} className="admin-form">
              <div className="form-group">
                <label>Product Name</label>
                <input type="text" value={productForm.name} onChange={(e) => setProductForm({ ...productForm, name: e.target.value })} required disabled={isSaving} />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Price (₹)</label>
                  <input type="number" value={productForm.price} onChange={(e) => setProductForm({ ...productForm, price: e.target.value })} required disabled={isSaving} />
                </div>
                <div className="form-group">
                  <label>Stock</label>
                  <input type="number" value={productForm.countInStock} onChange={(e) => setProductForm({ ...productForm, countInStock: e.target.value })} required disabled={isSaving} />
                </div>
              </div>
              <div className="form-group">
                <label>Category</label>
                <select className="admin-select" value={productForm.category} onChange={(e) => setProductForm({ ...productForm, category: e.target.value })} required disabled={isSaving}>
                  <option value="" disabled>Select a Category...</option>
                  {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
              </div>
              <div className="form-group upload-group">
                <label>Product Images (Up to 5)</label>
                <div className="image-upload-wrapper">
                  <label className="upload-btn" style={{ opacity: isSaving ? 0.5 : 1 }}>
                    <input type="file" accept="image/*" multiple onChange={handleImageChange} hidden disabled={isSaving} />
                    <Upload size={20} /> Choose Images ({imagePreviews.length}/5)
                  </label>
                  <div className="preview-grid" style={{ display: 'flex', gap: '10px', marginTop: '10px', flexWrap: 'wrap' }}>
                    {imagePreviews.length > 0 ? (
                      imagePreviews.map((src, idx) => (
                        <img key={idx} src={src} alt="Preview" className="img-preview" style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '6px' }} />
                      ))
                    ) : (
                      <div className="img-placeholder"><ImageIcon size={30} /></div>
                    )}
                  </div>
                </div>
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea rows="3" value={productForm.description} onChange={(e) => setProductForm({ ...productForm, description: e.target.value })} required disabled={isSaving}></textarea>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={() => setShowProductModal(false)} disabled={isSaving}>Cancel</button>
                <button type="submit" className="btn-save" disabled={isSaving} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {isSaving ? <><Loader2 size={16} className="spinning-loader" style={{ animation: 'spin 2s linear infinite' }} /> Uploading...</> : (isEditing ? 'Save Changes' : 'Create Product')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="container">
        <div className="admin-header">
          <h1>Command Center</h1>
        </div>

        <div className="admin-tabs">
          <button className={activeTab === 'overview' ? 'active' : ''} onClick={() => setActiveTab('overview')}>Overview</button>
          <button className={activeTab === 'products' ? 'active' : ''} onClick={() => setActiveTab('products')}>Products</button>
          <button className={activeTab === 'orders' ? 'active' : ''} onClick={() => setActiveTab('orders')}>Orders</button>
        </div>

        {activeTab === 'overview' && (
          <>
            <div className="admin-metrics">
              <div className="admin-metric-card">
                <div className="icon-wrapper metric-revenue"><DollarSign size={24} /></div>
                <div className="metric-info"><h4>Revenue</h4><p>{'\u20B9'}{metrics.revenue.toLocaleString()}</p></div>
              </div>
              <div className="admin-metric-card">
                <div className="icon-wrapper metric-orders"><ShoppingBag size={24} /></div>
                <div className="metric-info"><h4>Orders</h4><p>{metrics.orders}</p></div>
              </div>
              <div className="admin-metric-card">
                <div className="icon-wrapper metric-products"><Package size={24} /></div>
                <div className="metric-info"><h4>Products</h4><p>{metrics.products}</p></div>
              </div>
              <div className="admin-metric-card">
                <div className="icon-wrapper metric-alerts"><AlertTriangle size={24} /></div>
                <div className="metric-info"><h4>Low Stock</h4><p>{metrics.lowStock}</p></div>
              </div>
            </div>
            <div className="admin-chart-container">
              <h3>Revenue Overview (Last 7 Days)</h3>
              <div style={{ height: '350px', width: '100%' }}>
                <ResponsiveContainer>
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#e63946" stopOpacity={0.5} />
                        <stop offset="95%" stopColor="#e63946" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="name" stroke="rgba(255,255,255,0.2)" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 13 }} axisLine={false} tickLine={false} />
                    <YAxis stroke="rgba(255,255,255,0.2)" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 13 }} axisLine={false} tickLine={false} tickFormatter={(value) => `₹${value / 1000}k`} />
                    <Tooltip contentStyle={{ backgroundColor: 'rgba(22, 22, 26, 0.95)', border: '1px solid rgba(230, 57, 70, 0.4)', borderRadius: '8px', color: '#fff' }} itemStyle={{ color: '#e63946', fontSize: '1.2rem', fontWeight: '900' }} />
                    <Area type="monotone" dataKey="revenue" stroke="#e63946" strokeWidth={4} fillOpacity={1} fill="url(#colorRevenue)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </>
        )}

        {/* 🔥 Fix 2: Grouped Products by Category! */}
        {activeTab === 'products' && (
          <div className="admin-products-wrapper">
            <div className="table-header-flex" style={{ marginBottom: '1.5rem' }}>
              <h3>Inventory Management</h3>
              <button className="btn-add-product" onClick={openAddProduct}><Plus size={18} /> New Product</button>
            </div>

            {categories.map(category => {
              const categoryProducts = products.filter(p => p.category === category);
              if (categoryProducts.length === 0) return null; // Skip empty categories

              return (
                <div key={category} className="admin-table-container" style={{ marginBottom: '2rem' }}>
                  <div className="table-header-flex" style={{ paddingBottom: '10px', borderBottom: '1px solid rgba(255,255,255,0.05)', marginBottom: '10px' }}>
                    <h4 style={{ color: '#e63946', margin: 0 }}>{category} ({categoryProducts.length})</h4>
                  </div>
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Product</th>
                        {/* We removed 'Category' column since the whole table is the category! */}
                        <th>Price</th>
                        <th>Stock</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {categoryProducts.map(renderProductRow)}
                    </tbody>
                  </table>
                </div>
              );
            })}

            {/* Fallback for products with missing or deleted categories */}
            {uncategorizedProducts.length > 0 && (
              <div className="admin-table-container" style={{ marginBottom: '2rem' }}>
                <div className="table-header-flex" style={{ paddingBottom: '10px', borderBottom: '1px solid rgba(255,255,255,0.05)', marginBottom: '10px' }}>
                  <h4 style={{ color: '#ffb703', margin: 0 }}>Uncategorized ({uncategorizedProducts.length})</h4>
                </div>
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Price</th>
                      <th>Stock</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {uncategorizedProducts.map(renderProductRow)}
                  </tbody>
                </table>
              </div>
            )}

            {products.length === 0 && (
              <p style={{ padding: '1rem', color: 'rgba(255,255,255,0.5)', textAlign: 'center' }}>No products found. Click 'New Product' to add one.</p>
            )}
          </div>
        )}

        {activeTab === 'orders' && (
          <>
            <div className="admin-table-container" style={{ marginBottom: '2rem' }}>
              <div className="table-header-flex">
                <h3>Active Orders ({activeOrders.length})</h3>
              </div>
              {activeOrders.length > 0 ? (
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Order ID</th>
                      <th>User Email</th>
                      <th>Items</th>
                      <th>Amount</th>
                      <th>Tracker Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>{activeOrders.map(renderOrderRow)}</tbody>
                </table>
              ) : (
                <p style={{ padding: '1rem', color: 'rgba(255,255,255,0.5)' }}>No active orders.</p>
              )}
            </div>

            <div className="admin-table-container" style={{ marginBottom: '2rem' }}>
              <div className="table-header-flex">
                <h3 style={{ color: '#e63946' }}>Cancelled by Customer ({customerCancelledOrders.length})</h3>
              </div>
              {customerCancelledOrders.length > 0 ? (
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Order ID</th>
                      <th>User Email</th>
                      <th>Items</th>
                      <th>Amount</th>
                      <th>Tracker Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>{customerCancelledOrders.map(renderOrderRow)}</tbody>
                </table>
              ) : (
                <p style={{ padding: '1rem', color: 'rgba(255,255,255,0.5)' }}>No customer cancellations.</p>
              )}
            </div>

            <div className="admin-table-container">
              <div className="table-header-flex">
                <h3 style={{ color: '#e63946' }}>Cancelled by Admin ({adminCancelledOrders.length})</h3>
              </div>
              {adminCancelledOrders.length > 0 ? (
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Order ID</th>
                      <th>User Email</th>
                      <th>Items</th>
                      <th>Amount</th>
                      <th>Tracker Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>{adminCancelledOrders.map(renderOrderRow)}</tbody>
                </table>
              ) : (
                <p style={{ padding: '1rem', color: 'rgba(255,255,255,0.5)' }}>No admin cancellations.</p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;