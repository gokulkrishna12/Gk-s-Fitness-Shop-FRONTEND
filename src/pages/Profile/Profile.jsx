import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { User, Lock, Mail, Shield, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import axiosClient from '../../api/axiosClient'; // THE FIX: Needed to call backend!
import './Profile.scss';

const Profile = () => {
  const { user } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [password, setPassword] = useState(''); // Only need one field for updating
  const [loading, setLoading] = useState(false);

  // THE FIX: Actually calls the backend to update the profile!
  const handleUpdateProfile = async (e) => {
    e.preventDefault();

    // We only send the password if they actually typed something new!
    const updateData = { name };
    if (password) {
      updateData.password = password;
    }

    try {
      setLoading(true);
      await axiosClient.put('/auth/profile', updateData);

      toast.success('Profile updated successfully!');
      setPassword(''); // Clear the password field on success
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="profile-page">
      <div className="container profile-container">

        <div className="profile-header">
          <h1>My Profile</h1>
          <p>Update your athlete details and security settings.</p>
        </div>

        <div className="profile-card">
          <h2><User size={20} className="icon-red" /> Athlete Details</h2>
          <form onSubmit={handleUpdateProfile}>

            <div className="input-group">
              <label>Full Name</label>
              <div className="input-wrapper">
                <User size={16} className="input-icon" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Gokul Krishna"
                />
              </div>
            </div>

            <div className="input-group">
              <label>Email Address</label>
              <div className="input-wrapper disabled">
                <Mail size={16} className="input-icon" />
                <input type="email" value={user?.email || ''} disabled />
              </div>
            </div>

            <div className="input-group">
              <label>Account Type</label>
              <div className="input-wrapper disabled">
                <Shield size={16} className="input-icon" />
                <input
                  type="text"
                  value={user?.isAdmin || user?.role === 'admin' ? 'Staff (Admin)' : 'Athlete (Customer)'}
                  disabled
                />
              </div>
            </div>

            {/* Combined Password update into the same form for cleaner UX */}
            <h2 className="security-title"><Lock size={20} className="icon-red" /> Update Password</h2>

            <div className="input-group">
              <label>New Password (Optional)</label>
              <div className="input-wrapper">
                <Lock size={16} className="input-icon" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Leave blank to keep current password"
                />
              </div>
            </div>

            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Saving...' : 'Save Changes'} <CheckCircle size={20} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;