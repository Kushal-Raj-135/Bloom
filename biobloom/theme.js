document.addEventListener('DOMContentLoaded', () => {
    const themeToggle = document.getElementById('themeToggle');
    if (!themeToggle) return; 

    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);

    const sunIcon = document.createElement('i');
    sunIcon.className = 'fas fa-sun theme-icon-light';
    
    const moonIcon = document.createElement('i');
    moonIcon.className = 'fas fa-moon theme-icon-dark';
    
    const themeText = document.createElement('span');
    themeText.textContent = savedTheme === 'light' ? 'Light Mode' : 'Dark Mode';

    themeToggle.innerHTML = '';
    themeToggle.appendChild(sunIcon);
    themeToggle.appendChild(moonIcon);
    themeToggle.appendChild(themeText);

    themeToggle.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);

        themeText.textContent = newTheme === 'light' ? 'Light Mode' : 'Dark Mode';
    });
});






