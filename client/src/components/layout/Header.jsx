import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import toast from 'react-hot-toast';
import './Header.css';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const { t, currentLanguage, changeLanguage, availableLanguages } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      toast.success(t('logout_success'));
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Logout failed');
    }
    setIsUserMenuOpen(false);
  };

  const handleLanguageChange = (e) => {
    changeLanguage(e.target.value);
  };

  const isActiveLink = (path) => {
    return location.pathname === path;
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isUserMenuOpen && !event.target.closest('.user-menu')) {
        setIsUserMenuOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [isUserMenuOpen]);

  return (
    <header className="header">
      <div className="container">
        <div className="logo">
          <Link to="/">
            <img src="/logo.png" alt="BioBloom Logo" className="logo-img" />
          </Link>
        </div>
        
        <div 
          className="menu-toggle" 
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          <i className={`fas fa-${isMenuOpen ? 'times' : 'bars'}`}></i>
        </div>
        
        <nav className={`nav ${isMenuOpen ? 'active' : ''}`}>
          <ul className="nav-list">
            <li>
              <Link 
                to="/" 
                className={`nav-link ${isActiveLink('/') ? 'active' : ''}`}
              >
                {t('navigation.home')}
              </Link>
            </li>
            <li>
              <a href="/#info-section" className="nav-link">
                {t('navigation.about')}
              </a>
            </li>
            <li className="dropdown">
              <a href="#" className="nav-link">
                {t('navigation.products_link')}
              </a>
              <div className="dropdown-menu">
                <Link to="/crop/crop-rotation" className="nav-link">
                  {t('products.crop_rotation')}
                </Link>
                <Link to="/agrirevive/biofuel" className="nav-link">
                  {t('products.agrirevive')}
                </Link>
                <Link to="/agrisensex/agri" className="nav-link">
                  {t('products.agrisensex')}
                </Link>
                <a 
                  href="https://livestock-hyntmajauedrrdofwkde42.streamlit.app/" 
                  className="nav-link"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {t('products.bio_guardian')}
                </a>
              </div>
            </li>
            <li>
              <a href="/#contact" className="nav-link">
                {t('navigation.contact')}
              </a>
            </li>
          </ul>
          
          <div className="nav-right">
            {!isAuthenticated ? (
              <div className="auth-buttons">
                <Link 
                  to="/login" 
                  className={`nav-link ${isActiveLink('/login') ? 'active' : ''}`}
                >
                  {t('navigation.login')}
                </Link>
                <Link 
                  to="/register" 
                  className={`nav-link ${isActiveLink('/register') ? 'active' : ''}`}
                >
                  {t('navigation.register')}
                </Link>
              </div>
            ) : (
              <div className="user-menu">
                <div className="dropdown">
                  <button
                    className="user-dropdown-toggle nav-link"
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  >
                    <i className="fas fa-user-circle"></i>
                    <span className="user-name">{user?.name || 'User'}</span>
                    <i className="fas fa-chevron-down"></i>
                  </button>
                  {isUserMenuOpen && (
                    <div className="dropdown-menu user-dropdown-menu">
                      <Link 
                        to="/profile" 
                        className="nav-link"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        {t('profile')}
                      </Link>
                      <button 
                        className="nav-link logout-btn"
                        onClick={handleLogout}
                      >
                        {t('logout')}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            <div className="language-selector">
              <select 
                value={currentLanguage}
                onChange={handleLanguageChange}
                className="language-dropdown"
              >
                {availableLanguages.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Header;
