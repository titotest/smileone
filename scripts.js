document.addEventListener('DOMContentLoaded', () => {
    // Element references with error handling
    const title = document.getElementById('title');
    const menu = document.getElementById('menu');
    const fornoobies = document.querySelector('.fornoobies');
    const he = document.querySelector('.he');
    const ho = document.querySelector('.ho');
    if (!title || (!menu && window.location.pathname.includes('index'))) {
        console.error('Required elements not found: title or menu');
        return;
    }

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
        history.replaceState({ menuVisible: true }, '', window.location.pathname); // Clear URL param
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
        if (!menu) return; // Skip for subpages
        requestAnimationFrame(() => {
            title.classList.toggle('at-top', isMenuVisible); // Move title to top
            menu.classList.toggle('visible', isMenuVisible); // Show/hide menu
            if (!isSmiley) {
                currentRotation = 0;
                title.style.transform = ''; // Clear inline transform to rely on CSS
            }
        });
    };

    // Reset title to "REMORPH DESIGN" with a quick transition
    const resetTitle = () => {
        isSmiley = false;
        clearTimeout(timeoutId);
        timeoutId = null;
        isAnimating = false;
        currentRotation = 0;
        title.textContent = 'REMORPH DESIGN';
        title.style.width = ''; // Clear fixed width
        title.style.transition = 'transform 0.1s ease'; // Quick reset transition
        title.style.transform = isMenuVisible
            ? `translateX(-50%) rotate(${currentRotation}deg) scale(1)`
            : `translate(-50%, -50%) rotate(${currentRotation}deg) scale(1)`;
        title.offsetHeight; // Force reflow to ensure transition
        title.style.transition = 'top var(--transition-duration) ease, transform var(--transition-duration) ease'; // Restore default transition
    };

    // Toggle menu visibility and update history state (main page only)
    const toggleMenu = () => {
        if (!menu) return; // Skip for subpages
        isMenuVisible = !isMenuVisible;
        hasMenuBeenShown = true; // Mark that menu has been shown
        if (fornoobies) fornoobies.classList.add('hidden'); // Hide fornoobies
        resetTitle(); // Reset title on any scroll
        updateLayout();
        history.pushState({ menuVisible: isMenuVisible }, '', window.location.pathname); // Update history
        resetIdleTimer(); // Reset fornoobies timer
    };

    // Update title rotation and scale for animation
    const updateRotation = (targetRotation, duration, scale) => {
        if (isAnimating) return;
        isAnimating = true;
        // Normalize rotation to avoid large values
        while (currentRotation > targetRotation) {
            currentRotation -= 360;
        }
        currentRotation = targetRotation;
        title.style.transition = `transform ${duration}s ease`;
        title.style.transform = isMenuVisible
            ? `translateX(-50%) rotate(${currentRotation}deg) scale(${scale})`
            : `translate(-50%, -50%) rotate(${currentRotation}deg) scale(${scale})`;
        title.offsetHeight; // Force reflow to ensure transition
    };

    // Handle title click to trigger smiley animation
    const handleTitleClick = () => {
        if (!menu) {
            // Subpage: Navigate to index.html with menu visible
            window.location.href = 'https://www.remorphdesign.com/?menu=visible';
            return;
        }
        if (isMenuVisible || isAnimating) return;
        
        if (!isSmiley) {
            const width = title.offsetWidth + 'px';
            title.style.width = width; // Fix width to prevent layout shift
            title.textContent = ':-)';
            isSmiley = true;
            updateRotation(90, 0.2, 1.2); // Rotate 90° clockwise, scale up
            timeoutId = setTimeout(() => {
                if (!isMenuVisible) {
                    title.textContent = 'REMORPH DESIGN';
                    title.style.width = ''; // Clear fixed width
                    isSmiley = false;
                    updateRotation(0, 0.2, 1); // Rotate back 90° counterclockwise
                    timeoutId = null;
                }
            }, 1000);
        } else {
            clearTimeout(timeoutId);
            timeoutId = null;
            title.textContent = 'REMORPH DESIGN';
            title.style.width = ''; // Clear fixed width
            isSmiley = false;
            updateRotation(360, 0.4, 1); // Complete 270° clockwise to 360°
        }
    };

    // Reset rotation after full circle animation
    title.addEventListener('transitionend', (e) => {
        if (e.propertyName === 'transform' && currentRotation === 360) {
            currentRotation = 0;
            title.style.transition = 'none';
            title.style.transform = isMenuVisible
                ? `translateX(-50%) rotate(${currentRotation}deg) scale(1)`
                : `translate(-50%, -50%) rotate(${currentRotation}deg) scale(1)`;
            setTimeout(() => {
                title.style.transition = 'top var(--transition-duration) ease, transform var(--transition-duration) ease';
            }, 0);
        }
        isAnimating = false;
    });

    // Fornoobies animation: Show "heho" after 3s inactivity, repeat every 6s (main page only)
    const startIdleTimer = () => {
        if (!fornoobiesMode || !fornoobies) return; // Skip if disabled or subpage
        idleTimeout = setTimeout(() => {
            if (!isMenuVisible && !hasMenuBeenShown) {
                // Show "heho" animation
                fornoobies.classList.remove('hidden');
                fornoobies.classList.remove('show'); // Reset animation
                fornoobies.classList.add('show');
                // Hide after animation (1.4s total duration)
                setTimeout(() => {
                    fornoobies.classList.add('hidden');
                }, 1400);
                // Repeat every 6s (subtract 1.4s animation duration)
                setTimeout(startIdleTimer, 6000 - 1400);
            }
        }, 3000);
    };

    // Reset the idle timer on user interaction
    const resetIdleTimer = () => {
        if (!fornoobiesMode || !fornoobies) return; // Skip if disabled or subpage
        clearTimeout(idleTimeout);
        startIdleTimer();
    };

    // Main page-specific logic
    if (menu) {
        // Handle wheel scroll to toggle menu
        document.addEventListener('wheel', (e) => {
            e.preventDefault();
            if (e.deltaY < 0 && isMenuVisible) toggleMenu(); // Scroll up: hide menu
            else if (e.deltaY > 0 && !isMenuVisible) toggleMenu(); // Scroll down: show menu
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
                if (deltaY < 0 && isMenuVisible) toggleMenu(); // Swipe up: hide menu
                else if (deltaY > 0 && !isMenuVisible) toggleMenu(); // Swipe down: show menu
            }
        }, { passive: false });

        // Title click interaction
        title.addEventListener('click', () => {
            handleTitleClick();
            resetIdleTimer();
        });

        // Menu item interactions (tap, click)
        document.querySelectorAll('.menu-item').forEach(item => {
            const handlePressStart = () => item.classList.add('tapped');
            const handlePressEnd = () => item.classList.remove('tapped');
            const handleClick = () => {
                if (!item.href) console.log(`${item.textContent} clicked!`); // Placeholder
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

        // Fornoobies click/tap interaction: clicking "he" or "ho" toggles menu
        if (fornoobies && he && ho) {
            const handleFornoobiesClick = () => {
                if (!isMenuVisible) toggleMenu(); // Show menu if not visible
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

        // Handle back/forward navigation to restore menu state
        window.addEventListener('popstate', (e) => {
            const menuVisible = e.state?.menuVisible || false;
            if (isMenuVisible !== menuVisible) {
                isMenuVisible = menuVisible;
                hasMenuBeenShown = isMenuVisible; // Sync fornoobies state
                updateLayout();
            }
        });

        // Handle window resize with debouncing
        window.addEventListener('resize', debounce(() => {
            updateLayout();
            resetIdleTimer();
        }, 100));

        // Start the idle timer for fornoobies animation
        startIdleTimer();
        updateLayout(); // Initial layout setup based on history state
    } else {
        // Subpage-specific logic (e.g., 3d.html)
        title.addEventListener('click', () => {
            window.location.href = 'https://www.remorphdesign.com/?menu=visible';
            resetIdleTimer();
        });
    }
});