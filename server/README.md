# BioBloom Backend Restructuring

This project has been restructured to follow modern best practices for Node.js/Express applications, with a focus on security, maintainability, and scalability.

## Directory Structure

```
server/
├── config/           # Configuration files
│   └── config.js     # Central configuration management
├── controllers/      # Route handlers
│   ├── authController.js
│   ├── cropController.js
│   └── oauthController.js
├── middleware/       # Express middleware
│   ├── apiSecurity.js  # API security features
│   └── auth.js        # Authentication middleware
├── models/           # Database models
│   └── User.js       # User model
├── routes/           # Route definitions
│   ├── auth.js       # Authentication routes
│   └── crop.js       # Crop-related routes
└── utils/            # Utility functions
    └── cropUtils.js  # Crop-related utilities
```

## API Security Implementation

1. **Environment Variables**
   - All sensitive information (API keys, secrets) stored in `.env` file
   - `.env` file is excluded from version control via `.gitignore`

2. **API Key Management**
   - API keys are loaded from environment variables
   - No hardcoded keys in the codebase
   - Multiple API keys can be validated via the `VALID_API_KEYS` environment variable

3. **Security Middleware**
   - `apiSecurity.js` implements various security measures:
     - API key validation
     - Rate limiting to prevent abuse
     - Input sanitization to prevent injection attacks
     - Response sanitization to prevent data leakage

4. **Authentication**
   - JWT-based authentication with secure token handling
   - Role-based authorization
   - Password hashing using bcrypt
   - Secure session management

5. **Data Protection**
   - Sensitive data is never sent to the client
   - User passwords and personal information are protected
   - API responses are sanitized to remove sensitive data

## Implementation Details

### Configuration Management
All configuration is centralized in `server/config/config.js`, which loads values from environment variables.

### Route Handlers
Route handlers are organized by resource type in controller files:
- `authController.js`: Handles authentication, registration, profile updates
- `oauthController.js`: Manages OAuth authentication flows
- `cropController.js`: Manages crop-related API endpoints

### Middleware
- `auth.js`: Authentication middleware for protected routes
- `apiSecurity.js`: Security middleware for API endpoints

## Security Best Practices

1. **Use HTTPS in Production**
   - Always use HTTPS in production environments
   - Configure secure cookies for session management

2. **API Key Rotation**
   - Regularly rotate API keys
   - Support multiple valid keys during rotation periods

3. **Input Validation**
   - All user inputs are validated and sanitized
   - Use parameterized queries to prevent SQL injection

4. **Rate Limiting**
   - API endpoints are rate-limited to prevent abuse
   - Different rate limits can be applied to different endpoints

5. **Response Security**
   - Sensitive information is stripped from responses
   - Appropriate HTTP status codes and headers are used

6. **Error Handling**
   - Errors are logged but not exposed to clients
   - Generic error messages are returned to prevent information leakage
