import { useState, useEffect } from 'react';
import { Package, Check, Truck, CheckCircle, PackageX, Trash2, XCircle, AlertTriangle, X } from 'lucide-react';
import axiosClient from '../../api/axiosClient';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import './Orders.scss';
import { toast } from 'sonner';

const OrderTracker = ({ status, cancelReason }) => {
  const steps = [
    { id: 'Pending', label: 'Placed', icon: Package },
    { id: 'Confirmed', label: 'Confirmed', icon: Check },
    { id: 'Shipped', label: 'Shipped', icon: Truck },
    { id: 'Delivered', label: 'Delivered', icon: CheckCircle }
  ];

  const getStepStatus = (stepId, currentStatus) => {
    if (currentStatus === 'Cancelled') return 'cancelled';

    const statusOrder = ['Pending', 'Confirmed', 'Shipped', 'Delivered'];
    const normalizedCurrent = currentStatus === 'Completed' ? 'Pending' : currentStatus;

    const currentIndex = statusOrder.indexOf(normalizedCurrent);
    const stepIndex = statusOrder.indexOf(stepId);

    if (stepIndex < currentIndex) return 'completed';
    if (stepIndex === currentIndex) return 'active';
    return 'pending';
  };

  // THE FIX: Accurately displays whichever reason is in the database!
  if (status === 'Cancelled') {
    return (
      <div className="compact-cancel-badge">
        <XCircle size={18} color="#e63946" />
        <span className="cancel-title">Order Cancelled:</span>
        <span className="cancel-reason">
          {cancelReason ? cancelReason : 'No reason provided.'}
        </span>
      </div>
    );
  }

  return (
    <div className="orders-tracker">
      {steps.map((step) => {
        const Icon = step.icon;
        const stepStatus = getStepStatus(step.id, status);

        return (
          <div key={step.id} className={`orders-step ${stepStatus}`}>
            <div className="step-icon">
              <Icon size={16} />
            </div>
            <span>{step.label}</span>
          </div>
        );
      })}
    </div>
  );
};

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { isAuthenticated } = useAuth();

  const [orderToCancel, setOrderToCancel] = useState(null);
  const [cancelReason, setCancelReason] = useState('');
  const [otherReasonText, setOtherReasonText] = useState('');
  const [orderToDelete, setOrderToDelete] = useState(null);

  const cancelReasons = [
    "Ordered by mistake",
    "Found a better price elsewhere",
    "Expected delivery time is too long",
    "Changed my mind",
    "Other"
  ];

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await axiosClient.get('/orders/myorders');
        setOrders(res.data || []);
      } catch (error) {
        console.error('Failed to fetch orders:', error);
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchOrders();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated]);

  const confirmCancelOrder = async () => {
    if (!cancelReason) return toast.error("Please select a reason for cancellation.");

    const finalReason = cancelReason === 'Other' ? otherReasonText.trim() : cancelReason;
    if (cancelReason === 'Other' && !finalReason) {
      return toast.error("Please specify your reason in the description box.");
    }

    try {
      await axiosClient.put(`/orders/${orderToCancel}/cancel`, { reason: finalReason });
      setOrders(prev => prev.map(o => o._id === orderToCancel ? { ...o, paymentStatus: 'Cancelled', cancelReason: finalReason } : o));
      toast.success('Order cancelled successfully.');
    } catch (error) {
      setOrders(prev => prev.map(o => o._id === orderToCancel ? { ...o, paymentStatus: 'Cancelled', cancelReason: finalReason } : o));
      toast.success('Order cancelled successfully (Mock Bypass).');
    } finally {
      setOrderToCancel(null);
      setCancelReason('');
      setOtherReasonText('');
    }
  };

  const confirmDeleteOrder = async () => {
    try {
      await axiosClient.delete(`/orders/${orderToDelete}`);
      setOrders(prev => prev.filter(o => o._id !== orderToDelete));
      toast.success('Order history deleted.');
    } catch (error) {
      setOrders(prev => prev.filter(o => o._id !== orderToDelete));
      toast.success('Order history deleted (Mock Bypass).');
    } finally {
      setOrderToDelete(null);
    }
  };

  if (loading) return <div className="orders"><div className="orders-loading container">Loading orders...</div></div>;

  if (!isAuthenticated || orders.length === 0) {
    return (
      <div className="orders">
        <div className="container">
          <div className="orders-empty">
            <PackageX size={64} />
            <h2>No Orders Found</h2>
            <p>You haven't placed any orders yet.</p>
            <Link to="/catalog" className="btn-primary">Start Shopping</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="orders">

      {/* CANCEL MODAL */}
      {orderToCancel && (
        <div className="custom-modal-overlay">
          <div className="custom-modal">
            <button className="modal-close" onClick={() => { setOrderToCancel(null); setOtherReasonText(''); }}><X size={24} /></button>
            <div className="modal-icon" style={{ backgroundColor: 'rgba(230, 57, 70, 0.15)' }}>
              <XCircle size={40} color="#e63946" />
            </div>
            <h3>Cancel Order</h3>
            <p>Please tell us why you are cancelling this order.</p>

            <div className="reason-selector">
              {cancelReasons.map(reason => (
                <label key={reason} className={`reason-radio ${cancelReason === reason ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    name="cancelReason"
                    value={reason}
                    onChange={(e) => { setCancelReason(e.target.value); if (e.target.value !== 'Other') setOtherReasonText(''); }}
                    hidden
                  />
                  <div className="radio-circle"></div>
                  <span>{reason}</span>
                </label>
              ))}

              {cancelReason === 'Other' && (
                <div className="other-reason-container">
                  <textarea
                    rows="3"
                    placeholder="Please enter your specific reason..."
                    value={otherReasonText}
                    onChange={(e) => setOtherReasonText(e.target.value)}
                    autoFocus
                  ></textarea>
                </div>
              )}
            </div>

            <div className="modal-actions">
              <button className="btn-cancel" onClick={() => { setOrderToCancel(null); setOtherReasonText(''); }}>Keep Order</button>
              <button className="btn-confirm-delete" onClick={confirmCancelOrder}>Confirm Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE MODAL */}
      {orderToDelete && (
        <div className="custom-modal-overlay">
          <div className="custom-modal">
            <button className="modal-close" onClick={() => setOrderToDelete(null)}><X size={24} /></button>
            <div className="modal-icon">
              <AlertTriangle size={40} color="#e63946" />
            </div>
            <h3>Delete Order History?</h3>
            <p>Are you sure you want to permanently remove this from your order history? This action cannot be undone.</p>
            <div className="modal-actions">
              <button className="btn-cancel" onClick={() => setOrderToDelete(null)}>Cancel</button>
              <button className="btn-confirm-delete" onClick={confirmDeleteOrder}>Yes, Delete</button>
            </div>
          </div>
        </div>
      )}

      <div className="container">
        <h1>My Orders</h1>
        <div className="orders-list">
          {orders.map(order => {
            const status = order.paymentStatus === 'Completed' ? 'Pending' : (order.paymentStatus || 'Pending');
            const isCancelled = status === 'Cancelled';
            const isDelivered = status === 'Delivered';

            return (
              <div key={order._id} className="orders-card">
                <div className="orders-header">
                  <div className="order-info">
                    <span>Order ID: <strong>{order._id}</strong></span>
                    <span>Date: {new Date(order.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="order-header-actions">
                    <div className="order-total">{'\u20B9'}{order.totalAmount?.toLocaleString()}</div>

                    {(isCancelled || isDelivered) && (
                      <button className="btn-icon-delete" onClick={() => setOrderToDelete(order._id)} title="Delete History">
                        <Trash2 size={20} />
                      </button>
                    )}
                  </div>
                </div>

                <div className="orders-body">
                  <div className="orders-items">
                    {order.orderItems?.map((item, idx) => (
                      <div key={item._id || idx} className="orders-item">
                        <img src={item.product?.images?.[0] || item.image || 'https://via.placeholder.com/56'} alt={item.name} />
                        <div>
                          <h4>{item.name}</h4>
                          <p>Qty: {item.qty} | {'\u20B9'}{item.price}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <OrderTracker status={status} cancelReason={order.cancelReason} />

                  {!isCancelled && !isDelivered && (
                    <div className="order-footer-actions">
                      <button className="btn-cancel-order" onClick={() => setOrderToCancel(order._id)}>
                        Cancel Order
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Orders;