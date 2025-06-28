import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import toast from 'react-hot-toast';
import './Auth.css';

const Register = () => {
  const [loading, setLoading] = useState(false);
  const { register: registerUser, isAuthenticated } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors }
  } = useForm();

  const password = watch('password');

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await registerUser(data);
      toast.success(t('register_success'));
      navigate('/login', { replace: true });
    } catch (error) {
      toast.error(error.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1>{t('register')}</h1>
          <p>{t('forms.register_description')}</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="auth-form">
          <div className="form-group">
            <label htmlFor="name">{t('forms.name')}</label>
            <input
              type="text"
              id="name"
              placeholder={t('forms.name_placeholder')}
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
            <label htmlFor="email">{t('forms.email')}</label>
            <input
              type="email"
              id="email"
              placeholder={t('forms.email_placeholder')}
              {...register('email', {
                required: t('required_field'),
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: t('invalid_email')
                }
              })}
              className={errors.email ? 'error' : ''}
            />
            {errors.email && (
              <span className="error-message">{errors.email.message}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="password">{t('forms.password')}</label>
            <div className="password-input-container">
              <input
                type='password'
                id="password"
                placeholder={t('forms.password_placeholder')}
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
              />
            </div>
            {errors.password && (
              <span className="error-message">{errors.password.message}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">{t('confirm_password')}</label>
            <div className="password-input-container">
              <input
                type='password'
                id="confirmPassword"
                placeholder={t('forms.confirm_password_placeholder')}
                {...register('confirmPassword', {
                  required: t('required_field'),
                  validate: value => 
                    value === password || t('passwords_not_match')
                })}
                className={errors.confirmPassword ? 'error' : ''}
              />
            </div>
            {errors.confirmPassword && (
              <span className="error-message">{errors.confirmPassword.message}</span>
            )}
          </div>

          <div className="form-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                {...register('agreeTerms', {
                  required: 'You must agree to the terms and conditions'
                })}
              />
              <span className="checkmark"></span>
              {t('forms.terms_and_conditions')}{' '}
            </label>
            {errors.agreeTerms && (
              <span className="error-message">{errors.agreeTerms.message}</span>
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
                Creating account...
              </>
            ) : (
              t('register')
            )}
          </button>
        </form>

        
        <div className="auth-divider">
          <span>or</span>
        </div>

        <div className="oauth-buttons">
          <button
            type="button"
            onClick={() => handleOAuthLogin('google')}
            className="oauth-btn google"
          >
            <i className="fab fa-google"></i>
            {t('forms.continue_with_google')}
          </button>
          <button
            type="button"
            onClick={() => handleOAuthLogin('github')}
            className="oauth-btn github"
          >
            <i className="fab fa-github"></i>
            {t('forms.continue_with_github')}
          </button>
        </div>


        <div className="auth-footer">
          <p>
            {t('forms.have_account')}{' '}
            <Link to="/login" className="auth-link">
              {t('login')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
