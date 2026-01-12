// LogoAIpro Documentation - Interactive Features
document.addEventListener('DOMContentLoaded', function() {
  initializeThemeToggle();
  initializeMobileNavigation();
  initializeScrollEffects();
  initializeCodeCopy();
  initializeSearchFunctionality();
  initializeProgressTracking();
});

// Theme Toggle Functionality
function initializeThemeToggle() {
  const themeToggle = document.querySelector('[data-theme-toggle]');
  const body = document.body;
  
  // Load saved theme or default to light
  const savedTheme = localStorage.getItem('docs-theme') || 'light';
  body.classList.toggle('dark', savedTheme === 'dark');
  updateThemeToggleIcon(savedTheme);
  
  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const isDark = body.classList.toggle('dark');
      const newTheme = isDark ? 'dark' : 'light';
      localStorage.setItem('docs-theme', newTheme);
      updateThemeToggleIcon(newTheme);
      
      // Add smooth transition effect
      body.style.transition = 'all 0.3s ease';
      setTimeout(() => {
        body.style.transition = '';
      }, 300);
    });
  }
}

function updateThemeToggleIcon(theme) {
  const themeToggle = document.querySelector('[data-theme-toggle]');
  if (themeToggle) {
    themeToggle.textContent = theme === 'dark' ? '☀️' : '🌙';
    themeToggle.setAttribute('aria-label', `Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`);
  }
}

// Mobile Navigation
function initializeMobileNavigation() {
  const sidebar = document.querySelector('.sidebar');
  const content = document.querySelector('.content');
  
  // Create mobile menu button
  const mobileMenuBtn = document.createElement('button');
  mobileMenuBtn.innerHTML = '☰';
  mobileMenuBtn.className = 'mobile-menu-btn';
  mobileMenuBtn.style.cssText = `
    display: none;
    position: fixed;
    top: 1rem;
    left: 1rem;
    z-index: 1000;
    background: var(--panel);
    border: 2px solid var(--border);
    border-radius: var(--radius-sm);
    padding: 0.75rem;
    font-size: 1.25rem;
    cursor: pointer;
    box-shadow: var(--shadow);
  `;
  
  document.body.appendChild(mobileMenuBtn);
  
  // Show mobile menu button on small screens
  function checkScreenSize() {
    if (window.innerWidth <= 768) {
      mobileMenuBtn.style.display = 'block';
      sidebar.style.transform = 'translateX(-100%)';
    } else {
      mobileMenuBtn.style.display = 'none';
      sidebar.style.transform = 'translateX(0)';
      sidebar.classList.remove('open');
    }
  }
  
  // Toggle mobile menu
  mobileMenuBtn.addEventListener('click', () => {
    sidebar.classList.toggle('open');
  });
  
  // Close menu when clicking outside
  document.addEventListener('click', (e) => {
    if (!sidebar.contains(e.target) && !mobileMenuBtn.contains(e.target)) {
      sidebar.classList.remove('open');
    }
  });
  
  // Close menu when clicking nav links
  const navLinks = sidebar.querySelectorAll('nav a');
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      sidebar.classList.remove('open');
    });
  });
  
  window.addEventListener('resize', checkScreenSize);
  checkScreenSize();
}

// Scroll Effects
function initializeScrollEffects() {
  // Smooth scrolling for anchor links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });
  
  // Add scroll-based animations
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
      }
    });
  }, observerOptions);
  
  // Observe elements for animation
  document.querySelectorAll('.feature-card, .callout, table, pre').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(el);
  });
}

