/**
 * Joseph Catalano Portfolio - Enhanced Script (REVISED DEBUG)
 * Includes GSAP animations, Intersection Observer, Modals, Filtering, etc.
 */

document.addEventListener('DOMContentLoaded', () => {

    console.log("DOM Content Loaded. Initializing script..."); // DEBUG LOG

    // --- === Global Setup === ---
    try { // Add error handling for critical setup
        // Ensure ScrollToPlugin is also registered
        gsap.registerPlugin(ScrollTrigger, TextPlugin, ScrollToPlugin);
        console.log("GSAP Plugins Registered."); // DEBUG LOG
    } catch (e) {
        console.error("Failed to register GSAP plugins:", e);
        alert("Error initializing animations. Please check the console (F12)."); // User feedback
        return; // Stop script execution if plugins fail
    }

    const body = document.body;
    const header = document.getElementById('header');
    const navbarHeight = header ? header.offsetHeight : 70; // Fallback height

    // --- === 1. Custom Cursor (Optional) === ---
    const cursorDot = document.querySelector('[data-cursor-dot]');
    const cursorOutline = document.querySelector('[data-cursor-outline]');
    const useCustomCursor = true; // Set to false to disable

    if (useCustomCursor && cursorDot && cursorOutline) {
        console.log("Initializing Custom Cursor."); // DEBUG LOG
        body.classList.add('custom-cursor-active'); // Hide default cursor

        window.addEventListener('mousemove', (e) => {
            const posX = e.clientX;
            const posY = e.clientY;

            // Use GSAP for smoother cursor movement
            gsap.to(cursorDot, { duration: 0.15, x: posX, y: posY });
            gsap.to(cursorOutline, { duration: 0.4, x: posX, y: posY }); // Slightly slower outline for trail effect
        });

        // Add hover effect for specific interactive elements
        document.querySelectorAll('a, button, .card-hover, .project-item, input, textarea, select').forEach(el => {
            el.addEventListener('mouseenter', () => cursorOutline.classList.add('hover-effect'));
            el.addEventListener('mouseleave', () => cursorOutline.classList.remove('hover-effect'));
        });

    } else {
         console.log("Custom Cursor Disabled or Elements Not Found."); // DEBUG LOG
    }

    // --- === 2. Smooth Scrolling & Active Nav Link === ---
    console.log("Setting up Smooth Scroll & Nav Links."); // DEBUG LOG
    const navLinks = document.querySelectorAll('.nav-link');

    // Smooth scroll for internal links using GSAP ScrollToPlugin
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const targetId = link.getAttribute('href');
            // Ensure it's an internal link
            if (targetId && targetId.startsWith('#')) {
                e.preventDefault();
                const targetElement = document.querySelector(targetId);
                if (targetElement) {
                    console.log(`Scrolling to: ${targetId}`); // Debug Log
                    gsap.to(window, {
                        duration: 1, // Duration of the scroll
                        scrollTo: {
                            y: targetElement, // Target element
                            offsetY: navbarHeight // Offset for fixed header
                        },
                        ease: "power2.inOut" // Smoother easing function
                    });
                    // Close mobile menu if open after clicking a link
                    closeMobileMenu();
                } else {
                    console.warn(`Target element not found for link: ${targetId}`); // Debug Log
                }
            }
        });
    });

    // Active link highlighting using ScrollTrigger
    document.querySelectorAll('main section[id]').forEach(section => {
        ScrollTrigger.create({
            trigger: section,
            start: `top ${navbarHeight + 100}px`, // Trigger when section top is 100px below the header bottom
            end: `bottom ${navbarHeight + 100}px`, // Trigger when section bottom is 100px below the header bottom
            // markers: true, // Uncomment for debugging scroll trigger positions
            onEnter: () => setActiveLink(section.id),
            onEnterBack: () => setActiveLink(section.id),
            // Optional: Add handlers for leaving view if needed
            // onLeave: () => { /* Maybe remove active class? */ },
            // onLeaveBack: () => { /* Handle scrolling back up past the section */ }
        });
    });

    function setActiveLink(sectionId) {
        console.log(`Setting active link for section: ${sectionId}`); // Debug Log
        navLinks.forEach(link => {
            link.classList.remove('active'); // Remove active from all first
            if (link.getAttribute('href') === `#${sectionId}`) {
                link.classList.add('active'); // Add to the matching link
            }
        });
         // Ensure Hero link is active when scrolled near the top
         // Check if pageYOffset is less than about 60% of the viewport height AND the current section isn't hero itself
         // OR check if exactly at the top (pageYOffset === 0)
        if ((window.pageYOffset < window.innerHeight * 0.6 && sectionId !== 'hero') || window.pageYOffset === 0) {
            if(window.pageYOffset === 0) console.log("At top, activating hero link."); // Debug Log
            navLinks.forEach(link => link.classList.remove('active')); // Ensure others aren't active
            const homeLink = document.querySelector('.nav-link[href="#hero"]');
            if (homeLink && !homeLink.classList.contains('active')) { // Only add if not already active
                homeLink.classList.add('active');
            }
        }
    }

     // Set initial active link on page load (wait slight delay for layout/fonts)
    setTimeout(() => {
        console.log("Setting initial active link."); // Debug Log
        let topSectionId = 'hero'; // Default
        let minTop = window.innerHeight;
        document.querySelectorAll('main section[id]').forEach(sec => {
            const rect = sec.getBoundingClientRect();
            // Find the topmost section currently in or very near the viewport top edge
            if (rect.top >= -navbarHeight - 50 && rect.top < minTop) { // Allow slightly above viewport top
                minTop = rect.top;
                topSectionId = sec.id;
            }
        });
         setActiveLink(topSectionId);
    }, 250); // Slightly longer delay for initial check

    // --- === 3. Header Scroll Effect === ---
    console.log("Setting up Header Scroll Effect."); // DEBUG LOG
    ScrollTrigger.create({
        start: 'top -80', // When scrolling down 80px
        end: 99999,
        toggleClass: { className: 'scrolled', targets: '#header' }
    });

    // --- === 4. Mobile Menu Toggle === ---
    console.log("Setting up Mobile Menu."); // DEBUG LOG
    const menuToggle = document.getElementById('menu-toggle');
    const navUl = document.querySelector('#navbar ul');

    if (menuToggle && navUl) {
        // Add icons via JS for cleaner HTML
        menuToggle.innerHTML = '<i class="fas fa-bars"></i><i class="fas fa-times" style="display: none;"></i>';

        menuToggle.addEventListener('click', () => {
            navUl.classList.toggle('active');
            menuToggle.classList.toggle('active');
            const isExpanded = navUl.classList.contains('active');
            menuToggle.setAttribute('aria-expanded', isExpanded);
            body.style.overflow = isExpanded ? 'hidden' : ''; // Prevent body scroll when menu is open

             // Toggle icon display more reliably
            const iconBars = menuToggle.querySelector('.fa-bars');
            const iconTimes = menuToggle.querySelector('.fa-times');
             if (iconBars && iconTimes) {
                iconBars.style.display = isExpanded ? 'none' : 'inline-block';
                iconTimes.style.display = isExpanded ? 'inline-block' : 'none';
            }
        });
    }
     function closeMobileMenu() {
        if (navUl && navUl.classList.contains('active')) {
            navUl.classList.remove('active');
            menuToggle.classList.remove('active');
            menuToggle.setAttribute('aria-expanded', 'false');
            body.style.overflow = '';
             // Ensure icons reset correctly
            const iconBars = menuToggle.querySelector('.fa-bars');
            const iconTimes = menuToggle.querySelector('.fa-times');
             if (iconBars && iconTimes) {
                iconBars.style.display = 'inline-block';
                iconTimes.style.display = 'none';
            }
        }
     }

    // --- === 5. GSAP Hero Section Animation (REVISED SIMPLE) === ---
    console.log("Setting up Hero Animation."); // DEBUG LOG
    const heroTl = gsap.timeline({
        defaults: { ease: "power3.out", duration: 0.8 },
        onStart: () => console.log("Hero Timeline Started"),
        onComplete: () => console.log("Hero Timeline Completed"),
        onInterrupt: () => console.warn("Hero Timeline Interrupted")
    });

    // Check if elements exist before animating
    if (document.querySelector('.hero-title') && document.querySelector('#typing-effect') && document.querySelector('.hero-description')) {
        heroTl
            .from('.hero-title', { // Simple animation for the whole title
                 opacity: 0,
                 y: 50, // Slide up slightly
                 duration: 1.0
            }, "+=0.3") // Start slightly after page load
            .to('#typing-effect', { // GSAP TextPlugin for typing
                duration: 2.5,
                text: {
                    value: "Software Engineering Student | Creative Technologist", // Your subtitle text
                    delimiter: " ", // Animate word by word
                },
                ease: "none"
            }, "-=0.5") // Overlap slightly with title animation
            .from('.hero-description', { opacity: 0, y: 20, duration: 0.6 }, "-=1.5") // Animate description
            .from('.hero-links .btn', { opacity: 0, y: 20, stagger: 0.2, duration: 0.5 }, "-=1.2") // Animate buttons
            .from('.scroll-down-indicator', { opacity: 0, y: -20, duration: 1, ease: "bounce.out" }, "-=0.5"); // Animate scroll indicator

         console.log("Hero Animation Timeline Created."); // DEBUG LOG
    } else {
         console.error("Hero animation elements not found!");
    }

    // --- === 6. GSAP Scroll-Triggered Animations === ---
    console.log("Setting up Scroll-Triggered Animations."); // DEBUG LOG

    // Reusable function for fade-up animations
    function createFadeUpAnimation(triggerElement, targets, staggerAmount = 0.2) {
         // Ensure targets exist before trying to animate
         const targetElements = gsap.utils.toArray(targets);
         if(targetElements.length > 0) {
            gsap.from(targetElements, {
                scrollTrigger: {
                    trigger: triggerElement,
                    start: "top 85%", // Start animation when top of trigger is 85% from viewport top
                    toggleActions: "play none none none", // Play once on enter
                    // markers: true, // For debugging trigger points
                },
                opacity: 0,
                y: 50, // Start 50px below final position
                duration: 0.8,
                stagger: staggerAmount,
                ease: "power2.out",
                // Important: Prevent GSAP from setting opacity/transform if element might be display:none
                // clearProps: "opacity,transform" // Can cause issues if needed later, use with caution or manage display:none state
            });
        } else {
            console.warn("No targets found for fade-up animation with trigger:", triggerElement);
        }
    }

    try {
        // Apply animations to section titles first
        gsap.utils.toArray('.section-title').forEach(title => createFadeUpAnimation(title, title, 0));

        // Apply animations to specific content blocks
        createFadeUpAnimation('#about .grid-about', '#about .about-text > *, #about .about-image', 0.15); // Stagger text elements and image
        createFadeUpAnimation('#projects .filter-buttons', '#projects .filter-buttons .btn', 0.1); // Stagger filter buttons

        // Stagger animations for grid/list items (target the items directly)
        gsap.utils.toArray('.project-item').forEach(item => {
             createFadeUpAnimation(item, item, 0); // Each project fades up as it enters view
        });
        gsap.utils.toArray('.education-item').forEach((item) => {
            const delay = parseFloat(item.dataset.animDelay || 0);
             gsap.from(item, { // Individual animation for potential delay usage
                scrollTrigger: { trigger: item, start: "top 85%", toggleActions: "play none none none" },
                opacity: 0, y: 50, duration: 0.8, delay: delay, ease: "power2.out",
            });
        });
        gsap.from('.skill-category', { // Stagger skill categories
            scrollTrigger: { trigger: '.skills-container', start: "top 80%", toggleActions: "play none none none" },
            opacity: 0, y: 30, duration: 0.6, stagger: 0.1, ease: "power1.out",
        });
        createFadeUpAnimation('#contact .contact-container', '#contact .contact-subtitle, #contact .contact-methods .contact-card, #contact .contact-location', 0.15); // Stagger contact elements

         // Animate timeline items with slide-in based on odd/even
         gsap.utils.toArray('.timeline-item').forEach((item, index) => {
             const direction = index % 2 === 0 ? 'right' : 'left'; // Determine slide direction based on CSS layout
             gsap.from(item.querySelector('.timeline-content'), { // Animate the content box within the item
                 scrollTrigger: { trigger: item, start: "top 90%", toggleActions: "play none none none" },
                 opacity: 0,
                 x: direction === 'left' ? -60 : 60, // Slide distance for content
                 duration: 0.8,
                 ease: "power2.out",
             });
              // Also fade in the item wrapper slightly earlier for the dot/line
             gsap.from(item, {
                 scrollTrigger: { trigger: item, start: "top 95%", toggleActions: "play none none none" },
                 opacity: 0, duration: 0.5,
             });
         });

         console.log("Scroll-Triggered Animations Applied.");
    } catch (e) {
        console.error("Error applying ScrollTrigger animations:", e);
    }

    // --- === 7. Project Filtering === ---
    console.log("Setting up Project Filtering."); // DEBUG LOG
    const filterButtons = document.querySelectorAll('.btn-filter');
    const projectItems = document.querySelectorAll('.project-item');
    const projectsGrid = document.querySelector('.projects-grid'); // Needed if you add "no results" message inside

    // Ensure items are initially displayed correctly based on CSS (should be 'flex')
    projectItems.forEach(item => {
        item.style.opacity = 1; // Ensure opacity is 1 (GSAP might have set it 0)
        item.style.transform = 'none'; // Ensure no leftover transforms
        // We rely on JS to set display:none/flex during filtering
    });

     filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            const filterValue = button.getAttribute('data-filter');
            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');

            console.log(`Filtering projects by: ${filterValue}`); // Debug Log

            // Simple show/hide using display property
            let hasVisibleItems = false;
            projectItems.forEach(item => {
                 const techTags = item.getAttribute('data-tech') ? item.getAttribute('data-tech').split(' ') : [];
                 const shouldShow = filterValue === 'all' || techTags.includes(filterValue);

                 if (shouldShow) {
                     item.style.display = 'flex'; // Make sure this matches your CSS grid/flex setup for items
                     hasVisibleItems = true;
                 } else {
                     item.style.display = 'none';
                 }
            });

             // Optional: Handle 'no results' message (ensure element exists in HTML)
             // const noResultsMessage = document.getElementById('no-projects-message');
             // if (noResultsMessage) {
             //    noResultsMessage.style.display = hasVisibleItems ? 'none' : 'block';
             // }

            // Refresh ScrollTrigger because changing 'display' affects layout significantly
             // Add a small delay to allow the browser to reflow layout changes
            setTimeout(() => {
                ScrollTrigger.refresh();
                console.log("ScrollTrigger refreshed after filtering."); // Debug Log
            }, 50); // Short delay

        });
    });

    // --- === 8. Project Modals === ---
    console.log("Setting up Project Modals."); // DEBUG LOG
    const modalTriggers = document.querySelectorAll('[data-modal-target]');
    const modals = document.querySelectorAll('.modal');
    const modalCloses = document.querySelectorAll('.modal-close');
    let lastFocusedElement; // For accessibility: store element focused before modal opens

    modalTriggers.forEach(trigger => {
        trigger.addEventListener('click', () => {
            const modalId = trigger.getAttribute('data-modal-target');
            const modal = document.getElementById(modalId);
            if (modal) openModal(modal);
        });
         trigger.addEventListener('keydown', (e) => { // Accessibility: Open with Enter/Space
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault(); // Prevent page scroll on Space
                const modalId = trigger.getAttribute('data-modal-target');
                const modal = document.getElementById(modalId);
                if (modal) openModal(modal);
            }
        });
    });

    modals.forEach(modal => {
        // Close modal when clicking the background overlay
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal(modal);
            }
        });
    });

    modalCloses.forEach(button => {
        button.addEventListener('click', () => {
            const modal = button.closest('.modal'); // Find the parent modal
            if (modal) closeModal(modal);
        });
    });

    // Close modal with Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            const activeModal = document.querySelector('.modal.active');
            if (activeModal) {
                closeModal(activeModal);
            }
        }
    });

    function openModal(modal) {
        console.log(`Opening modal: #${modal.id}`); // Debug Log
        lastFocusedElement = document.activeElement; // Store focus
        modal.classList.add('active');
        body.style.overflow = 'hidden'; // Prevent background scroll

        // Focus management for accessibility: focus the close button or first focusable element
        // Ensure modal content is visible before focusing
        setTimeout(() => {
            const focusableElements = modal.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
            const firstFocusable = modal.querySelector('.modal-close') || (focusableElements.length > 0 ? focusableElements[0] : null);
            if (firstFocusable) {
                 firstFocusable.focus();
                 console.log("Focused element in modal:", firstFocusable); // Debug Log
            }
        }, 100); // Delay to allow modal transition
    }

    function closeModal(modal) {
        console.log(`Closing modal: #${modal.id}`); // Debug Log
        modal.classList.remove('active');
        body.style.overflow = ''; // Restore background scroll
        // Return focus to the element that opened the modal
        if(lastFocusedElement) {
             console.log("Returning focus to:", lastFocusedElement); // Debug Log
             // Add check if element still exists/is visible? Maybe not needed usually.
            try {
                 lastFocusedElement.focus();
            } catch (e) {
                 console.warn("Could not return focus to previous element:", e);
            }
        }
    }

    // --- === 9. Footer Current Year === ---
    const yearSpan = document.getElementById('current-year');
    if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
    }

    // --- === 10. Optional: Particle Background === ---
    const useParticleBg = false; // KEEP FALSE unless you include particles.js library via <script> tag in HTML
    const particlesContainer = document.getElementById('particles-js');

    if (particlesContainer) { // Check if container exists
        if (useParticleBg && typeof particlesJS !== 'undefined') {
            console.log("Initializing particles.js background."); // DEBUG LOG
            particlesJS('particles-js', {
                 "particles": {
                    "number": { "value": 50, "density": { "enable": true, "value_area": 800 } },
                    "color": { "value": "#00aaff" },
                    "shape": { "type": "circle" },
                    "opacity": { "value": 0.3, "random": true },
                    "size": { "value": 3, "random": true },
                    "line_linked": { "enable": true, "distance": 150, "color": "#ffffff", "opacity": 0.1, "width": 1 },
                    "move": { "enable": true, "speed": 1, "direction": "none", "random": true, "out_mode": "out" }
                },
                 "interactivity": {
                    "detect_on": "canvas",
                    "events": { "onhover": { "enable": true, "mode": "grab" }, "onclick": { "enable": false } },
                    "modes": { "grab": { "distance": 140, "line_linked": { "opacity": 0.3 } } }
                },
                 "retina_detect": true
            });
        } else {
             console.log("Particle background disabled or particles.js library not loaded."); // DEBUG LOG
             particlesContainer.style.display = 'none'; // Hide container if not used/loaded
        }
    }

    // --- === 11. Refresh ScrollTrigger on Load/Resize === ---
     console.log("Setting up Load/Resize listeners for ScrollTrigger.refresh()."); // DEBUG LOG
     window.addEventListener('load', () => {
        console.log("Window Loaded. Refreshing ScrollTrigger."); // DEBUG LOG
        // Delay refresh slightly to ensure all assets/fonts might be ready
        setTimeout(() => {
            ScrollTrigger.refresh();
            console.log("ScrollTrigger refreshed after load."); // DEBUG LOG

             // Re-check initial active link after refresh
             let topSectionId = 'hero'; let minTop = window.innerHeight;
             document.querySelectorAll('main section[id]').forEach(sec => {
                 const rect = sec.getBoundingClientRect();
                  if (rect.top >= -navbarHeight - 50 && rect.top < minTop) { minTop = rect.top; topSectionId = sec.id; }
             });
             setActiveLink(topSectionId);
             console.log("Initial active link set after load refresh."); // DEBUG LOG
        }, 300);
     });

    // Debounced resize refresh
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            console.log("Window Resized. Refreshing ScrollTrigger."); // DEBUG LOG
            ScrollTrigger.refresh();
        }, 250);
    });

    console.log("Enhanced Portfolio Script Initialized Successfully."); // DEBUG LOG

}); // End DOMContentLoaded
