/**
 * =============================================
 * Main JavaScript - Tu Empresa Website
 * =============================================
 * 
 * Features:
 * - Mobile navigation menu
 * - Scroll effects (header, back to top)
 * - Smooth scrolling for anchor links
 * - Active navigation link tracking
 * - Portfolio filter
 * - Testimonials slider
 * - FAQ accordion
 * - Contact form validation
 * - Character counter
 * - Particle animation
 * - Counter animation
 * - CSRF token generation
 * - Input sanitization
 */

'use strict';

// =============================================
// DOM Elements
// =============================================
const DOM = {
    // Navigation
    header: document.getElementById('header'),
    navToggle: document.getElementById('nav-toggle'),
    navClose: document.getElementById('nav-close'),
    navMenu: document.getElementById('nav-menu'),
    navLinks: document.querySelectorAll('.nav__link'),
    
    // Back to top
    backToTop: document.getElementById('back-to-top'),
    
    // Particles
    particlesContainer: document.getElementById('particles'),
    
    // Portfolio
    filterBtns: document.querySelectorAll('.filter-btn'),
    portfolioCards: document.querySelectorAll('.portfolio-card'),
    
    // Testimonials
    testimonialsTrack: document.getElementById('testimonials-track'),
    testimonialPrev: document.getElementById('testimonial-prev'),
    testimonialNext: document.getElementById('testimonial-next'),
    testimonialDots: document.querySelectorAll('.dot[data-index]'),
    
    // FAQ
    faqItems: document.querySelectorAll('.faq-item'),
    
    // Form
    contactForm: document.getElementById('contact-form'),
    submitBtn: document.getElementById('submit-btn'),
    formSuccess: document.getElementById('form-success'),
    formMessage: document.getElementById('form-message'),
    charCount: document.getElementById('char-count'),
    messageTextarea: document.getElementById('message'),
    
    // Current year
    currentYear: document.getElementById('current-year'),

    // Theme
    themeToggle: document.getElementById('theme-toggle'),

    // WhatsApp
    whatsappBtn: document.querySelector('.whatsapp-btn'),

    // Company info
    companyEmail: document.getElementById('company-email'),
    companyMap: document.getElementById('company-map'),
    companyMapLink: document.getElementById('company-map-link')
};

// =============================================
// Utility Functions
// =============================================

/**
 * Debounce function to limit how often a function is called
 * @param {Function} func - Function to debounce
 * @param {number} wait - Milliseconds to wait
 * @returns {Function} Debounced function
 */
