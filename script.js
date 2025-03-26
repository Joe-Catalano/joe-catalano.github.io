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
            start: `top ${navbarHeight + 100}px`, // Adjusted offset
            end: `bottom ${navbarHeight + 100}px`, // Adjusted offset
            // markers: true, // Uncomment for debugging scroll trigger positions
            onEnter: () => setActiveLink(section.id),
            onEnterBack: () => setActiveLink(section.id),
            onLeave: () => { /* Optional: remove active class if needed when leaving */ },
            onLeaveBack: () => { /* Optional: handle leaving upwards */ }
        });
    });

    function setActiveLink(sectionId) {
        console.log(`Setting active link for section: ${sectionId}`); // Debug Log
        navLinks.forEach(link => {
            if (link.getAttribute('href') === `#${sectionId}`) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
         // Ensure Hero link is active when scrolled near the top
        if (window.pageYOffset < window.innerHeight * 0.6 && sectionId !== 'hero') {
            console.log("Near top, activating hero link."); // Debug Log
             navLinks.forEach(link => link.classList.remove('active'));
             const homeLink = document.querySelector('.nav-link[href="#hero"]');
             if(homeLink) homeLink.classList.add('active');
        } else if (window.pageYOffset === 0) { // Explicitly activate hero if exactly at top
             navLinks.forEach(link => link.classList.remove('active'));
             const homeLink = document.querySelector('.nav-link[href="#hero"]');
             if(homeLink) homeLink.classList.add('active');
        }
    }

     // Set initial active link on page load (wait slight delay for layout)
    setTimeout(() => {
        console.log("Setting initial active link."); // Debug Log
        let topSectionId = 'hero'; // Default
        let minTop = window.innerHeight;
        document.querySelectorAll('main section[id]').forEach(sec => {
            const rect = sec.getBoundingClientRect();
            // Find the topmost section currently in the viewport
            if (rect.top >= -navbarHeight && rect.top < minTop) { // Consider section within offset range
                minTop = rect.top;
                topSectionId = sec.id;
            }
        });
         setActiveLink(topSectionId);
    }, 200); // Increased delay slightly

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
        // Ensure both icons exist initially for toggling display
        menuToggle.innerHTML = '<i class="fas fa-bars"></i><i class="fas fa-times"></i>';
        const iconTimes = menuToggle.querySelector('.fa-times');
        if (iconTimes) iconTimes.style.display = 'none'; // Hide X initially via JS

        menuToggle.addEventListener('click', () => {
            navUl.classList.toggle('active');
            menuToggle.classList.toggle('active');
            const isExpanded = navUl.classList.contains('active');
            menuToggle.setAttribute('aria-expanded', isExpanded);
            body.style.overflow = isExpanded ? 'hidden' : ''; // Prevent body scroll when menu is open

             // Toggle icon display
            const iconBars = menuToggle.querySelector('.fa-bars');
            const iconTimes = menuToggle.querySelector('.fa-times');
             if (isExpanded) {
                if(iconBars) iconBars.style.display = 'none';
                if(iconTimes) iconTimes.style.display = 'inline-block';
            } else {
                 if(iconBars) iconBars.style.display = 'inline-block';
                 if(iconTimes) iconTimes.style.display = 'none';
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
             if(iconBars) iconBars.style.display = 'inline-block';
             if(iconTimes) iconTimes.style.display = 'none';
        }
     }


    // --- === 5. GSAP Hero Section Animation (REVISED) === ---
    console.log("Setting up Hero Animation."); // DEBUG LOG
    const heroTl = gsap.timeline({
        defaults: { ease: "power3.out", duration: 0.8 },
        onStart: () => console.log("Hero Timeline Started"),
        onComplete: () => console.log("Hero Timeline Completed"),
        onInterrupt: () => console.warn("Hero Timeline Interrupted")
    });

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

    // --- === 6. GSAP Scroll-Triggered Animations === ---
    console.log("Setting up Scroll-Triggered Animations."); // DEBUG LOG

    // Reusable animation functions...
     function createFadeUpAnimation(triggerElement, targets, staggerAmount = 0.2) {
        gsap.from(targets, {
            scrollTrigger: { trigger: triggerElement, start: "top 85%", toggleActions: "play none none none", },
            opacity: 0, y: 50, duration: 0.8, stagger: staggerAmount, ease: "power2.out",
        });
    }
    // No createFadeInAnimation used currently
    // function createSlideInAnimation(target, direction = 'left') { ... } // Defined but not used in revised timeline animation below

    try {
        // Apply animations to sections/elements
        createFadeUpAnimation('#about .grid-about', '#about .about-text > *, #about .about-image');
        createFadeUpAnimation('#experience .section-title', '#experience .section-title');
        createFadeUpAnimation('#projects .section-title', '#projects .section-title');
        createFadeUpAnimation('#projects .filter-buttons', '#projects .filter-buttons .btn', 0.1); // Faster stagger for buttons
        createFadeUpAnimation('#education .section-title', '#education .section-title');
        createFadeUpAnimation('#skills .section-title', '#skills .section-title');
        createFadeUpAnimation('#contact .contact-container', '#contact .section-title, #contact .contact-subtitle, #contact .contact-methods .contact-card, #contact .contact-location', 0.15);

        // Stagger animations for grid/list items
        gsap.utils.toArray('.project-item').forEach(item => {
             createFadeUpAnimation(item, item, 0); // Animate each project item individually as it enters
        });
        gsap.utils.toArray('.education-item').forEach((item) => {
            const delay = parseFloat(item.dataset.animDelay || 0); // Use data attribute for potential delay
             gsap.from(item, {
                scrollTrigger: { trigger: item, start: "top 85%", toggleActions: "play none none none", },
                opacity: 0, y: 50, duration: 0.8, delay: delay, ease: "power2.out",
            });
        });
        gsap.from('.skill-category', {
            scrollTrigger: { trigger: '.skills-container', start: "top 80%", toggleActions: "play none none none", },
            opacity: 0, y: 30, duration: 0.6, stagger: 0.1, ease: "power1.out", // Slightly faster stagger
        });

         // Animate timeline items with slide-in based on odd/even
         gsap.utils.toArray('.timeline-item').forEach((item, index) => {
             const direction = index % 2 === 0 ? 'right' : 'left'; // Determine slide direction
             gsap.from(item, {
                 scrollTrigger: { trigger: item, start: "top 90%", toggleActions: "play none none none", },
                 opacity: 0,
                 x: direction === 'left' ? -80 : 80, // Slide distance
                 duration: 0.8,
                 ease: "power2.out",
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
    const projectsGrid = document.querySelector('.projects-grid');

    // Ensure items start visible for filtering logic
    projectItems.forEach(item => {
        item.style.display = 'flex'; // Or 'block'/'grid' depending on initial CSS for project-item
        item.style.opacity = 1; // Ensure visible
        item.style.transform = 'none'; // Ensure not transformed
    });

     filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            const filterValue = button.getAttribute('data-filter');
            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');

            console.log(`Filtering projects by: ${filterValue}`); // Debug Log

            // Simple show/hide for filtering (more robust)
            let hasVisibleItems = false;
            projectItems.forEach(item => {
                 const techTags = item.getAttribute('data-tech') ? item.getAttribute('data-tech').split(' ') : [];
                 const shouldShow = filterValue === 'all' || techTags.includes(filterValue);

                 // Use display property for robust filtering
                 if (shouldShow) {
                     item.style.display = 'flex'; // Or 'block', 'grid', etc.
                     hasVisibleItems = true;
                 } else {
                     item.style.display = 'none';
                 }
            });

             // Optional: Add a message if no items match
             // const noResultsMessage = document.getElementById('no-projects-message'); // Add an element in HTML if needed
             // if (noResultsMessage) {
             //    noResultsMessage.style.display = hasVisibleItems ? 'none' : 'block';
             // }

            // Refresh ScrollTrigger because changing 'display' affects layout
            ScrollTrigger.refresh();
            console.log("ScrollTrigger refreshed after filtering."); // Debug Log
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
        const focusableElements = modal.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
        const firstFocusable = focusableElements.length > 0 ? (modal.querySelector('.modal-close') || focusableElements[0]) : null;
        if (firstFocusable) {
            // Timeout needed to allow transition to complete before focusing
             setTimeout(() => firstFocusable.focus(), 100);
        }
    }

    function closeModal(modal) {
        console.log(`Closing modal: #${modal.id}`); // Debug Log
        modal.classList.remove('active');
        body.style.overflow = ''; // Restore background scroll
        // Return focus to the element that opened the modal
        if(lastFocusedElement) {
             console.log("Returning focus to:", lastFocusedElement); // Debug Log
            lastFocusedElement.focus();
        }
    }

    // --- === 9. Footer Current Year === ---
    const yearSpan = document.getElementById('current-year');
    if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
    }

    // --- === 10. Optional: Particle Background === ---
    const useParticleBg = false; // KEEP FALSE unless you include particles.js library
    if (useParticleBg && typeof particlesJS !== 'undefined') {
        console.log("Initializing particles.js background."); // DEBUG LOG
        particlesJS('particles-js', { /* ... Particle config ... */ });
    } else if (useParticleBg) {
        console.warn("particles.js library not found or not enabled. Skipping particle background.");
        const particlesContainer = document.getElementById('particles-js');
        if (particlesContainer) particlesContainer.style.display = 'none';
    } else {
         const particlesContainer = document.getElementById('particles-js');
         if (particlesContainer) particlesContainer.style.display = 'none'; // Hide container if not used
    }

    // --- === 11. Refresh ScrollTrigger on Load/Resize === ---
     console.log("Setting up Load/Resize listeners for ScrollTrigger.refresh()."); // DEBUG LOG
     window.addEventListener('load', () => {
        console.log("Window Loaded. Refreshing ScrollTrigger."); // DEBUG LOG
        ScrollTrigger.refresh();
        // Re-check initial active link after everything (images, etc.) is loaded
         setTimeout(() => {
            let topSectionId = 'hero'; let minTop = window.innerHeight;
            document.querySelectorAll('main section[id]').forEach(sec => {
                const rect = sec.getBoundingClientRect();
                 if (rect.top >= -navbarHeight && rect.top < minTop) { minTop = rect.top; topSectionId = sec.id; }
            });
            setActiveLink(topSectionId);
            console.log("Initial active link set after load."); // DEBUG LOG
        }, 300); // Slightly longer delay after full load
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
