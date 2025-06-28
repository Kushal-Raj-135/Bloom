import { Link } from 'react-router-dom';
import './NotFound.css';

const NotFound = () => {
  return (
    <div className="not-found-container">
      <div className="not-found-content">
        <div className="not-found-icon">
          <i className="fas fa-seedling"></i>
        </div>
        <h1>404</h1>
        <h2>Page Not Found</h2>
        <p>
          Oops! The page you're looking for seems to have gone off the grid. 
          Let's get you back to growing something great!
        </p>
        <div className="not-found-actions">
          <Link to="/" className="btn primary">
            <i className="fas fa-home"></i>
            Back to Home
          </Link>
          <Link to="/contact" className="btn secondary">
            <i className="fas fa-envelope"></i>
            Contact Support
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