function debounce(func, wait = 20) {
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

/**
 * Throttle function to limit function execution rate
 * @param {Function} func - Function to throttle
 * @param {number} limit - Milliseconds between executions
 * @returns {Function} Throttled function
 */
function throttle(func, limit = 100) {
    let inThrottle;
    return function executedFunction(...args) {
        if (!inThrottle) {
            func(...args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

/**
 * Sanitize input to prevent XSS attacks
 * @param {string} input - User input to sanitize
 * @returns {string} Sanitized string
 */
function sanitizeInput(input) {
    const div = document.createElement('div');
    div.textContent = input;
    return div.innerHTML;
}

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} Is valid email
 */
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Validate phone format
 * @param {string} phone - Phone to validate
 * @returns {boolean} Is valid phone
 */
function isValidPhone(phone) {
    const phoneRegex = /^[\+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,4}[-\s\.]?[0-9]{1,9}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
}

// =============================================
// Theme Toggle
// =============================================

function initThemeToggle() {
    if (!DOM.themeToggle) return;

    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const shouldUseDark = savedTheme ? savedTheme === 'dark' : prefersDark;

    setTheme(shouldUseDark ? 'dark' : 'light');

    DOM.themeToggle.addEventListener('click', () => {
        const nextTheme = document.body.classList.contains('dark-mode') ? 'light' : 'dark';
        setTheme(nextTheme);
        localStorage.setItem('theme', nextTheme);
    });
}

function setTheme(theme) {
    const isDark = theme === 'dark';
    document.body.classList.toggle('dark-mode', isDark);
    document.documentElement.setAttribute('data-theme', theme);

    if (DOM.themeToggle) {
        DOM.themeToggle.setAttribute('aria-pressed', String(isDark));
        DOM.themeToggle.setAttribute('aria-label', isDark ? 'Activar modo claro' : 'Activar modo oscuro');
        DOM.themeToggle.setAttribute('title', isDark ? 'Activar modo claro' : 'Activar modo oscuro');
    }
}
// =============================================
// Mobile Navigation
// =============================================

function initMobileNav() {
    // Open menu
    if (DOM.navToggle) {
        DOM.navToggle.addEventListener('click', () => {
            DOM.navMenu.classList.add('active');
            DOM.navToggle.setAttribute('aria-expanded', 'true');
            document.body.style.overflow = 'hidden';
        });
    }
    
    // Close menu
    if (DOM.navClose) {
        DOM.navClose.addEventListener('click', closeNav);
    }
    
    // Close on link click
    DOM.navLinks.forEach(link => {
        link.addEventListener('click', closeNav);
    });
    
    // Close on escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && DOM.navMenu.classList.contains('active')) {
            closeNav();
        }
    });
    
    // Close on outside click
    document.addEventListener('click', (e) => {
        if (DOM.navMenu.classList.contains('active') && 
            !DOM.navMenu.contains(e.target) && 
            !DOM.navToggle.contains(e.target)) {
            closeNav();
        }
    });
}

function closeNav() {
    DOM.navMenu.classList.remove('active');
    DOM.navToggle.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
}

// =============================================
// Header Scroll Effect
// =============================================

function initHeaderScroll() {
    const handleScroll = throttle(() => {
        if (window.scrollY > 50) {
            DOM.header.classList.add('scrolled');
        } else {
            DOM.header.classList.remove('scrolled');
        }
    }, 100);
    
    window.addEventListener('scroll', handleScroll, { passive: true });
}

// =============================================
// Back to Top Button
// =============================================

function initBackToTop() {
    if (!DOM.backToTop) return;
    
    const handleScroll = throttle(() => {
        if (window.scrollY > 500) {
            DOM.backToTop.classList.add('visible');
        } else {
            DOM.backToTop.classList.remove('visible');
        }
    }, 100);
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    DOM.backToTop.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

// =============================================
// Smooth Scrolling for Anchor Links
// =============================================

function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                e.preventDefault();
                const headerOffset = 80;
                const elementPosition = targetElement.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
                
                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// =============================================
// Active Navigation Link on Scroll
// =============================================

function initActiveNavLink() {
    const sections = document.querySelectorAll('section[id]');
    
    const handleScroll = throttle(() => {
        const scrollY = window.pageYOffset;
        
        sections.forEach(section => {
            const sectionHeight = section.offsetHeight;
            const sectionTop = section.offsetTop - 100;
            const sectionId = section.getAttribute('id');
            
            if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
                DOM.navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${sectionId}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }, 100);
    
    window.addEventListener('scroll', handleScroll, { passive: true });
}

// =============================================
// Particle Animation
// =============================================

function initParticles() {
    if (!DOM.particlesContainer) return;
    
    // Check for reduced motion preference
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        return;
    }
    
    const particleCount = window.innerWidth < 768 ? 15 : 30;
    
    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.classList.add('particle');
        
        // Random properties
        const size = Math.random() * 6 + 2;
        const left = Math.random() * 100;
        const delay = Math.random() * 15;
        const duration = Math.random() * 10 + 15;
        
        particle.style.cssText = `
            width: ${size}px;
            height: ${size}px;
            left: ${left}%;
            animation-delay: ${delay}s;
            animation-duration: ${duration}s;
        `;
        
        DOM.particlesContainer.appendChild(particle);
    }
}

// =============================================
// Counter Animation
// =============================================

function initCounters() {
    const counters = document.querySelectorAll('.stat__number');
    
    const animateCounter = (counter) => {
        const target = parseInt(counter.getAttribute('data-count'));
        const duration = 2000;
        const start = 0;
        const increment = target / (duration / 16);
        
        let current = start;
        
        const updateCounter = () => {
            current += increment;
            if (current < target) {
                counter.textContent = Math.ceil(current);
                requestAnimationFrame(updateCounter);
            } else {
                counter.textContent = target;
            }
        };
        
        updateCounter();
    };
    
    // Intersection Observer for counter animation
    const observerOptions = {
        threshold: 0.5,
        rootMargin: '0px'
    };
    
    const counterObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateCounter(entry.target);
                counterObserver.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    counters.forEach(counter => counterObserver.observe(counter));
}

// =============================================
// Portfolio Filter
// =============================================

function initPortfolioFilter() {
    DOM.filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const filter = btn.getAttribute('data-filter');
            
            // Update active button
            DOM.filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            // Filter cards
            DOM.portfolioCards.forEach(card => {
                const category = card.getAttribute('data-category');
                
                if (filter === 'all' || category === filter) {
                    card.style.display = 'block';
                    setTimeout(() => {
                        card.style.opacity = '1';
                        card.style.transform = 'scale(1)';
                    }, 50);
                } else {
                    card.style.opacity = '0';
                    card.style.transform = 'scale(0.8)';
                    setTimeout(() => {
                        card.style.display = 'none';
                    }, 300);
                }
            });
        });
    });
}

