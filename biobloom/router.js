// Router for handling page content
document.addEventListener('DOMContentLoaded', () => {
    // Initialize router
    initRouter();
});

function initRouter() {
    // Handle navigation clicks
    document.addEventListener('click', (e) => {
        const link = e.target.closest('a');
        if (link && !link.hasAttribute('target')) {
            e.preventDefault();
            const path = link.getAttribute('href');
            navigateToPage(path);
        }
    });

    // Handle initial page load
    const path = window.location.pathname;
    navigateToPage(path);
}

async function navigateToPage(path) {
    const mainContent = document.querySelector('main');
    let contentPath;

    // Determine which content to load
    if (path.includes('crop/index.html') || path.endsWith('crop/')) {
        contentPath = '/crop/content.html';
        document.title = 'Crop Rotation Assistant - BioBloom Solutions';
        // Update active states in navigation
        updateActiveNavItem('Products');
    } else {
        contentPath = '/main-content.html';
        document.title = 'EcoFarm Assistant - Sustainable Farming Solutions';
        updateActiveNavItem('Home');
    }

    try {
        // Fetch the content
        const response = await fetch(contentPath);
        if (!response.ok) throw new Error('Content not found');
        const content = await response.text();
        
        // Update the main content area
        mainContent.innerHTML = content;

        // Update URL without page reload
        window.history.pushState({}, '', path);

        // Initialize any scripts needed for the new content
        if (path.includes('crop/index.html') || path.endsWith('crop/')) {
            // Initialize crop rotation specific scripts
            if (window.initCropRotation) window.initCropRotation();
        } else {
            // Initialize main page specific scripts
            if (window.initMainPage) window.initMainPage();
        }
    } catch (error) {
        console.error('Error loading content:', error);
        mainContent.innerHTML = '<div class="error">Error loading content. Please try again.</div>';
    }
}

function updateActiveNavItem(section) {
    // Remove all active classes
    document.querySelectorAll('nav a').forEach(link => {
        link.classList.remove('active');
    });

    // Add active class to current section
    if (section === 'Products') {
        document.querySelector('nav .dropbtn').classList.add('active');
        document.querySelector('nav .dropdown-menu a:first-child').classList.add('active');
    } else {
        document.querySelector(`nav a[href="#${section.toLowerCase()}"]`)?.classList.add('active');
    }
} 