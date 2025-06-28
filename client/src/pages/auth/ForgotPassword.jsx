import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import toast from 'react-hot-toast';
import './Auth.css';

const ForgotPassword = () => {
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const { forgotPassword } = useAuth();
  const { t } = useLanguage();

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm();

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await forgotPassword(data.email);
      setEmailSent(true);
      toast.success('Password reset email sent successfully!');
    } catch (error) {
      toast.error(error.message || 'Failed to send reset email');
    } finally {
      setLoading(false);
    }
  };

  if (emailSent) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <i className="fas fa-envelope-check" style={{ fontSize: '3rem', color: 'var(--primary-color)', marginBottom: '1rem' }}></i>
            <h1>Email Sent!</h1>
            <p>We've sent a password reset link to your email address. Please check your inbox and follow the instructions.</p>
          </div>
          
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
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1>{t('forms.forgot_password')}</h1>
          <p>{t('forms.forgot_password_description')}</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="auth-form">
          <div className="form-group">
            <label htmlFor="email">{t('forms.email')}</label>
            <input
              type="email"
              id="email"
              {...register('email', {
                required: t('required_field'),
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: t('invalid_email')
                }
              })}
              className={errors.email ? 'error' : ''}
              placeholder="Enter your email address"
            />
            {errors.email && (
              <span className="error-message">{errors.email.message}</span>
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
                Sending...
              </>
            ) : (
              'Send Reset Link'
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

export default ForgotPassword;