// =============================================
// Testimonials Slider
// =============================================

function initTestimonialsSlider() {
    if (!DOM.testimonialsTrack) return;
    
    let currentSlide = 0;
    const totalSlides = document.querySelectorAll('.testimonial-card').length;
    
    const goToSlide = (index) => {
        currentSlide = index;
        DOM.testimonialsTrack.style.transform = `translateX(-${currentSlide * 100}%)`;
        
        // Update dots
        DOM.testimonialDots.forEach((dot, i) => {
            dot.classList.toggle('active', i === currentSlide);
            dot.setAttribute('aria-selected', i === currentSlide);
        });
    };
    
    // Previous button
    if (DOM.testimonialPrev) {
        DOM.testimonialPrev.addEventListener('click', () => {
            const newIndex = currentSlide === 0 ? totalSlides - 1 : currentSlide - 1;
            goToSlide(newIndex);
        });
    }
    
    // Next button
    if (DOM.testimonialNext) {
        DOM.testimonialNext.addEventListener('click', () => {
            const newIndex = currentSlide === totalSlides - 1 ? 0 : currentSlide + 1;
            goToSlide(newIndex);
        });
    }
    
    // Dots
    DOM.testimonialDots.forEach(dot => {
        dot.addEventListener('click', () => {
            const index = parseInt(dot.getAttribute('data-index'));
            goToSlide(index);
        });
    });
    
    // Auto-slide (optional)
    let autoSlideInterval = setInterval(() => {
        const newIndex = currentSlide === totalSlides - 1 ? 0 : currentSlide + 1;
        goToSlide(newIndex);
    }, 5000);
    
    // Pause on hover
    const slider = document.querySelector('.testimonials__slider');
    if (slider) {
        slider.addEventListener('mouseenter', () => {
            clearInterval(autoSlideInterval);
        });
        
        slider.addEventListener('mouseleave', () => {
            autoSlideInterval = setInterval(() => {
                const newIndex = currentSlide === totalSlides - 1 ? 0 : currentSlide + 1;
                goToSlide(newIndex);
            }, 5000);
        });
    }
}

// =============================================
// FAQ Accordion
// =============================================

function initFAQ() {
    DOM.faqItems.forEach(item => {
        const question = item.querySelector('.faq-item__question');
        
        question.addEventListener('click', () => {
            const isActive = item.classList.contains('active');
            
            // Close all items
            DOM.faqItems.forEach(i => {
                i.classList.remove('active');
                i.querySelector('.faq-item__question').setAttribute('aria-expanded', 'false');
            });
            
            // Toggle clicked item
            if (!isActive) {
                item.classList.add('active');
                question.setAttribute('aria-expanded', 'true');
            }
        });
        
        // Keyboard accessibility
        question.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                question.click();
            }
        });
    });
}

// =============================================
// Secure Static Integrations
// =============================================

const WEB3FORMS_ENDPOINT = 'https://api.web3forms.com/submit';

const WEB3FORMS_ACCESS_KEY = '88f5cfd6-6688-4d8c-bc8f-4b9319b13ce2';

function getWeb3FormsAccessKey() {
    return WEB3FORMS_ACCESS_KEY.trim();
}

function initProtectedWhatsApp() {
    if (!DOM.whatsappBtn) return;

    DOM.whatsappBtn.href = 'https://wa.me/51980431576';
    DOM.whatsappBtn.target = '_blank';
    DOM.whatsappBtn.rel = 'noopener noreferrer';

    DOM.whatsappBtn.addEventListener('click', (event) => {
        event.preventDefault();
        window.open(DOM.whatsappBtn.href, '_blank', 'noopener,noreferrer');
    });
}

async function fetchJson(url) {
    const response = await fetch(url, {
        method: 'GET',
        headers: {
            Accept: 'application/json'
        },
        cache: 'no-store'
    });

    let result = null;
    try {
        result = await response.json();
    } catch (error) {
        throw new Error('Respuesta inválida del servidor');
    }

    if (!response.ok || result?.success !== true) {
        throw new Error(result?.message || 'No se pudo cargar la configuración');
    }

    return result;
}

