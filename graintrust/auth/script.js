var w = 100, h = 113, r = 18,
      wx = w / 2, wy = h / 2 - r, angle = 45, liArray = [],
      load = document.getElementById('ant-motion-load'),
      ul = load.getElementsByTagName('ul')[0];
    
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
        heroImage.style.marginTop = '0';
        clearInterval(typingInterval);
        overviewText.textContent = '';
        overviewBtn.textContent = 'Overview';
        isOverviewVisible = false;
      } else {
        // Show overview
        overviewContainer.classList.add('show');
        heroImage.style.marginTop = '30px';
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
            overviewContainer.scrollTop = overviewContainer.scrollHeight;
          } else {
            clearInterval(typingInterval);
          }
        }, 20); // Adjust typing speed here (lower = faster)
      }
    }
    
    overviewBtn.addEventListener('click', toggleOverview);
    
    // Close modal when clicking outside content
    window.onclick = function(event) {
      const modal = document.getElementById('overviewModal');
      if (event.target == modal) {
        closeModal();
      }
    }
    
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

    function getStyle(el) {
      if (window.getComputedStyle) {
        return window.getComputedStyle(el, null);
      } else if (document.documentElement.currentStyle) {
        return el.currentStyle;
      }
      return null;
    }

    function removeLoad() {
      load.parentNode.removeChild(load);
    }

    function animationStart() {
      var computed = getStyle(load);
      if (!load || computed.opacity === '0') {
        removeLoad();
        return;
      }
      setTimeout(function() {
        if (computed.opacity === '0') {
          removeLoad();
          return;
        }
        liArray.forEach(function(item, i) {
          item.style.transform = 'scale(0)';
          item.style.transitionDelay = (i === liArray.length - 1 ? 10 : i) * .007 + 's';
          item.style.transitionTimingFunction = 'cubic-bezier(0.68, -0.55, 0.265, 1.55)';
        });
        setTimeout(function() {
          if (computed.opacity === '0') {
            removeLoad();
            return;
          }
          liArray.forEach(function(item, i) {
            item.style.transform = 'scale(1)';
            item.style.transitionDelay = (i === liArray.length - 1 ? 10 : i) * .007 + 's';
            item.style.transitionTimingFunction = 'cubic-bezier(0.175, 0.885, 0.32, 1.275)';
          });
          setTimeout(animationStart, 1300);
        }, 1300);
      }, 100);
    }
    
    // Start loading animation
    document.addEventListener('DOMContentLoaded', function() {
      animationStart();
      
      // Hide loading animation after page is fully loaded
      window.addEventListener('load', function() {
        load.style.opacity = '0';
        setTimeout(removeLoad, 500);
      });
    });
    
    // Language detection (same as original)
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
    
    // Google Analytics (same as original)
    (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
    (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
    m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
    })(window,document,'script','https://www.google-analytics.com/analytics.js','ga');
    
    ga('create', 'UA-83857924-2', 'auto');
    ga('send', 'pageview');