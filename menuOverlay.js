// Mobile menu functionality
document.addEventListener('DOMContentLoaded', function() {
    const menuToggle = document.getElementById('menuToggle');
    const mainNav = document.getElementById('mainNav');
    const menuOverlay = document.getElementById('menuOverlay');
    const dropdownToggles = document.querySelectorAll('.dropdown-toggle');
    
    // Handle resize for mobile/desktop view
    function handleResize() {
        if(window.innerWidth > 768) {
            if(menuToggle) menuToggle.style.display = 'none';
            if(mainNav) {
                mainNav.classList.remove('active');
                mainNav.style.display = ''; // Reset display property
            }
            if(menuOverlay) menuOverlay.classList.remove('active');
        } else {
            if(menuToggle) menuToggle.style.display = 'flex';
        }
    }

    // Close all dropdowns helper
    function closeAllDropdowns() {
        document.querySelectorAll('.dropdown-menu.show, .user-dropdown-menu.show')
            .forEach(menu => menu.classList.remove('show'));
    }

    // Close mobile menu helper
    function closeMobileMenu() {
        if(mainNav) mainNav.classList.remove('active');
        if(menuOverlay) menuOverlay.classList.remove('active');
        if(menuToggle) menuToggle.textContent = '☰';
        document.body.style.overflow = '';
        closeAllDropdowns();
    }

    // Toggle mobile menu
    function toggleMobileMenu() {
        mainNav.classList.toggle('active');
        menuOverlay.classList.toggle('active');
        document.body.style.overflow = mainNav.classList.contains('active') ? 'hidden' : '';
        if(menuToggle) menuToggle.textContent = mainNav.classList.contains('active') ? '✕' : '☰';
    }

    // Initialize event listeners
    if (menuToggle && mainNav && menuOverlay) {
        // Menu toggle click
        menuToggle.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            toggleMobileMenu();
        });

        // Overlay click
        menuOverlay.addEventListener('click', closeMobileMenu);

        // Close menu when clicking menu items
        mainNav.querySelectorAll('a:not(.dropdown-toggle)').forEach(item => {
            item.addEventListener('click', function() {
                if (window.innerWidth <= 768 && mainNav.classList.contains('active')) {
                    closeMobileMenu();
                }
            });
        });
    }

    // Handle dropdowns
    dropdownToggles.forEach(toggle => {
        toggle.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            const dropdownMenu = this.nextElementSibling;
            if (dropdownMenu && dropdownMenu.classList.contains('dropdown-menu')) {
                closeAllDropdowns();
                dropdownMenu.classList.toggle('show');
            }
        });
    });

    // Close dropdowns when clicking outside
    document.addEventListener('click', function(e) {
        if (!e.target.closest('.dropdown') && !e.target.matches('.dropdown-toggle')) {
            closeAllDropdowns();
        }
    });

    // Initialize resize handler
    window.addEventListener('resize', handleResize);
    handleResize(); // Initial check
});