// Code Copy Functionality
function initializeCodeCopy() {
  document.querySelectorAll('pre code').forEach(codeBlock => {
    const pre = codeBlock.parentElement;
    const copyBtn = document.createElement('button');
    copyBtn.innerHTML = '📋';
    copyBtn.className = 'copy-btn';
    copyBtn.style.cssText = `
      position: absolute;
      top: 0.5rem;
      right: 0.5rem;
      background: var(--panel-3);
      border: 1px solid var(--border);
      border-radius: var(--radius-sm);
      padding: 0.5rem;
      cursor: pointer;
      opacity: 0;
      transition: opacity 0.2s ease;
      font-size: 0.875rem;
    `;
    
    pre.style.position = 'relative';
    pre.appendChild(copyBtn);
    
    // Show copy button on hover
    pre.addEventListener('mouseenter', () => {
      copyBtn.style.opacity = '1';
    });
    
    pre.addEventListener('mouseleave', () => {
      copyBtn.style.opacity = '0';
    });
    
    // Copy functionality
    copyBtn.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(codeBlock.textContent);
        copyBtn.innerHTML = '✅';
        setTimeout(() => {
          copyBtn.innerHTML = '📋';
        }, 2000);
      } catch (err) {
        console.error('Failed to copy code:', err);
        copyBtn.innerHTML = '❌';
        setTimeout(() => {
          copyBtn.innerHTML = '📋';
        }, 2000);
      }
    });
  });
}

// Search Functionality
function initializeSearchFunctionality() {
  // Create search overlay
  const searchOverlay = document.createElement('div');
  searchOverlay.className = 'search-overlay';
  searchOverlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.8);
    z-index: 2000;
    display: none;
    align-items: flex-start;
    justify-content: center;
    padding-top: 10vh;
  `;
  
  const searchBox = document.createElement('div');
  searchBox.style.cssText = `
    background: var(--panel);
    border: 2px solid var(--border);
    border-radius: var(--radius);
    padding: 2rem;
    max-width: 600px;
    width: 90%;
    box-shadow: var(--shadow-lg);
  `;
  
  const searchInput = document.createElement('input');
  searchInput.type = 'text';
  searchInput.placeholder = 'Search documentation...';
  searchInput.style.cssText = `
    width: 100%;
    padding: 1rem;
    border: 2px solid var(--border);
    border-radius: var(--radius-sm);
    font-size: 1.125rem;
    background: var(--bg);
    color: var(--text);
  `;
  
  const searchResults = document.createElement('div');
  searchResults.className = 'search-results';
  searchResults.style.cssText = `
    margin-top: 1rem;
    max-height: 400px;
    overflow-y: auto;
  `;
  
  searchBox.appendChild(searchInput);
  searchBox.appendChild(searchResults);
  searchOverlay.appendChild(searchBox);
  document.body.appendChild(searchOverlay);
  
  // Keyboard shortcut (Ctrl/Cmd + K)
  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      openSearch();
    }
    
    if (e.key === 'Escape') {
      closeSearch();
    }
  });
  
  function openSearch() {
    searchOverlay.style.display = 'flex';
    searchInput.focus();
  }
  
  function closeSearch() {
    searchOverlay.style.display = 'none';
    searchInput.value = '';
    searchResults.innerHTML = '';
  }
  
  // Close search when clicking outside
  searchOverlay.addEventListener('click', (e) => {
    if (e.target === searchOverlay) {
      closeSearch();
    }
  });
  
  // Search functionality
  searchInput.addEventListener('input', debounce(performSearch, 300));
  
  function performSearch() {
    const query = searchInput.value.toLowerCase().trim();
    if (query.length < 2) {
      searchResults.innerHTML = '';
      return;
    }
    
    const results = [];
    const content = document.querySelector('.prose');
    const elements = content.querySelectorAll('h1, h2, h3, p, li');
    
    elements.forEach(el => {
      const text = el.textContent.toLowerCase();
      if (text.includes(query)) {
        results.push({
          element: el,
          text: el.textContent,
          type: el.tagName.toLowerCase()
        });
      }
    });
    
    displaySearchResults(results, query);
  }
  
  function displaySearchResults(results, query) {
    if (results.length === 0) {
      searchResults.innerHTML = '<p style="color: var(--muted); text-align: center; padding: 2rem;">No results found</p>';
      return;
    }
    
    const html = results.slice(0, 10).map(result => {
      const highlightedText = highlightQuery(result.text, query);
      return `
        <div class="search-result" style="
          padding: 1rem;
          border: 1px solid var(--border-light);
          border-radius: var(--radius-sm);
          margin-bottom: 0.5rem;
          cursor: pointer;
          transition: background 0.2s ease;
        " onclick="scrollToElement(this)" data-element-id="${result.element.id || generateId(result.element)}">
          <div style="font-weight: 600; color: var(--text);">${result.type.toUpperCase()}</div>
          <div style="color: var(--text-secondary);">${highlightedText}</div>
        </div>
      `;
    }).join('');
    
    searchResults.innerHTML = html;
  }
  
  function highlightQuery(text, query) {
    const regex = new RegExp(`(${escapeRegex(query)})`, 'gi');
    return text.replace(regex, '<mark style="background: var(--brand); color: white; padding: 0.125rem 0.25rem; border-radius: 0.25rem;">$1</mark>');
  }
  
  function escapeRegex(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
  
  function generateId(element) {
    const id = element.textContent.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
    element.id = id;
    return id;
  }
  
  // Global function for search result clicks
  window.scrollToElement = function(resultElement) {
    const elementId = resultElement.dataset.elementId;
    const targetElement = document.getElementById(elementId);
    if (targetElement) {
      closeSearch();
      targetElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      
      // Highlight the element briefly
      targetElement.style.background = 'var(--brand)';
      targetElement.style.color = 'white';
      targetElement.style.padding = '0.5rem';
      targetElement.style.borderRadius = 'var(--radius-sm)';
      targetElement.style.transition = 'all 0.3s ease';
      
      setTimeout(() => {
        targetElement.style.background = '';
        targetElement.style.color = '';
        targetElement.style.padding = '';
        targetElement.style.borderRadius = '';
      }, 2000);
    }
  };
}

// Progress Tracking
function initializeProgressTracking() {
  // Create progress bar
  const progressBar = document.createElement('div');
  progressBar.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    height: 4px;
    background: var(--brand);
    z-index: 1000;
    transition: width 0.3s ease;
    width: 0%;
  `;
  document.body.appendChild(progressBar);
  
  // Update progress on scroll
  function updateProgress() {
    const scrollTop = window.pageYOffset;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scrollPercent = (scrollTop / docHeight) * 100;
    progressBar.style.width = Math.min(scrollPercent, 100) + '%';
  }
  
  window.addEventListener('scroll', debounce(updateProgress, 10));
  updateProgress();
}