async function initCompanyInfo() {
    if (!DOM.companyEmail && !DOM.companyMap && !DOM.companyMapLink) return;

    try {
        const result = await fetchJson('/api/company-info');
        const { email, mapsUrl, mapsEmbedUrl } = result.data || {};

        if (DOM.companyEmail && email) {
            DOM.companyEmail.textContent = email;
            DOM.companyEmail.href = `mailto:${email}`;
        }

        if (DOM.companyMap && mapsEmbedUrl) {
            DOM.companyMap.src = mapsEmbedUrl;
        }

        if (DOM.companyMapLink && mapsUrl) {
            DOM.companyMapLink.href = mapsUrl;
        }
    } catch (error) {
        // La informacion principal queda fija en el HTML si no hay backend activo.
    }
}

// =============================================
// Contact Form Validation
// =============================================

function initContactForm() {
    if (!DOM.contactForm) return;

    // Character counter for message
    if (DOM.messageTextarea && DOM.charCount) {
        DOM.messageTextarea.addEventListener('input', () => {
            const count = DOM.messageTextarea.value.length;
            DOM.charCount.textContent = count;
            DOM.charCount.parentElement.style.color = count > 2000 ? 'var(--color-error)' : 'var(--color-gray-400)';
        });
    }

    DOM.contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        clearFormMessage();
        DOM.submitBtn.classList.add('is-loading');
        DOM.submitBtn.disabled = true;

        try {
            const result = await submitContactForm(new FormData(DOM.contactForm));
            if (!result || result.success !== true) {
                throw new Error(result?.message || 'No se pudo enviar el mensaje');
            }

            DOM.contactForm.style.display = 'none';
            DOM.formSuccess.classList.add('show');

            setTimeout(() => {
                DOM.contactForm.reset();
                DOM.contactForm.style.display = 'flex';
                DOM.formSuccess.classList.remove('show');
                if (DOM.charCount) DOM.charCount.textContent = '0';
                clearFormMessage();
            }, 5000);
        } catch (error) {
            showFormMessage(error.message || 'Hubo un error al enviar el formulario. Por favor, intenta de nuevo.', 'error');
        } finally {
            DOM.submitBtn.classList.remove('is-loading');
            DOM.submitBtn.disabled = false;
        }
    });

    const inputs = DOM.contactForm.querySelectorAll('.form-input');
    inputs.forEach(input => {
        input.addEventListener('blur', () => validateField(input));
        input.addEventListener('input', () => {
            if (input.classList.contains('error')) validateField(input);
        });
    });
}

function validateForm() {
    let isValid = true;
    
    // Name validation
    const name = document.getElementById('name');
    if (!name.value.trim() || name.value.trim().length < 2) {
        showFieldError('name', 'El nombre debe tener al menos 2 caracteres');
        isValid = false;
    } else {
        clearFieldError('name');
    }
    
    // Email validation
    const email = document.getElementById('email');
    if (!email.value.trim() || !isValidEmail(email.value.trim())) {
        showFieldError('email', 'Ingresa un correo electrónico válido');
        isValid = false;
    } else {
        clearFieldError('email');
    }
    
    // Phone validation (optional but if provided, must be valid)
    const phone = document.getElementById('phone');
    if (phone.value.trim() && !isValidPhone(phone.value)) {
        showFieldError('phone', 'Ingresa un teléfono válido');
        isValid = false;
    } else {
        clearFieldError('phone');
    }
    
    // Message validation
    const message = document.getElementById('message');
    if (!message.value.trim() || message.value.trim().length < 10) {
        showFieldError('message', 'El mensaje debe tener al menos 10 caracteres');
        isValid = false;
    } else {
        clearFieldError('message');
    }
    
    // Privacy checkbox validation
    const privacy = document.getElementById('privacy');
    if (!privacy.checked) {
        showFieldError('privacy', 'Debes aceptar la política de privacidad');
        isValid = false;
    } else {
        clearFieldError('privacy');
    }
    
    return isValid;
}

function validateField(field) {
    const id = field.id;
    const value = field.value.trim();
    
    switch (id) {
        case 'name':
            if (!value || value.length < 2) {
                showFieldError(id, 'El nombre debe tener al menos 2 caracteres');
                return false;
            }
            break;
            
        case 'email':
            if (!value || !isValidEmail(value)) {
                showFieldError(id, 'Ingresa un correo electrónico válido');
                return false;
            }
            break;
            
        case 'phone':
            if (value && !isValidPhone(value)) {
                showFieldError(id, 'Ingresa un teléfono válido');
                return false;
            }
            break;
            
        case 'message':
            if (!value || value.length < 10) {
                showFieldError(id, 'El mensaje debe tener al menos 10 caracteres');
                return false;
            }
            break;
    }
    
    clearFieldError(id);
    return true;
}

