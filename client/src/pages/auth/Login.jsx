import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { authService } from '../../services/authService';
import toast from 'react-hot-toast';
import './Auth.css';

const Login = () => {
  const [loading, setLoading] = useState(false);
  const { login, isAuthenticated } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors }
  } = useForm();

  useEffect(() => {
    if (isAuthenticated) {
      const from = location.state?.from?.pathname || '/';
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, location]);

  useEffect(() => {
    const rememberedEmail = authService.getRememberedEmail();
    if (rememberedEmail) {
      setValue('email', rememberedEmail);
      setValue('rememberMe', true);
    }
  }, [setValue]);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await login(data);
      toast.success(t('messages.login_success'));
      
      const from = location.state?.from?.pathname || '/';
      navigate(from, { replace: true });
    } catch (error) {
      toast.error(error.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleOAuthLogin = (provider) => {
    if (provider === 'google') {
      authService.googleAuth();
    } else if (provider === 'github') {
      authService.githubAuth();
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1>{t('navigation.login')}</h1>
          <p>{t('forms.login_description')}</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="auth-form">
          <div className="form-group">
            <label htmlFor="email">{t('forms.email')}</label>
            <input
              type="email"
              id="email"
              placeholder={t('forms.email_placeholder')}
              {...register('email', {
                required: t('forms.required_field'),
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: t('forms.invalid_email')
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
                type="password"
                id="password"
                placeholder={t('forms.password_placeholder')}
                {...register('password', {
                  required: t('forms.required_field')
                })}
                className={errors.password ? 'error' : ''}
              />
            </div>
            {errors.password && (
              <span className="error-message">{errors.password.message}</span>
            )}
          </div>

          <div className="form-options">
            <label className="checkbox-label">
              <input
                type="checkbox"
                {...register('rememberMe')}
              />
              <span className="checkmark"></span>
              {t('forms.remember_me')}
            </label>
            <Link to="/forgot-password" className="forgot-link">
              {t('forms.forgot_password')}
            </Link>
          </div>

          <button
            type="submit"
            className="auth-btn primary"
            disabled={loading}
          >
            {loading ? (
              <>
                <i className="fas fa-spinner fa-spin"></i>
                {t('forms.signing_in')}
              </>
            ) : (
              t('navigation.login')
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
            {t('forms.no_account')}{' '}
            <Link to="/register" className="auth-link">
              {t('navigation.register')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
