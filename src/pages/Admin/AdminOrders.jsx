import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, CheckCircle, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { getAllOrders, markOrderDelivered } from '../../api/orderApi';
import './Admin.scss';

const AdminOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            const data = await getAllOrders();
            setOrders(data);
        } catch (error) {
            toast.error('Failed to load orders');
        } finally {
            setLoading(false);
        }
    };

    const handleDeliver = async (id) => {
        try {
            await markOrderDelivered(id);
            toast.success('Order marked as delivered!');
            fetchOrders(); // Refresh the list
        } catch (error) {
            toast.error('Failed to update order status');
        }
    };

    if (loading) return <div className="loader">Loading Orders...</div>;

    return (
        <div className="admin-page">
            <div className="admin-header">
                <h1>Dashboard Overview</h1>
                <div className="admin-nav">
                    <Link to="/admin/orders" className="active">Manage Orders</Link>
                    <Link to="/admin/products">Manage Products</Link>
                </div>
            </div>

            <div className="admin-card">
                <h2>Recent Orders ({orders.length})</h2>
                <div className="table-responsive">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Order ID</th>
                                <th>Customer</th>
                                <th>Items to Pack</th>
                                <th>Date</th>
                                <th>Total</th>
                                <th>Status</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.map(order => (
                                <tr key={order._id}>
                                    <td className="mono">{order._id.substring(18, 24).toUpperCase()}</td>
                                    <td>{order.user?.email || 'Guest'}</td>

                                    {/* Your brilliant idea: The Thumbnail Row! */}
                                    <td>
                                        <div className="order-thumbnails">
                                            {order.orderItems.map(item => (
                                                <div key={item.product} className="thumb-wrapper" title={item.name}>
                                                    <img src={item.image} alt="item" />
                                                    <span className="qty-badge">{item.qty}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </td>

                                    <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                                    <td className="price">₹{order.totalPrice}</td>

                                    <td>
                                        {order.isDelivered ? (
                                            <span className="status-badge success"><CheckCircle size={14} /> Delivered</span>
                                        ) : (
                                            <span className="status-badge pending"><Clock size={14} /> Processing</span>
                                        )}
                                    </td>

                                    <td>
                                        {!order.isDelivered && (
                                            <button className="btn-action" onClick={() => handleDeliver(order._id)}>
                                                <Package size={16} /> Ship It
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminOrders;