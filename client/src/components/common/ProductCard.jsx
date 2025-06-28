import { Link } from 'react-router-dom';
import './ProductCard.css';

const ProductCard = ({ icon, title, description, link, external = false }) => {
  const CardContent = () => (
    <div className="product-card">
      <div className="product-icon">
        <i className={icon}></i>
      </div>
      <h3 className="product-title">{title}</h3>
      <p className="product-description">{description}</p>
      <div className="product-arrow">
        <i className="fas fa-arrow-right"></i>
      </div>
    </div>
  );

  if (external) {
    return (
      <a 
        href={link} 
        target="_blank" 
        rel="noopener noreferrer" 
        className="product-card-link"
      >
        <CardContent />
      </a>
    );
  }

  return (
    <Link to={link} className="product-card-link">
      <CardContent />
    </Link>
  );
};

export default ProductCard;
