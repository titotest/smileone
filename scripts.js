document.addEventListener('DOMContentLoaded', () => {
    // Editable menu auto-trigger delay for index page (in milliseconds)
    const MENU_AUTO_TRIGGER_DELAY = 500; // 0.5 seconds, change this to adjust delay (e.g., 800 for 0.8 seconds)

    // Disable or enable fornoobies mode (set to false to disable)
    const fornoobiesEnabled = false;

    // Block zoom gestures in scripts.js for consistency
    window.addEventListener('wheel', (e) => {
        if (e.ctrlKey || e.metaKey) e.preventDefault();
    }, { passive: false });
    document.addEventListener('gesturestart', (e) => e.preventDefault());
    document.addEventListener('gesturechange', (e) => e.preventDefault());
    document.addEventListener('gestureend', (e) => e.preventDefault());
    document.addEventListener('touchstart', (e) => {
        if (e.touches.length > 1) e.preventDefault();
    }, { passive: false });

    const title = document.getElementById('title');
    const menu = document.getElementById('menu');
    const fornoobies = document.querySelector('.fornoobies');
    const he = document.querySelector('.he');
    const ho = document.querySelector('.ho');
    const iframe = document.getElementById('fullscreen-iframe');
    const loadingMessage = document.querySelector('.loading-message');
    const errorMessage = document.querySelector('.error-message');

    let isSmiley = false;
    let isMenuVisible = history.state?.menuVisible || false;
    let isAnimating = false;
    let currentRotation = 0;
    let timeoutId = null;
    let touchStartY = 0;
    let pendingToggle = null;

    const fornoobiesMode = !!menu && fornoobiesEnabled;
    let hasMenuBeenShown = isMenuVisible;
    let idleTimeout;

    const urlParams = new URLSearchParams(window.location.search);
    const isInitialMenuVisible = menu && urlParams.get('menu') === 'visible';
    if (isInitialMenuVisible) {
        isMenuVisible = true;
        hasMenuBeenShown = true;
        history.replaceState({ menuVisible: true }, '', window.location.pathname);
    }

    const debounce = (func, wait) => {
        let timeout;
        return (...args) => {
            clearTimeout(timeout);
            timeout = setTimeout(() => func(...args), wait);
        };
    };

    const updateLayout = (isInitialLoad = false) => {
        if (!menu) return;
        title.style.transform = '';
        title.offsetHeight;
        if (isInitialLoad) {
            title.style.transition = 'none';
            title.classList.remove('at-top');
            menu.classList.remove('visible');
            if (isInitialMenuVisible) {
                title.classList.add('at-top');
                menu.classList.add('visible');
            }
            menu.style.transition = 'none';
            setTimeout(() => {
                title.style.transition = 'top var(--transition-duration) var(--transition-easing), transform var(--transition-duration) var(--transition-easing)';
                menu.style.transition = 'top var(--transition-duration) var(--transition-easing), transform var(--transition-duration) var(--transition-easing), opacity var(--transition-duration) var(--transition-easing), visibility var(--transition-duration) var(--transition-easing)';
            }, 0);
        } else {
            title.offsetHeight;
            title.style.transition = 'top var(--transition-duration) var(--transition-easing), transform var(--transition-duration) var(--transition-easing)';
            title.offsetHeight;
            title.classList.toggle('at-top', isMenuVisible);
            menu.classList.toggle('visible', isMenuVisible);
            title.offsetHeight;
        }
    };

    const resetTitle = () => {
        isSmiley = false;
        clearTimeout(timeoutId);
        timeoutId = null;
        isAnimating = false;
        currentRotation = 0;
        title.style.transition = 'none';
        title.textContent = 'REMORPH DESIGN';
        title.style.width = '';
        title.style.transform = '';
        title.offsetHeight;
    };

    const toggleMenu = (newState) => {
        if (!menu) return;

        isMenuVisible = newState;
        hasMenuBeenShown = true;
        if (fornoobies) fornoobies.classList.add('hidden');
        resetTitle();
        updateLayout();
        history.pushState({ menuVisible: isMenuVisible }, '', window.location.pathname);
        resetIdleTimer();

        if (pendingToggle !== null) {
            const nextState = pendingToggle;
            pendingToggle = null;
            requestAnimationFrame(() => toggleMenu(nextState));
        }
    };

    const handleScroll = (showMenu) => {
        toggleMenu(showMenu);
    };

    const updateRotation = (targetRotation, duration, scale) => {
        if (isAnimating) return;
        isAnimating = true;
        while (currentRotation > targetRotation) currentRotation -= 360;
        currentRotation = targetRotation;
        title.style.transition = `transform ${duration}s ease`;
        title.style.transform = isMenuVisible
            ? `translateX(-50%) rotate(${currentRotation}deg) scale(${scale})`
            : `translate(-50%, 0) rotate(${currentRotation}deg) scale(${scale})`;
        title.offsetHeight;
    };

    const handleTitleClick = () => {
        if (!menu) {
            window.location.href = 'https://www.remorphdesign.com/?menu=visible';
            return;
        }

        if (isMenuVisible) {
            handleScroll(false);
            return;
        }

        if (isAnimating) return;
        if (!isSmiley) {
            const width = title.offsetWidth + 'px';
            title.style.width = width;
            title.textContent = ':-)';
            isSmiley = true;
            updateRotation(90, 0.2, 1.2);
            timeoutId = setTimeout(() => {
                if (!isMenuVisible) {
                    title.textContent = 'REMORPH DESIGN';
                    title.style.width = '';
                    isSmiley = false;
                    updateRotation(0, 0.2, 1);
                    timeoutId = null;
                }
            }, 1000);
        } else {
            clearTimeout(timeoutId);
            timeoutId = null;
            title.textContent = 'REMORPH DESIGN';
            title.style.width = '';
            isSmiley = false;
            updateRotation(360, 0.4, 1);
        }
    };

    title.addEventListener('transitionend', (e) => {
        if (e.propertyName === 'transform' && currentRotation === 360) {
            currentRotation = 0;
            title.style.transition = 'none';
            title.style.transform = isMenuVisible
                ? `translateX(-50%) rotate(${currentRotation}deg) scale(1)`
                : `translate(-50%, 0) rotate(${currentRotation}deg) scale(1)`;
            setTimeout(() => {
                title.style.transition = 'top var(--transition-duration) var(--transition-easing), transform var(--transition-duration) var(--transition-easing)';
            }, 0);
        }
        isAnimating = false;
    });

    const startIdleTimer = () => {
        if (!fornoobiesMode || !fornoobies) return;
        idleTimeout = setTimeout(() => {
            if (!isMenuVisible && !hasMenuBeenShown) {
                fornoobies.classList.remove('hidden');
                fornoobies.classList.remove('show');
                fornoobies.classList.add('show');
                setTimeout(() => {
                    fornoobies.classList.add('hidden');
                }, 1400);
                setTimeout(startIdleTimer, 6000 - 1400);
            }
        }, 3000);
    };

    const resetIdleTimer = () => {
        if (!fornoobiesMode || !fornoobies) return;
        clearTimeout(idleTimeout);
        startIdleTimer();
    };

    // Add tapped effect to file buttons
    document.querySelectorAll('.file-button').forEach(button => {
        const handlePressStart = (e) => {
            button.classList.add('tapped');
        };
        const handlePressEnd = () => {
            button.classList.remove('tapped');
        };
        button.addEventListener('mousedown', handlePressStart);
        button.addEventListener('mouseup', handlePressEnd);
        button.addEventListener('mouseleave', handlePressEnd);
        button.addEventListener('touchstart', handlePressStart, { passive: true });
        button.addEventListener('touchend', handlePressEnd, { passive: true });
        button.addEventListener('touchcancel', handlePressEnd);
    });

    if (menu) {
        // Auto-trigger menu on index page load, unless menu=visible is already set
        if (document.body.getAttribute('data-page') === 'index' && !isInitialMenuVisible) {
            setTimeout(() => {
                toggleMenu(true);
            }, MENU_AUTO_TRIGGER_DELAY); // Editable delay for menu auto-trigger
        }

        // Add click listener to the entire document to show the menu when the title is by itself
        document.addEventListener('click', (e) => {
            // Check if the click target is the title, "he", or "ho" (or their descendants)
            const isTitleClick = title.contains(e.target);
            const isHeClick = he && he.contains(e.target);
            const isHoClick = ho && ho.contains(e.target);

            // If the click is outside the title and "he/ho", and the menu is not visible, show the menu
            if (!isTitleClick && !isHeClick && !isHoClick && !isMenuVisible) {
                handleScroll(true);
            }
        });

        document.addEventListener('wheel', (e) => {
            e.preventDefault();
            if (e.deltaY < 0 && isMenuVisible) handleScroll(false);
            else if (e.deltaY > 0 && !isMenuVisible) handleScroll(true);
        }, { passive: false });

        document.addEventListener('touchstart', (e) => {
            touchStartY = e.touches[0].clientY;
            resetIdleTimer();
        }, { passive: true });

        document.addEventListener('touchmove', (e) => {
            e.preventDefault();
            const touchEndY = e.touches[0].clientY;
            const deltaY = touchStartY - touchEndY;
            if (Math.abs(deltaY) > 30) {
                if (deltaY < 0 && isMenuVisible) handleScroll(false);
                else if (deltaY > 0 && !isMenuVisible) handleScroll(true);
                touchStartY = touchEndY;
            }
        }, { passive: false });

        title.addEventListener('click', () => {
            handleTitleClick();
            resetIdleTimer();
        });

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

        if (fornoobies && he && ho) {
            const handleFornoobiesClick = () => {
                if (!isMenuVisible) handleScroll(true);
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

        window.addEventListener('popstate', (e) => {
            const menuVisible = e.state?.menuVisible || false;
            if (isMenuVisible !== menuVisible) {
                isMenuVisible = menuVisible;
                hasMenuBeenShown = isMenuVisible;
                updateLayout();
            }
        });

        window.addEventListener('resize', debounce(() => {
            updateLayout();
            resetIdleTimer();
        }, 100));

        startIdleTimer();
        updateLayout(isInitialMenuVisible);
    } else {
        // Ensure title click redirects to menu on non-menu pages
        title.addEventListener('click', () => {
            window.location.href = 'https://www.remorphdesign.com/?menu=visible';
            resetIdleTimer();
        });
    }
});