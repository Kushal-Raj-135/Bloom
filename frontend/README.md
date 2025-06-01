# Frontend Directory Structure

The frontend files have been reorganized into a structured directory layout to facilitate easier framework migration in the future.

## Directory Structure

```
frontend/
├── assets/              # Static assets (images, logos, etc.)
│   ├── logo.png
│   ├── plant.jpg
│   └── sus.jpg
├── css/                 # Global CSS files
│   ├── styles.css       # Main stylesheet
│   ├── aqi-styles.css   # Air Quality Index styles
│   ├── nav-styles.css   # Navigation styles
│   ├── footer-styles.css
│   ├── product-cards.css
│   └── recommendations.css
├── js/                  # Global JavaScript files
│   ├── app.js          # Main application logic
│   ├── script.js       # Core scripts
│   ├── userMenu.js     # User menu functionality
│   ├── login.js        # Login functionality
│   ├── register.js     # Registration functionality
│   ├── profile.js      # Profile management
│   ├── validation.js   # Form validation
│   ├── aqi.js         # Air Quality Index functionality
│   └── chart.js       # Chart functionality
├── pages/              # HTML pages
│   ├── index.html      # Main landing page
│   ├── login.html      # Login page
│   ├── register.html   # Registration page
│   ├── profile.html    # User profile page
│   ├── forgot-password.html
│   ├── reset-password.html
│   └── edit-profile.html
└── components/         # Feature-specific components
    ├── agrirevive/     # AgriReVive module
    │   ├── biofuel.html
    │   ├── styles.css
    │   ├── script.js
    │   └── logo.png
    ├── agrisensex/     # AgriSenseX module
    │   ├── agri.html
    │   ├── styles.css
    │   ├── app.js
    │   └── logo.png
    ├── crop/           # Crop rotation module
    │   ├── crop-rotation.html
    │   ├── crop-rotation.css
    │   ├── crop-rotation.js
    │   └── various other crop-related files
    └── language/       # Internationalization
        ├── translations.js
        ├── language-styles.css
        ├── en.json
        ├── hi.json
        └── kn.json
```

## Benefits of This Structure

1. **Clear Separation**: Frontend and backend code are now clearly separated
2. **Framework Ready**: Easy to migrate to React, Vue, Angular, or other frameworks
3. **Modular Components**: Each feature is self-contained in its own directory
4. **Scalable**: Easy to add new components or pages
5. **Maintainable**: Logical organization makes code easier to find and modify

## Path Updates Made

- Updated all HTML files to use relative paths to the new structure
- Updated CSS and JavaScript references
- Updated image asset paths
- Updated component navigation links
- Updated server.js to serve files from the frontend directory

## Next Steps for Framework Migration

When ready to migrate to a modern framework:

1. The `components/` directory can be easily converted to framework components
2. Global CSS can be imported into the framework's styling system
3. JavaScript files can be modularized or rewritten as needed
4. Pages can be converted to framework routes/pages
5. Assets directory remains unchanged
