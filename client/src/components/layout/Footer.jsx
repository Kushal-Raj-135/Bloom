import { useLanguage } from '../../contexts/LanguageContext';
import './Footer.css';

const Footer = () => {
  const { t } = useLanguage();

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-section">
            <div className="logo">
              <img src="/logo.png" alt="BioBloom Logo" className="footer-logo" />
            </div>
            <p className="footer-description">
              Sustainable farming solutions for a cleaner future. 
              Harness AI to make agriculture smarter and greener.
            </p>
          </div>
          
          <div className="footer-section">
            <h3>Products</h3>
            <ul>
              <li><a href="/crop/crop-rotation">{t('crop_rotation')}</a></li>
              <li><a href="/agrirevive/biofuel">{t('agrirevive')}</a></li>
              <li><a href="/agrisensex/agri">{t('agrisensex')}</a></li>
              <li><a href="https://livestock-hyntmajauedrrdofwkde42.streamlit.app/" target="_blank" rel="noopener noreferrer">{t('bio_guardian')}</a></li>
            </ul>
          </div>
          
          <div className="footer-section">
            <h3>Company</h3>
            <ul>
              <li><a href="#info-section">{t('about')}</a></li>
              <li><a href="#contact">{t('contact')}</a></li>
              <li><a href="/privacy">Privacy Policy</a></li>
              <li><a href="/terms">Terms of Service</a></li>
            </ul>
          </div>
          
          <div className="footer-section">
            <h3>Connect</h3>
            <div className="social-links">
              <a href="#" aria-label="Facebook">
                <i className="fab fa-facebook-f"></i>
              </a>
              <a href="#" aria-label="Twitter">
                <i className="fab fa-twitter"></i>
              </a>
              <a href="#" aria-label="LinkedIn">
                <i className="fab fa-linkedin-in"></i>
              </a>
              <a href="#" aria-label="Instagram">
                <i className="fab fa-instagram"></i>
              </a>
            </div>
          </div>
        </div>
        
        <div className="footer-bottom">
          <p>&copy; 2025 BioBloom Solutions. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