// Utility Functions
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Add keyboard shortcuts info
document.addEventListener('DOMContentLoaded', function() {
  const shortcutsInfo = document.createElement('div');
  shortcutsInfo.style.cssText = `
    position: fixed;
    bottom: 1rem;
    right: 1rem;
    background: var(--panel);
    border: 2px solid var(--border);
    border-radius: var(--radius);
    padding: 0.75rem;
    font-size: 0.875rem;
    color: var(--muted);
    z-index: 100;
    opacity: 0.7;
    transition: opacity 0.2s ease;
  `;
  shortcutsInfo.innerHTML = 'Press <kbd style="background: var(--panel-2); padding: 0.25rem 0.5rem; border-radius: 0.25rem; border: 1px solid var(--border);">Ctrl+K</kbd> to search';
  
  shortcutsInfo.addEventListener('mouseenter', () => {
    shortcutsInfo.style.opacity = '1';
  });
  
  shortcutsInfo.addEventListener('mouseleave', () => {
    shortcutsInfo.style.opacity = '0.7';
  });
  
  document.body.appendChild(shortcutsInfo);
});

// Add version checker
function checkForUpdates() {
  const currentVersion = '1.0.0';
  const versionKey = 'docs-version-check';
  const lastCheck = localStorage.getItem(versionKey);
  const now = Date.now();
  const oneDay = 24 * 60 * 60 * 1000;
  
  if (!lastCheck || (now - parseInt(lastCheck)) > oneDay) {
    // In a real implementation, this would check against a remote API
    console.log(`Documentation version: ${currentVersion}`);
    localStorage.setItem(versionKey, now.toString());
  }
}

// Initialize update checker
document.addEventListener('DOMContentLoaded', checkForUpdates);