function showFieldError(fieldId, message) {
    const errorElement = document.getElementById(`${fieldId}-error`);
    const inputElement = document.getElementById(fieldId);
    
    if (errorElement) {
        errorElement.textContent = message;
    }
    
    if (inputElement) {
        inputElement.classList.add('error');
    }
}

function clearFieldError(fieldId) {
    const errorElement = document.getElementById(`${fieldId}-error`);
    const inputElement = document.getElementById(fieldId);
    
    if (errorElement) {
        errorElement.textContent = '';
    }
    
    if (inputElement) {
        inputElement.classList.remove('error');
    }
}

async function submitContactForm(formData) {
    const accessKey = getWeb3FormsAccessKey();
    if (!accessKey) {
        throw new Error('Falta configurar la Access Key de Web3Forms.');
    }

    formData.set('access_key', accessKey);

    const response = await fetch(WEB3FORMS_ENDPOINT, {
        method: 'POST',
        headers: {
            Accept: 'application/json'
        },
        body: formData
    });

    let result = null;
    try {
        result = await response.json();
    } catch (error) {
        throw new Error('Respuesta inválida del servicio de contacto');
    }

    if (!response.ok || result.success !== true) {
        throw new Error(result?.message || 'No se pudo enviar el mensaje');
    }

    return result;
}

function showFormMessage(message, type = 'error') {
    if (!DOM.formMessage) return;
    DOM.formMessage.textContent = message;
    DOM.formMessage.className = `form-message form-message--${type} show`;
}

function clearFormMessage() {
    if (!DOM.formMessage) return;
    DOM.formMessage.textContent = '';
    DOM.formMessage.className = 'form-message';
}

// =============================================
// Scroll Reveal Animation
// =============================================

function initScrollReveal() {
    // Check for reduced motion preference
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        return;
    }
    
    const revealElements = document.querySelectorAll('.service-card, .portfolio-card, .faq-item, .contact-info-card');
    
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('reveal', 'active');
                revealObserver.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });
    
    revealElements.forEach(el => {
        el.classList.add('reveal');
        revealObserver.observe(el);
    });
}

// =============================================
// Current Year in Footer
// =============================================

function initCurrentYear() {
    if (DOM.currentYear) {
        DOM.currentYear.textContent = new Date().getFullYear();
    }
}

// =============================================
// Keyboard Navigation
// =============================================

function initKeyboardNav() {
    // Enable keyboard navigation for interactive elements
    document.addEventListener('keydown', (e) => {
        // Tab trap in mobile menu when open
        if (DOM.navMenu.classList.contains('active')) {
            const focusableElements = DOM.navMenu.querySelectorAll('a, button');
            const firstElement = focusableElements[0];
            const lastElement = focusableElements[focusableElements.length - 1];
            
            if (e.key === 'Tab') {
                if (e.shiftKey && document.activeElement === firstElement) {
                    e.preventDefault();
                    lastElement.focus();
                } else if (!e.shiftKey && document.activeElement === lastElement) {
                    e.preventDefault();
                    firstElement.focus();
                }
            }
        }
    });
}

// =============================================
// Lazy Loading for Images (if any)
// =============================================

function initLazyLoading() {
    if ('loading' in HTMLImageElement.prototype) {
        // Native lazy loading supported
        const images = document.querySelectorAll('img[loading="lazy"]');
        images.forEach(img => {
            img.src = img.dataset.src;
        });
    } else {
        // Fallback with Intersection Observer
        const images = document.querySelectorAll('img[data-src]');
        
        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    imageObserver.unobserve(img);
                }
            });
        });
        
        images.forEach(img => imageObserver.observe(img));
    }
}

// =============================================
// Initialize All Functions
// =============================================

document.addEventListener('DOMContentLoaded', () => {
    // Core functionality
    initThemeToggle();
    initProtectedWhatsApp();
    initCompanyInfo();
    initMobileNav();
    initHeaderScroll();
    initBackToTop();
    initSmoothScroll();
    initActiveNavLink();
    initCurrentYear();
    
    // Animations
    initParticles();
    initCounters();
    initScrollReveal();
    
    // Interactive features
    initPortfolioFilter();
    initTestimonialsSlider();
    initFAQ();
    
    // Form handling
    initContactForm();
    
    // Accessibility
    initKeyboardNav();
    
    // Performance
    initLazyLoading();
    
    console.log('Website initialized successfully');
});

// =============================================
// Service Worker Registration (Optional - for PWA)
// =============================================

if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        // Uncomment to enable service worker
        // navigator.serviceWorker.register('/sw.js')
        //     .then(registration => console.log('SW registered'))
        //     .catch(error => console.log('SW registration failed'));
    });
}
