var w = 100, h = 113, r = 18,
      wx = w / 2, wy = h / 2 - r, angle = 45, liArray = [],
      load = document.getElementById('ant-motion-load'),
      ul = load ? load.getElementsByTagName('ul')[0] : null;
    
    // Overview text typing effect
    const overviewBtn = document.getElementById('overviewBtn');
    const overviewContainer = document.getElementById('overviewContainer');
    const overviewText = document.getElementById('overviewText');
    const heroImage = document.getElementById('heroImage');
    
    const overviewContent = `We ensures secure, tamper-proof verification of medicines. We records drug details like batch numbers, manufacturer data, and supply chain movements on a decentralized ledger..`;
    
    let isOverviewVisible = false;
    let typingInterval;
    
    function toggleOverview() {
      if (isOverviewVisible) {
        // Hide overview
        overviewContainer.classList.remove('show');
        if (heroImage) {
          heroImage.style.marginTop = '0';
        }
        clearInterval(typingInterval);
        overviewText.textContent = '';
        overviewBtn.textContent = 'Overview';
        isOverviewVisible = false;
      } else {
        // Show overview
        overviewContainer.classList.add('show');
        if (heroImage) {
          heroImage.style.marginTop = '30px';
        }
        overviewBtn.textContent = 'Hide Overview';
        isOverviewVisible = true;
        
        // Start typing effect
        let charIndex = 0;
        overviewText.innerHTML = '<span class="typing-cursor"></span>';
        
        typingInterval = setInterval(() => {
          if (charIndex < overviewContent.length) {
            overviewText.textContent = overviewContent.substring(0, charIndex + 1);
            charIndex++;
            // Scroll to keep the cursor in view
            if (overviewContainer.scrollTop !== undefined) {
              overviewContainer.scrollTop = overviewContainer.scrollHeight;
            }
          } else {
            clearInterval(typingInterval);
          }
        }, 20); // Adjust typing speed here (lower = faster)
      }
    }
    
    // Add event listener only if button exists
    if (overviewBtn) {
      overviewBtn.addEventListener('click', toggleOverview);
    }
    
    // Loading animation setup
    if (ul && liArray) {
      for (var i = 0; i < 74; i++) {
        var li = document.createElement('li');
        ul.appendChild(li);
        liArray.push(li);
        var _left = 110, _top = 110, _x, _y;
        if (i < 25) {
          _left = -wx;
          _top = wy - r / 5 * i;
        } else if (i < 41) {
          angle = 45 * Math.PI / 180;
          _left = -wx + (i - 24) * (r / 5) * Math.cos(angle);
          _top = wy - r / 5 * 24 + (i - 24) * (r / 5) * Math.sin(angle);
        } else if (i < 57) {
          _x = -wx + 16 * (r / 5) * Math.cos(45 * Math.PI / 180);
          _y = wy - r / 5 * 24 + 16 * (r / 5) * Math.sin(45 * Math.PI / 180);
          angle = -45 * Math.PI / 180;
          _left = _x + (i - 40) * (r / 5) * Math.cos(angle);
          _top = _y + (i - 40) * (r / 5) * Math.sin(angle);
        } else if (i < 73) {
          _left = _x + 16 * (r / 5) * Math.cos(-45 * Math.PI / 180);
          _top = (wy - r / 5 * 24) + r / 5 * (i - 56);
        } else {
          _left = -25;
          _top = 10;
          r = 14;
        }
        li.style.left = _left + 'px';
        li.style.top = _top + 'px';
        li.style.width = r + 'px';
        li.style.height = r + 'px';
      }
    }

    function getStyle(el) {
      if (!el) return null;
      if (window.getComputedStyle) {
        return window.getComputedStyle(el, null);
      } else if (document.documentElement.currentStyle) {
        return el.currentStyle;
      }
      return null;
    }

    function removeLoad() {
      if (load && load.parentNode) {
        load.parentNode.removeChild(load);
      }
    }

    function animationStart() {
      if (!load) return;
      
      var computed = getStyle(load);
      if (!computed || computed.opacity === '0') {
        removeLoad();
        return;
      }
      
      setTimeout(function() {
        if (!load) return;
        
        computed = getStyle(load);
        if (!computed || computed.opacity === '0') {
          removeLoad();
          return;
        }
        
        liArray.forEach(function(item, i) {
          if (item && item.style) {
            item.style.transform = 'scale(0)';
            item.style.transitionDelay = (i === liArray.length - 1 ? 10 : i) * .007 + 's';
            item.style.transitionTimingFunction = 'cubic-bezier(0.68, -0.55, 0.265, 1.55)';
          }
        });
        
        setTimeout(function() {
          if (!load) return;
          
          computed = getStyle(load);
          if (!computed || computed.opacity === '0') {
            removeLoad();
            return;
          }
          
          liArray.forEach(function(item, i) {
            if (item && item.style) {
              item.style.transform = 'scale(1)';
              item.style.transitionDelay = (i === liArray.length - 1 ? 10 : i) * .007 + 's';
              item.style.transitionTimingFunction = 'cubic-bezier(0.175, 0.885, 0.32, 1.275)';
            }
          });
          
          setTimeout(animationStart, 1300);
        }, 1300);
      }, 100);
    }
    
    // Start loading animation
    document.addEventListener('DOMContentLoaded', function() {
      // Initialize loading animation
      if (load) {
        animationStart();
      }
      
      // Hide loading animation after page is fully loaded
      window.addEventListener('load', function() {
        if (load) {
          load.style.opacity = '0';
          setTimeout(removeLoad, 500);
        }
      });
      
      // Initialize mobile-specific functionality
      initializeMobileFeatures();
    });
    
    // Mobile-specific initialization
    function initializeMobileFeatures() {
      // Optimize performance for mobile devices
      if (window.innerWidth <= 768) {
        // Reduce animation complexity on mobile
        if (liArray.length > 0) {
          liArray.forEach(function(item, i) {
            if (item && item.style && i % 2 === 0) {
              item.style.display = 'none';
            }
          });
        }
        
        // Optimize image loading
        const images = document.querySelectorAll('img');
        images.forEach(img => {
          if (img.getAttribute('loading') !== 'lazy') {
            img.setAttribute('loading', 'lazy');
          }
        });
        
        // Add touch-friendly interactions
        addTouchInteractions();
      }
    }
    
    // Add touch interactions for better mobile UX
    function addTouchInteractions() {
      const interactiveElements = document.querySelectorAll('.btn, .feature-card, .template-card');
      
      interactiveElements.forEach(element => {
        element.addEventListener('touchstart', function() {
          this.classList.add('touched');
        }, { passive: true });
        
        element.addEventListener('touchend', function() {
          setTimeout(() => {
            this.classList.remove('touched');
          }, 150);
        }, { passive: true });
      });
    }
    
    // Enhanced overview functionality for mobile
    function mobileOptimizedOverview() {
      if (window.innerWidth <= 768 && overviewContainer) {
        // Adjust typing speed for mobile
        const mobileTypingSpeed = 30; // Slower for mobile
        
        // Override the original typing function for mobile
        if (isOverviewVisible && typingInterval) {
          clearInterval(typingInterval);
          
          let charIndex = 0;
          overviewText.innerHTML = '<span class="typing-cursor"></span>';
          
          typingInterval = setInterval(() => {
            if (charIndex < overviewContent.length) {
              overviewText.textContent = overviewContent.substring(0, charIndex + 1);
              charIndex++;
            } else {
              clearInterval(typingInterval);
            }
          }, mobileTypingSpeed);
        }
      }
    }
    
    // Language detection (enhanced for mobile)
    (function() {
      function isLocalStorageNameSupported() {
        var testKey = 'test';
        var storage = window.localStorage;
        try {
          storage.setItem(testKey, '1');
          storage.removeItem(testKey);
          return true;
        } catch (error) {
          return false;
        }
      }
      
      var pathname = location.pathname;
      
      function isZhCN(pathname) {
        return /-cn\/?$/.test(pathname);
      }
      
      function getLocalizedPathname(path, zhCN) {
        var pathname = path.startsWith('/') ? path : '/' + path;
        if (!zhCN) { // to enUS
          if (/^\/?index-cn/.test(pathname)) {
            return '/';
          }
          return /\/?index-cn/.test(pathname) ? pathname.replace('/index-cn', '') : pathname.replace('-cn', '');
        } else if (pathname === '/') {
          return '/index-cn';
        } else if (pathname.match('/edit')) {
          return '/edit/index-cn';
        } else if (pathname.endsWith('/')) {
          return pathname.replace(/\/$/, '-cn/');
        }
        return pathname + '-cn';
      }
      
      if (isLocalStorageNameSupported()) {
        var lang = (window.localStorage && localStorage.getItem('locale')) || 
                  (navigator.language.toLowerCase() === 'zh-cn' ? 'zh-CN' : 'en-US');
        if ((lang === 'zh-CN') !== isZhCN(pathname)) {
          location.pathname = getLocalizedPathname(pathname, lang === 'zh-CN');
        }
      }
      document.documentElement.className += isZhCN(pathname) ? 'zh-cn' : 'en-us';
    })();
    
    // Google Analytics (with error handling)
    (function(i,s,o,g,r,a,m){
  i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
  (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
  m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
})(window,document,'script','https://www.google-analytics.com/analytics.js','ga');

try {
  if (typeof ga !== 'undefined') {
    ga('create', 'UA-83857924-2', 'auto');
    ga('send', 'pageview');
  }
} catch (error) {
  console.log('Analytics not loaded');
}
    // Window resize handler for responsive adjustments
    let resizeTimeout;
    window.addEventListener('resize', function() {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(function() {
        // Reinitialize mobile features if switching to/from mobile view
        const wasMobile = document.body.classList.contains('mobile-view');
        const isMobile = window.innerWidth <= 768;
        
        if (wasMobile !== isMobile) {
          if (isMobile) {
            document.body.classList.add('mobile-view');
            initializeMobileFeatures();
          } else {
            document.body.classList.remove('mobile-view');
          }
        }
        
        // Adjust overview container for different screen sizes
        if (overviewContainer && isOverviewVisible) {
          mobileOptimizedOverview();
        }
      }, 250);
    });
    
    // Expose functions for external use
    window.GrainTrustCore = {
      toggleOverview: toggleOverview,
      removeLoad: removeLoad,
      initializeMobileFeatures: initializeMobileFeatures
    };