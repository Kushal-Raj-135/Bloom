# BioBloom - AI-Powered Sustainable Farming Solutions

BioBloom is a full-stack web application that provides AI-powered solutions for sustainable farming practices and environmental monitoring.

## Features

- User Authentication (Login/Register)
- Real-time AQI (Air Quality Index) monitoring
- Multi-language support
- User profile management
- Search history tracking
- Responsive design

## Tech Stack

- Frontend:
  - HTML5
  - CSS3
  - JavaScript (ES6+)
  - Chart.js for data visualization

- Backend:
  - Node.js
  - Express.js
  - MongoDB
  - JWT for authentication

## Prerequisites

- Node.js (v14 or higher)
- MongoDB
- npm or yarn

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/biobloom.git
cd biobloom
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory with the following variables:
```
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
PORT=3000
```

4. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## API Endpoints

### Authentication
- POST `/api/register` - Register a new user
- POST `/api/login` - Login user
- GET `/api/profile` - Get user profile
- PUT `/api/profile` - Update user profile

### Search History
- GET `/api/search-history` - Get user's search history
- POST `/api/save-search` - Save search history

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Chart.js for data visualization
- Font Awesome for icons
- Google Fonts for typography 