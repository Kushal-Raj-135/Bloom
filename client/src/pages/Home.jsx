import { useLanguage } from '../contexts/LanguageContext';
import ProductCard from '../components/common/ProductCard';
import AQIWidget from '../components/widgets/AQIWidget';
import './Home.css';

const Home = () => {
  const { t } = useLanguage();

  const products = [
    {
      icon: 'fas fa-sync-alt',
      title: t('products.crop_rotation'),
      description: 'Smart crop rotation planning using AI to maximize yields and soil health.',
      link: '/crop/crop-rotation'
    },
    {
      icon: 'fas fa-leaf',
      title: t('products.agrirevive'),
      description: 'Convert agricultural waste into clean biofuel energy solutions.',
      link: '/agrirevive/biofuel'
    },
    {
      icon: 'fas fa-chart-line',
      title: t('products.agrisensex'),
      description: 'Real-time monitoring and analytics for precision agriculture.',
      link: '/agrisensex/agri'
    },
    {
      icon: 'fas fa-shield-alt',
      title: t('products.bio_guardian'),
      description: 'AI-powered livestock health monitoring and protection system.',
      link: 'https://livestock-hyntmajauedrrdofwkde42.streamlit.app/',
      external: true
    }
  ];

  const scrollToFeatures = () => {
    document.querySelector('.features')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="home">
      {/* Hero Section */}
      <section className="hero" id="home">
        <div className="container">
          <div className="hero-content">
            <h1>{t('home.sustainable_farming')}</h1>
            <p>{t('home.hero_description')}</p>
            <button className="custom-btn" onClick={scrollToFeatures}>
              {t('home.get_started')}
            </button>
          </div>
          <div className="hero-image">
            <img 
              src="/plant.jpg" 
              alt="Sustainable Farming" 
              onError={(e) => {
                e.target.src = 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80';
              }}
            />
          </div>
        </div>
      </section>

      {/* AQI Widget Section */}
      <section className="aqi-section">
        <div className="container">
          <AQIWidget />
        </div>
      </section>

      {/* Features/Products Section */}
      <section className="features" id="products">
        <div className="container">
          <h2 className="section-title">{t('home.our_products')}</h2>
          <div className="product-cards">
            {products.map((product, index) => (
              <ProductCard key={index} {...product} />
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="info-section" id="info-section">
        <div className="container">
          <div className="info-content">
            <div className="info-text">
              <h2>About BioBloom Solutions</h2>
              <p>
                We are dedicated to revolutionizing agriculture through innovative AI-powered 
                solutions that promote sustainability and environmental protection. Our platform 
                combines cutting-edge technology with agricultural expertise to help farmers 
                make smarter decisions.
              </p>
              <ul>
                <li>AI-driven crop optimization</li>
                <li>Real-time environmental monitoring</li>
                <li>Sustainable farming practices</li>
                <li>Data-driven insights</li>
              </ul>
            </div>
            <div className="info-image">
              <img 
                src="/sus.jpg" 
                alt="Sustainable Agriculture" 
                onError={(e) => {
                  e.target.src = 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80';
                }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="contact-section" id="contact">
        <div className="container">
          <div className="contact-content">
            <h2>Get in Touch</h2>
            <p>Ready to transform your farming practices? Contact us today!</p>
            <div className="contact-info">
              <div className="contact-item">
                <i className="fas fa-envelope"></i>
                <span>contact@biobloom.com</span>
              </div>
              <div className="contact-item">
                <i className="fas fa-phone"></i>
                <span>+1 (555) 123-4567</span>
              </div>
              <div className="contact-item">
                <i className="fas fa-map-marker-alt"></i>
                <span>123 Green Valley, EcoCity</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
