import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import toast from 'react-hot-toast';
import './Auth.css';

const ResetPassword = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { resetPassword } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const token = searchParams.get('token');

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors }
  } = useForm();

  const password = watch('password');

  useEffect(() => {
    if (!token) {
      toast.error('Invalid reset token');
      navigate('/login');
    }
  }, [token, navigate]);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await resetPassword({
        token,
        password: data.password
      });
      toast.success('Password reset successfully!');
      navigate('/login');
    } catch (error) {
      toast.error(error.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1>Reset Password</h1>
          <p>Enter your new password below.</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="auth-form">
          <div className="form-group">
            <label htmlFor="password">{t('new_password')}</label>
            <div className="password-input-container">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                {...register('password', {
                  required: t('required_field'),
                  minLength: {
                    value: 8,
                    message: t('password_min_length')
                  },
                  pattern: {
                    value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
                    message: 'Password must contain uppercase, lowercase, number and special character'
                  }
                })}
                className={errors.password ? 'error' : ''}
                placeholder="Enter new password"
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
              </button>
            </div>
            {errors.password && (
              <span className="error-message">{errors.password.message}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">{t('confirm_password')}</label>
            <div className="password-input-container">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                id="confirmPassword"
                {...register('confirmPassword', {
                  required: t('required_field'),
                  validate: value => 
                    value === password || t('passwords_not_match')
                })}
                className={errors.confirmPassword ? 'error' : ''}
                placeholder="Confirm new password"
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                <i className={`fas ${showConfirmPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
              </button>
            </div>
            {errors.confirmPassword && (
              <span className="error-message">{errors.confirmPassword.message}</span>
            )}
          </div>

          <button
            type="submit"
            className="auth-btn primary"
            disabled={loading}
          >
            {loading ? (
              <>
                <i className="fas fa-spinner fa-spin"></i>
                Resetting...
              </>
            ) : (
              'Reset Password'
            )}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Remember your password?{' '}
            <Link to="/login" className="auth-link">
              Back to Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
