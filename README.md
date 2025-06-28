# 🌱 BioBloom - AI-Powered Sustainable Farming Solutions

BioBloom is a comprehensive agricultural technology platform designed to empower farmers and agri-enthusiasts with data-driven, sustainable farming practices. It integrates real-time environmental insights, smart crop recommendations, and a modern UI to deliver a holistic farming assistant experience.

---

## 🚀 Key Features

✅ **User Authentication System**
Secure login, registration, profile management, and password recovery.

✅ **Agricultural Insights**
AI-powered crop recommendations, weather forecasts, AQI monitoring, and sustainable farming guides.

✅ **Interactive Dashboard**
Visualize weather, AQI, and crop data with intuitive real-time charts and saved preferences.

✅ **Environment-Aware Tools**
Seamlessly integrate with environmental APIs to provide local farming insights.

---

## 🧑‍💻 Tech Stack

### 🖼️ Frontend

* HTML5, CSS3, JavaScript
* Chart.js for data visualization

### 🛠️ Backend

* Node.js
* Express.js
* MongoDB (Mongoose ODM)

### 🔗 Integrations

* Weather & AQI APIs
* Environmental monitoring services
* JWT-based authentication

---

## ⚙️ Project Setup

### 🔧 Prerequisites

* Node.js (v14+)
* npm
* MongoDB (Local or Cloud)

### 📦 Installation

1️⃣ Clone the repository:

```bash
git clone https://github.com/yourusername/biobloom.git
cd biobloom
```

2️⃣ Install dependencies:

```bash
npm install
```

3️⃣ Create `.env` file:

```env
PORT=your_port
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
SESSION_SECRET=some_secret_value
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GROQ_API_KEY=your_groq_api_key
```

4️⃣ Start the server:

```bash
node server.js
```

📍 Visit: [http://localhost:3000](http://localhost:3000)

---

## 🐳 Docker Support

### 🐋 Run BioBloom with Docker

1️⃣ Make sure Docker & Docker Compose are installed.

2️⃣ Run the following:

```bash
docker-compose up --build
```

3️⃣ Access the app at:

```
http://localhost:3000
```

4️⃣ To stop and remove containers:

```bash
docker-compose down
```

To remove volumes:

```bash
docker-compose down -v
```

---

## 🗂️ Project Structure

```
biobloom/
├── agrisensex/         # Agricultural sensing modules
├── agrirevive/         # Core farming logic and services
├── language/           # Localization support
├── routes/             # Express.js route handlers
├── crop/               # Crop management and recommendation
├── public/             # Static assets (CSS, JS, images)
├── server.js           # Application entry point
└── ...
```

---

## 🔍 Feature Deep Dive

### 👤 User Management

* Registration, Login, Logout
* Password reset & session management
* Secure storage with JWT

### 🌾 Agricultural Toolkit

* AI-driven crop recommendation engine
* Location-aware weather and AQI integration
* Sustainable farming education

### 📊 Data Visualization

* Real-time weather and AQI charts
* Trend analysis over time
* Custom dashboard experience

---

## 🤝 Contributing

We love contributions! If you want to make BioBloom better:

1. Fork the project
2. Create your branch (`git checkout -b feature/YourFeature`)
3. Commit your changes (`git commit -m 'Add YourFeature'`)
4. Push to the branch (`git push origin feature/YourFeature`)
5. Open a Pull Request 🚀

---

## 📝 License

Distributed under the MIT License. See `LICENSE` for details.

---

## 📫 Contact

Your Name – [@yourusername](https://twitter.com/yourusername)
GitHub Repo – [https://github.com/yourusername/biobloom](https://github.com/yourusername/biobloom)

---

## 🙏 Acknowledgments

* [Node.js](https://nodejs.org/)
* [Express.js](https://expressjs.com/)
* [MongoDB](https://www.mongodb.com/)
* [Chart.js](https://www.chartjs.org/)
* Environmental and Weather APIs
