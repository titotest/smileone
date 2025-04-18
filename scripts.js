document.addEventListener('DOMContentLoaded', () => {
    // Element references with error handling
    const title = document.getElementById('title');
    const menu = document.getElementById('menu');
    const fornoobies = document.querySelector('.fornoobies');
    const he = document.querySelector('.he');
    const ho = document.querySelector('.ho');

    // State variables
    let isSmiley = false; // Tracks if title is showing ":-)"
    let isMenuVisible = history.state?.menuVisible || false; // Initialize from history state
    let isAnimating = false; // Prevents animation conflicts
    let currentRotation = 0; // Tracks title rotation angle
    let timeoutId = null; // Stores timeout for smiley revert
    let touchStartY = 0; // Tracks touch start position for swipe
    const swipeThreshold = 50; // Minimum swipe distance to toggle menu

    // Fornoobies feature state (main page only)
    const fornoobiesMode = !!menu; // Enable only if menu exists
    let hasMenuBeenShown = isMenuVisible; // Track if menu has been shown
    let idleTimeout; // Timer for inactivity detection

    // Check URL parameter to show menu on load (for navigation from subpages)
    const urlParams = new URLSearchParams(window.location.search);
    if (menu && urlParams.get('menu') === 'visible') {
        isMenuVisible = true;
        hasMenuBeenShown = true;
        history.replaceState({ menuVisible: true }, '', window.location.pathname); // Clear URL param, update history
    }

    // Debounce utility for resize events
    const debounce = (func, wait) => {
        let timeout;
        return (...args) => {
            clearTimeout(timeout);
            timeout = setTimeout(() => func(...args), wait);
        };
    };

    // Update layout based on menu visibility (main page only)
    const updateLayout = () => {
        if (!menu || !title) return; // Skip for subpages or if elements are missing
        // Toggle classes to handle positioning via CSS
        title.classList.toggle('at-top', isMenuVisible);
        menu.classList.toggle('visible', isMenuVisible);
        // Reset inline styles to prevent conflicts with CSS transitions
        if (!isSmiley) {
            title.style.transition = ''; // Inherit from CSS
            title.style.transform = ''; // Let CSS handle transform
            title.style.width = ''; // Clear any fixed width
        }
    };

    // Reset title to "REMORPH DESIGN" with a quick transition (main page only)
    const resetTitle = () => {
        isSmiley = false;
        clearTimeout(timeoutId);
        timeoutId = null;
        isAnimating = false;
        currentRotation = 0;
        title.textContent = 'REMORPH DESIGN';
        title.style.width = ''; // Clear fixed width
        title.style.transition = 'transform 0.1s ease'; // Quick reset
        title.style.transform = ''; // Reset to CSS-defined transform
        title.offsetHeight; // Force reflow
        title.style.transition = ''; // Restore CSS transition
    };

    // Toggle menu visibility and update history state (main page only)
    const toggleMenu = () => {
        if (!menu) return; // Skip for subpages
        isMenuVisible = !isMenuVisible;
        hasMenuBeenShown = true; // Mark menu shown
        if (fornoobies) fornoobies.classList.add('hidden'); // Hide fornoobies
        resetTitle(); // Reset title
        updateLayout();
        history.pushState({ menuVisible: isMenuVisible }, '', window.location.pathname); // Update history
        resetIdleTimer(); // Reset fornoobies timer
    };

    // Update title rotation and scale for animation (main page only)
    const updateRotation = (targetRotation, duration, scale) => {
        if (isAnimating) return;
        isAnimating = true;
        while (currentRotation > targetRotation) {
            currentRotation -= 360; // Normalize rotation
        }
        currentRotation = targetRotation;
        title.style.transition = `transform ${duration}s ease`;
        title.style.transform = `translate(-50%, ${menu && isMenuVisible ? '0' : '-50%'}) rotate(${currentRotation}deg) scale(${scale})`;
        title.offsetHeight; // Force reflow
    };

    // Handle title click: smiley animation for main page, navigation for subpages
    const handleTitleClick = () => {
        if (!menu) {
            // Subpage: Navigate to index.html with menu visible
            window.location.href = 'https://www.remorphdesign.com/?menu=visible';
            return;
        }
        if (isMenuVisible) return; // Disable in menu mode
        
        if (!isSmiley) {
            const width = title.offsetWidth + 'px';
            title.style.width = width; // Fix width
            title.textContent = ':-)';
            isSmiley = true;
            updateRotation(90, 0.2, 1.2); // Rotate 90°, scale up
            timeoutId = setTimeout(() => {
                if (!isMenuVisible) {
                    title.textContent = 'REMORPH DESIGN';
                    title.style.width = '';
                    isSmiley = false;
                    updateRotation(0, 0.2, 1); // Rotate back
                    timeoutId = null;
                }
            }, 1000);
        } else {
            clearTimeout(timeoutId);
            timeoutId = null;
            title.textContent = 'REMORPH DESIGN';
            title.style.width = '';
            isSmiley = false;
            updateRotation(360, 0.4, 1); // Complete to 360°
        }
    };

    // Reset rotation after full circle animation
    if (title) {
        title.addEventListener('transitionend', (e) => {
            if (e.propertyName === 'transform' && currentRotation === 360) {
                currentRotation = 0;
                title.style.transition = 'none';
                title.style.transform = ''; // Reset to CSS-defined transform
                setTimeout(() => {
                    title.style.transition = ''; // Restore CSS transition
                }, 0);
            }
            isAnimating = false;
        });

        // Title click interaction
        title.addEventListener('click', () => {
            handleTitleClick();
            resetIdleTimer();
        });
    }

    // Fornoobies animation: Show "heho" after 3s inactivity (main page only)
    const startIdleTimer = () => {
        if (!fornoobiesMode || !fornoobies) return;
        idleTimeout = setTimeout(() => {
            if (!isMenuVisible && !hasMenuBeenShown) {
                fornoobies.classList.remove('hidden');
                fornoobies.classList.remove('show');
                fornoobies.offsetHeight; // Force reflow
                fornoobies.classList.add('show');
                setTimeout(() => {
                    fornoobies.classList.add('hidden');
                }, 1400);
                setTimeout(startIdleTimer, 6000 - 1400);
            }
        }, 3000);
    };

    // Reset the idle timer on user interaction
    const resetIdleTimer = () => {
        if (!fornoobiesMode || !fornoobies) return;
        clearTimeout(idleTimeout);
        startIdleTimer();
    };

    // Main page-specific logic
    if (menu) {
        // Handle wheel scroll to toggle menu
        document.addEventListener('wheel', (e) => {
            e.preventDefault();
            if (e.deltaY < 0 && isMenuVisible) toggleMenu(); // Scroll up: hide
            else if (e.deltaY > 0 && !isMenuVisible) toggleMenu(); // Scroll down: show
        }, { passive: false });

        // Handle touch swipe to toggle menu
        document.addEventListener('touchstart', (e) => {
            touchStartY = e.touches[0].clientY;
            resetIdleTimer();
        }, { passive: true });

        document.addEventListener('touchmove', (e) => {
            e.preventDefault();
            const touchEndY = e.touches[0].clientY;
            const deltaY = touchStartY - touchEndY;
            if (Math.abs(deltaY) > swipeThreshold) {
                if (deltaY < 0 && isMenuVisible) toggleMenu(); // Swipe up: hide
                else if (deltaY > 0 && !isMenuVisible) toggleMenu(); // Swipe down: show
            }
        }, { passive: false });

        // Menu item interactions
        document.querySelectorAll('.menu-item').forEach(item => {
            const handlePressStart = () => item.classList.add('tapped');
            const handlePressEnd = () => item.classList.remove('tapped');
            const handleClick = () => {
                if (!item.href) console.log(`${item.textContent} clicked!`);
                resetIdleTimer();
            };

            item.addEventListener('mousedown', handlePressStart);
            item.addEventListener('mouseup', handlePressEnd);
            item.addEventListener('mouseleave', handlePressEnd);
            item.addEventListener('touchstart', (e) => {
                if (!item.href) e.preventDefault();
                handlePressStart();
            }, { passive: false });
            item.addEventListener('touchend', (e) => {
                if (!item.href) e.preventDefault();
                handlePressEnd();
            }, { passive: false });
            item.addEventListener('touchcancel', handlePressEnd);
            item.addEventListener('click', handleClick);
        });

        // Fornoobies click/tap interaction
        if (fornoobies && he && ho) {
            const handleFornoobiesClick = () => {
                if (!isMenuVisible) toggleMenu();
            };

            he.addEventListener('click', handleFornoobiesClick);
            ho.addEventListener('click', handleFornoobiesClick);
            he.addEventListener('touchstart', (e) => {
                e.preventDefault();
                handleFornoobiesClick();
            }, { passive: false });
            ho.addEventListener('touchstart', (e) => {
                e.preventDefault();
                handleFornoobiesClick();
            }, { passive: false });
        }

        // Handle back/forward navigation
        window.addEventListener('popstate', (e) => {
            const menuVisible = e.state?.menuVisible || false;
            if (isMenuVisible !== menuVisible) {
                isMenuVisible = menuVisible;
                hasMenuBeenShown = isMenuVisible;
                updateLayout();
            }
        });

        // Handle window resize
        window.addEventListener('resize', debounce(() => {
            updateLayout();
            resetIdleTimer();
        }, 100));

        // Start fornoobies timer
        startIdleTimer();
        updateLayout(); // Initial layout
    }
});