import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import toast from 'react-hot-toast';
import './Profile.css';

const Profile = () => {
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const { user, updateProfile } = useAuth();
  const { t } = useLanguage();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors }
  } = useForm({
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      location: user?.location || '',
      bio: user?.bio || ''
    }
  });

  const bioValue = watch('bio', '');

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await updateProfile(data);
      toast.success(t('profile_updated'));
    } catch (error) {
      toast.error(error.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="profile-container">
      <div className="profile-header">
        <div className="container">
          <div className="profile-avatar">
            <img 
              src={user?.profilePicture || '/default-avatar.png'} 
              alt="Profile" 
              onError={(e) => {
                e.target.src = 'https://via.placeholder.com/120/2e7d32/ffffff?text=' + (user?.name?.charAt(0) || 'U');
              }}
            />
            <button className="avatar-edit-btn">
              <i className="fas fa-camera"></i>
            </button>
          </div>
          <div className="profile-info">
            <h1>{user?.name || 'User'}</h1>
            <p>{user?.email}</p>
            <div className="profile-stats">
              <div className="stat-item">
                <span className="stat-number">12</span>
                <span className="stat-label">Saved Searches</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">5</span>
                <span className="stat-label">Active Projects</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="profile-content">
        <div className="container">
          <div className="profile-tabs">
            <button 
              className={`tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
              onClick={() => setActiveTab('profile')}
            >
              <i className="fas fa-user"></i>
              Profile Information
            </button>
            <button 
              className={`tab-btn ${activeTab === 'security' ? 'active' : ''}`}
              onClick={() => setActiveTab('security')}
            >
              <i className="fas fa-shield-alt"></i>
              Security
            </button>
            <button 
              className={`tab-btn ${activeTab === 'preferences' ? 'active' : ''}`}
              onClick={() => setActiveTab('preferences')}
            >
              <i className="fas fa-cog"></i>
              Preferences
            </button>
          </div>

          <div className="profile-tab-content">
            {activeTab === 'profile' && (
              <div className="tab-panel">
                <h2>Profile Information</h2>
                <form onSubmit={handleSubmit(onSubmit)} className="profile-form">
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="name">{t('name')}</label>
                      <input
                        type="text"
                        id="name"
                        {...register('name', {
                          required: t('required_field'),
                          minLength: {
                            value: 2,
                            message: 'Name must be at least 2 characters'
                          }
                        })}
                        className={errors.name ? 'error' : ''}
                      />
                      {errors.name && (
                        <span className="error-message">{errors.name.message}</span>
                      )}
                    </div>

                    <div className="form-group">
                      <label htmlFor="email">{t('email')}</label>
                      <input
                        type="email"
                        id="email"
                        {...register('email')}
                        readOnly
                        className="readonly"
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="phone">{t('phone')}</label>
                      <input
                        type="tel"
                        id="phone"
                        {...register('phone')}
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="location">{t('location')}</label>
                      <input
                        type="text"
                        id="location"
                        {...register('location')}
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="bio">{t('bio')}</label>
                    <textarea
                      id="bio"
                      rows="4"
                      {...register('bio')}
                      maxLength={200}
                    />
                    <div className="char-count">
                      {bioValue.length}/200
                    </div>
                  </div>

                  <div className="form-actions">
                    <button
                      type="submit"
                      className="btn primary"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <i className="fas fa-spinner fa-spin"></i>
                          Saving...
                        </>
                      ) : (
                        t('save_changes')
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="tab-panel">
                <h2>Security Settings</h2>
                <div className="security-section">
                  <h3>Change Password</h3>
                  <form className="profile-form">
                    <div className="form-group">
                      <label htmlFor="currentPassword">{t('current_password')}</label>
                      <div className="password-input-container">
                        <input
                          type={showCurrentPassword ? 'text' : 'password'}
                          id="currentPassword"
                        />
                        <button
                          type="button"
                          className="password-toggle"
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        >
                          <i className={`fas ${showCurrentPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                        </button>
                      </div>
                    </div>

                    <div className="form-group">
                      <label htmlFor="newPassword">{t('new_password')}</label>
                      <div className="password-input-container">
                        <input
                          type={showNewPassword ? 'text' : 'password'}
                          id="newPassword"
                        />
                        <button
                          type="button"
                          className="password-toggle"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                        >
                          <i className={`fas ${showNewPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                        </button>
                      </div>
                    </div>

                    <div className="form-actions">
                      <button type="submit" className="btn primary">
                        Update Password
                      </button>
                    </div>
                  </form>
                </div>

                <div className="security-section">
                  <h3>Account Security</h3>
                  <div className="security-info">
                    <div className="security-item">
                      <i className="fas fa-shield-check"></i>
                      <div>
                        <h4>Two-Factor Authentication</h4>
                        <p>Add an extra layer of security to your account</p>
                      </div>
                      <button className="btn secondary">Enable</button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'preferences' && (
              <div className="tab-panel">
                <h2>Preferences</h2>
                <div className="preferences-section">
                  <h3>Notifications</h3>
                  <div className="preference-item">
                    <label className="switch">
                      <input type="checkbox" defaultChecked />
                      <span className="slider"></span>
                    </label>
                    <div className="preference-info">
                      <h4>Email Notifications</h4>
                      <p>Receive updates about your projects and recommendations</p>
                    </div>
                  </div>
                  
                  <div className="preference-item">
                    <label className="switch">
                      <input type="checkbox" />
                      <span className="slider"></span>
                    </label>
                    <div className="preference-info">
                      <h4>SMS Notifications</h4>
                      <p>Get important alerts via SMS</p>
                    </div>
                  </div>
                </div>

                <div className="preferences-section">
                  <h3>Data & Privacy</h3>
                  <div className="preference-item">
                    <label className="switch">
                      <input type="checkbox" defaultChecked />
                      <span className="slider"></span>
                    </label>
                    <div className="preference-info">
                      <h4>Location Services</h4>
                      <p>Allow location access for weather and AQI data</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
