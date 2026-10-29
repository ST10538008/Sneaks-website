/* =============================================================
   SNEAKS — JAVASCRIPT (Part 3)
   Author: Nhlakanipho Bhengu (ST10538008)

   CONTENTS
   1.  Settings and data (products, store rules, locations)
   2.  Small helper functions
   3.  Navigation (mobile menu) and back-to-top button
   4.  Scroll animations
   5.  Products page: dynamic listings, search, filter and sort
   6.  Lightbox gallery
   7.  FAQ accordion
   8.  Form validation engine (shared by both forms)
   9.  Enquiry form: validation, AJAX submit, cost/availability reply
   10. Contact form: validation and compiled email
   11. Interactive map (Leaflet)
   12. Start-up
   ============================================================= */

'use strict';


/* =============================================================
   1. SETTINGS AND DATA
   Everything the site "knows" is kept here in one place, so the
   products page and the enquiry form read from the same data.
   ============================================================= */

/* Business rules used when the enquiry form works out a reply.
   Change a number here and every reply updates. */
const STORE_RULES = {
    depositRate: 0.2,      // 20% deposit to hold a pair
    holdHours: 48,         // how long a reserved pair is held
    acceptRate: 0.95,      // offers at or above 95% of the price are accepted
    minOfferRate: 0.8,     // offers below 80% of the price are declined
    sourcingFee: 150,      // rand fee to source a pair we do not have
    sourcingDays: '7 to 10'
};

/* The product catalogue. The products page builds its cards from
   this list. The same pairs are still written in products.html,
   so the page works for search engines and with JavaScript off. */
const PRODUCTS = [
    {
        id: 'aj1-white-black-red',
        name: 'Nike Air Jordan 1',
        brand: 'Nike',
        size: 8,
        condition: 'Deadstock',
        conditionNote: 'Deadstock',
        price: 3800,
        image: 'images/air-jordan-1-white-black-red',
        alt: 'Nike Air Jordan 1 sneaker in a white, black and red colourway'
    },
    {
        id: 'yeezy-350-v2-black',
        name: 'Adidas Yeezy Boost 350 V2',
        brand: 'Adidas',
        size: 9,
        condition: 'Pre-owned',
        conditionNote: 'Pre-owned, excellent',
        price: 2400,
        image: 'images/adidas-yeezy-350-v2-black',
        alt: 'Adidas Yeezy Boost 350 V2 sneaker in a black colourway'
    },
    {
        id: 'aj1-off-white-unc',
        name: 'Air Jordan 1 Retro High "Off-White – UNC"',
        brand: 'Nike',
        size: 7,
        condition: 'Deadstock',
        conditionNote: 'Deadstock',
        price: 10900,
        image: 'images/air-jordan-1-retro-high-off-white-unc',
        alt: 'Air Jordan 1 Retro High Off-White UNC sneaker in teal and orange'
    },
    {
        id: 'off-white-vulc-low',
        name: 'Off-White Vulcanized Low White',
        brand: 'Off-White',
        size: 10,
        condition: 'Pre-owned',
        conditionNote: 'Pre-owned, good',
        price: 4000,
        image: 'images/off-white-vulcanized-low-white',
        alt: 'Off-White Vulcanized Low sneaker in white with black diagonal stripes'
    }
];

/* The two Sneaks locations shown on the contact page map.
   NOTE: the coordinates are approximate. To check them, right-click
   the spot in Google Maps and copy the two numbers. */
const STORE_LOCATIONS = [
    {
        name: 'Main Store',
        address: '45 Florida Road, Morningside, Durban, 4001',
        lat: -29.8318,
        lng: 31.0148
    },
    {
        name: 'Weekend Pop-Up',
        address: 'Windermere Village Market, Durban, 4001',
        lat: -29.8266,
        lng: 31.0087
    }
];


/* =============================================================
   2. SMALL HELPER FUNCTIONS
   ============================================================= */

/* Shortcuts so we do not type document.querySelector every time. */
const $ = (selector, parent = document) => parent.querySelector(selector);
const $$ = (selector, parent = document) => Array.from(parent.querySelectorAll(selector));

/* Turns 3800 into "R3 800", matching the prices already on the site. */
function formatPrice(amount) {
    return 'R' + String(Math.round(amount)).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
}

/* Stops text containing quotes or < > from breaking our HTML. */
function escapeHTML(text) {
    return String(text)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

/* Waits until the visitor stops typing before running a function.
   Without this, the product list would rebuild on every keystroke. */
function debounce(fn, delay = 200) {
    let timer;
    return (...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => fn(...args), delay);
    };
}

/* Does the visitor ask their device to reduce motion? */
function prefersReducedMotion() {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/* Today's date (or today + some days) as YYYY-MM-DD, for date inputs. */
function toISODate(date) {
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${date.getFullYear()}-${month}-${day}`;
}

function addDays(days) {
    const date = new Date();
    date.setDate(date.getDate() + days);
    return date;
}

/* Lower-cases a name and removes spaces and symbols, so
   "Air Jordan 1" can be compared with "Nike Air Jordan 1". */
function normalise(text) {
    return String(text).toLowerCase().replace(/[^a-z0-9]/g, '');
}

/* Pulls the number out of "UK 8" or "8.5". Returns NaN if none. */
function parseSize(text) {
    const match = String(text).match(/(\d{1,2}(?:\.5)?)/);
    return match ? parseFloat(match[1]) : NaN;
}


/* =============================================================
   3. NAVIGATION AND BACK-TO-TOP BUTTON
   ============================================================= */

function initNavigation() {
    const toggle = $('#nav-toggle');
    if (!toggle) return;

    /* Close the mobile menu after a link is tapped. */
    $$('.nav-links a').forEach(link => {
        link.addEventListener('click', () => { toggle.checked = false; });
    });

    /* Close the menu with the Escape key. */
    document.addEventListener('keydown', event => {
        if (event.key === 'Escape' && toggle.checked) {
            toggle.checked = false;
            $('.nav-toggle-label').focus();
        }
    });

    /* If the window grows past the phone size, reset the menu. */
    window.addEventListener('resize', debounce(() => {
        if (window.innerWidth > 600) toggle.checked = false;
    }, 150));
}

/* A button that appears after scrolling down and jumps back to the top.
   The whole button is created with JavaScript (DOM manipulation). */
function initBackToTop() {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'back-to-top';
    button.setAttribute('aria-label', 'Back to top');
    button.textContent = '↑';
    document.body.appendChild(button);

    window.addEventListener('scroll', () => {
        /* classList.toggle(name, condition) adds the class when true. */
        button.classList.toggle('is-visible', window.scrollY > 400);
    }, { passive: true });

    button.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
    });
}


/* =============================================================
   4. SCROLL ANIMATIONS
   Sections below the screen start faded out and slide up into
   view as the visitor scrolls to them (IntersectionObserver).
   ============================================================= */

let revealObserver = null;

function initScrollReveal() {
    if (prefersReducedMotion() || !('IntersectionObserver' in window)) return;

    revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target);   // animate only once
            }
        });
    }, { threshold: 0.12 });

    $$('main > section, .values > section').forEach(revealOnScroll);
}

function revealOnScroll(element) {
    if (!revealObserver) return;
    /* Anything already on screen is left alone, so the top of the
       page never flashes empty. */
    if (element.getBoundingClientRect().top < window.innerHeight) return;
    element.classList.add('reveal');
    revealObserver.observe(element);
}


/* =============================================================
   5. PRODUCTS PAGE: DYNAMIC LISTINGS, SEARCH, FILTER, SORT
   ============================================================= */

/* What is currently shown (used by the lightbox too). */
let visibleProducts = [];

/* Builds the HTML for one product card. */
function createProductCard(product, index) {
    const card = document.createElement('article');
    card.className = 'product-card';
    card.dataset.id = product.id;
    card.style.setProperty('--i', index);   // used for the staggered entrance

    card.innerHTML = `
        <figure class="product-photo">
            <img
                src="${product.image}-1200.jpg"
                srcset="${product.image}-480.jpg 480w, ${product.image}-1200.jpg 1200w"
                sizes="(max-width: 600px) 90vw, (max-width: 1024px) 45vw, 240px"
                alt="${escapeHTML(product.alt)}"
                width="220"
                loading="lazy">
            <button type="button" class="zoom-btn"
                    aria-label="View a larger photo of ${escapeHTML(product.name)}">View</button>
            <figcaption class="product-name">${escapeHTML(product.name)}</figcaption>
        </figure>
        <p class="product-meta">Size: UK ${product.size} | Condition: ${escapeHTML(product.conditionNote)}</p>
        <p class="price">${formatPrice(product.price)}</p>
    `;
    return card;
}

function initProductsPage() {
    const grid = $('.product-grid');
    if (!grid) return;

    /* ---- Build the search / filter / sort toolbar with JavaScript ---- */
    const toolbar = document.createElement('div');
    toolbar.className = 'product-toolbar';
    toolbar.innerHTML = `
        <div class="toolbar-field">
            <label for="product-search">Search</label>
            <input type="search" id="product-search" placeholder="e.g. Jordan, Yeezy, UK 8" autocomplete="off">
        </div>
        <div class="toolbar-field">
            <label for="condition-filter">Condition</label>
            <select id="condition-filter">
                <option value="all">All conditions</option>
                <option value="Deadstock">Deadstock</option>
                <option value="Pre-owned">Pre-owned</option>
            </select>
        </div>
        <div class="toolbar-field">
            <label for="sort-by">Sort by</label>
            <select id="sort-by">
                <option value="default">Featured</option>
                <option value="price-asc">Price: low to high</option>
                <option value="price-desc">Price: high to low</option>
                <option value="name">Name: A to Z</option>
                <option value="size">Size: small to large</option>
            </select>
        </div>
        <p id="result-count" class="result-count" role="status" aria-live="polite"></p>
    `;
    grid.before(toolbar);

    const searchBox = $('#product-search');
    const conditionFilter = $('#condition-filter');
    const sortSelect = $('#sort-by');
    const resultCount = $('#result-count');

    /* Works out which products to show, then redraws the grid. */
    function update() {
        const query = searchBox.value.trim().toLowerCase();
        const condition = conditionFilter.value;

        /* 1. FILTER: keep products that match the search words and condition. */
        let list = PRODUCTS.filter(product => {
            const searchable = `${product.name} ${product.brand} ${product.conditionNote} uk ${product.size}`.toLowerCase();
            const matchesSearch = query.split(/\s+/).every(word => searchable.includes(word));
            const matchesCondition = condition === 'all' || product.condition === condition;
            return matchesSearch && matchesCondition;
        });

        /* 2. SORT: sort() changes the order of the list. */
        switch (sortSelect.value) {
            case 'price-asc':  list.sort((a, b) => a.price - b.price); break;
            case 'price-desc': list.sort((a, b) => b.price - a.price); break;
            case 'name':       list.sort((a, b) => a.name.localeCompare(b.name)); break;
            case 'size':       list.sort((a, b) => a.size - b.size); break;
            default: break;    // "Featured" keeps the original order
        }

        visibleProducts = list;
        renderProducts(grid, list, query);
        resultCount.textContent = list.length === 1
            ? '1 pair found'
            : `${list.length} pairs found`;
    }

    searchBox.addEventListener('input', debounce(update, 200));
    conditionFilter.addEventListener('change', update);
    sortSelect.addEventListener('change', update);

    /* "Clear search" button inside the empty-state message
       (event delegation: one listener on the grid handles it). */
    grid.addEventListener('click', event => {
        if (event.target.closest('.clear-filters')) {
            searchBox.value = '';
            conditionFilter.value = 'all';
            sortSelect.value = 'default';
            update();
            searchBox.focus();
        }

        /* Open the lightbox when a photo or its "View" button is clicked. */
        const trigger = event.target.closest('.zoom-btn, .product-photo img');
        if (trigger) {
            const card = trigger.closest('.product-card');
            openLightbox(visibleProducts.findIndex(p => p.id === card.dataset.id), trigger);
        }
    });

    update();   // first draw: replaces the static cards with the dynamic ones
}

/* Empties the grid and draws the given products. */
function renderProducts(grid, list, query) {
    const fragment = document.createDocumentFragment();

    if (list.length === 0) {
        const empty = document.createElement('div');
        empty.className = 'no-results';
        empty.innerHTML = `
            <h2>No pairs match "${escapeHTML(query || 'your filters')}"</h2>
            <p>Try a different word, or <a href="enquiry.html">send us an enquiry</a>
               and we will try to source it for you.</p>
            <button type="button" class="cta-button-secondary clear-filters">Clear search</button>
        `;
        fragment.appendChild(empty);
    } else {
        list.forEach((product, index) => fragment.appendChild(createProductCard(product, index)));
    }

    grid.replaceChildren(fragment);
}


/* =============================================================
   6. LIGHTBOX GALLERY
   Uses the built-in <dialog> element, which handles the dark
   backdrop, the Escape key and keeping focus inside for us.
   ============================================================= */

let lightbox = null;
let lightboxIndex = 0;
let lightboxOpener = null;

function buildLightbox() {
    lightbox = document.createElement('dialog');
    lightbox.className = 'lightbox';
    lightbox.setAttribute('aria-label', 'Photo viewer');
    lightbox.innerHTML = `
        <button type="button" class="lightbox-close" aria-label="Close photo viewer">&times;</button>
        <button type="button" class="lightbox-nav lightbox-prev" aria-label="Previous photo">&#8249;</button>
        <figure class="lightbox-figure">
            <img class="lightbox-img" alt="">
            <figcaption class="lightbox-caption"></figcaption>
        </figure>
        <button type="button" class="lightbox-nav lightbox-next" aria-label="Next photo">&#8250;</button>
    `;
    document.body.appendChild(lightbox);

    $('.lightbox-close', lightbox).addEventListener('click', () => lightbox.close());
    $('.lightbox-prev', lightbox).addEventListener('click', () => stepLightbox(-1));
    $('.lightbox-next', lightbox).addEventListener('click', () => stepLightbox(1));

    /* Clicking the dark area outside the photo closes it. */
    lightbox.addEventListener('click', event => {
        if (event.target === lightbox) lightbox.close();
    });

    /* Arrow keys move between photos. */
    lightbox.addEventListener('keydown', event => {
        if (event.key === 'ArrowLeft') stepLightbox(-1);
        if (event.key === 'ArrowRight') stepLightbox(1);
    });

    /* When it closes, unlock page scrolling and return focus. */
    lightbox.addEventListener('close', () => {
        document.body.classList.remove('no-scroll');
        if (lightboxOpener) lightboxOpener.focus();
    });
}

function showLightboxPhoto() {
    const product = visibleProducts[lightboxIndex];
    if (!product) return;
    const image = $('.lightbox-img', lightbox);

    image.src = `${product.image}-1200.jpg`;
    image.srcset = `${product.image}-480.jpg 480w, ${product.image}-1200.jpg 1200w`;
    image.sizes = '92vw';
    image.alt = product.alt;
    $('.lightbox-caption', lightbox).textContent =
        `${product.name} · UK ${product.size} · ${product.conditionNote} · ${formatPrice(product.price)}`;

    /* Hide the arrows when there is only one photo. */
    const single = visibleProducts.length < 2;
    $$('.lightbox-nav', lightbox).forEach(button => { button.hidden = single; });
}

function stepLightbox(direction) {
    if (visibleProducts.length < 2) return;
    /* The % keeps the number inside the list, looping from end to start. */
    lightboxIndex = (lightboxIndex + direction + visibleProducts.length) % visibleProducts.length;
    showLightboxPhoto();
}

function openLightbox(index, opener) {
    if (index < 0) return;
    if (!lightbox) buildLightbox();
    lightboxIndex = index;
    lightboxOpener = opener;
    showLightboxPhoto();
    document.body.classList.add('no-scroll');
    lightbox.showModal();
}


/* =============================================================
   7. FAQ ACCORDION
   Each question is a button. Pressing it opens its answer and
   closes the others. aria-expanded tells screen readers the state.
   ============================================================= */

function initAccordion() {
    const triggers = $$('.accordion-trigger');
    if (triggers.length === 0) return;

    function setOpen(trigger, open) {
        const panel = document.getElementById(trigger.getAttribute('aria-controls'));
        trigger.setAttribute('aria-expanded', String(open));
        panel.classList.toggle('open', open);
        panel.inert = !open;   // closed answers cannot be tabbed into
    }

    triggers.forEach(trigger => {
        setOpen(trigger, false);
        trigger.addEventListener('click', () => {
            const willOpen = trigger.getAttribute('aria-expanded') !== 'true';
            triggers.forEach(other => setOpen(other, false));
            setOpen(trigger, willOpen);
        });
    });
}


/* =============================================================
   8. FORM VALIDATION ENGINE
   Both forms use these functions. Each form supplies a "rules"
   object: one small function per field that returns an error
   message, or an empty string if the value is fine.
   ============================================================= */

/* Reusable checks (regular expressions) */
const PATTERNS = {
    name: /^[A-Za-zÀ-ÖØ-öø-ÿ' -]+$/,
    email: /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/,
    saPhone: /^(\+27|0)[1-9]\d{8}$/,       // e.g. 0315550456 or +27315550456
    ukSize: /^(UK\s*)?(\d{1,2})(\.5)?$/i   // e.g. 8, 8.5, UK 8
};

/* Finds (or creates) the red message paragraph under a field. */
function getErrorElement(input) {
    const id = `${input.id}-error`;
    let element = document.getElementById(id);
    if (!element) {
        element = document.createElement('p');
        element.id = id;
        element.className = 'field-error';
        element.hidden = true;
        /* A checkbox sits inside a wrapper with its label, so the message
           goes after the wrapper instead of between the box and its text. */
        const anchor = input.type === 'checkbox' ? input.closest('.checkbox-field') : input;
        anchor.insertAdjacentElement('afterend', element);
        input.setAttribute('aria-describedby', id);
    }
    return element;
}

function showError(input, message) {
    const element = getErrorElement(input);
    element.textContent = message;
    element.hidden = false;
    input.setAttribute('aria-invalid', 'true');
}

function clearError(input) {
    const element = getErrorElement(input);
    element.textContent = '';
    element.hidden = true;
    input.removeAttribute('aria-invalid');
}

/* Reads every field in the form into one object: { "full-name": "Sam", ... } */
function getFormValues(form) {
    const values = {};
    $$('input, select, textarea', form).forEach(field => {
        if (!field.id) return;
        values[field.id] = field.type === 'checkbox'
            ? (field.checked ? 'Yes' : 'No')
            : field.value.trim();
    });
    return values;
}

/* Checks one field. Returns true when it is valid. */
function validateField(input, rules, form) {
    const rule = rules[input.id];
    const hidden = input.closest('[hidden]');
    if (!rule || hidden) {
        clearError(input);
        return true;
    }
    /* A checkbox counts as filled in only when it is ticked. */
    const value = input.type === 'checkbox' ? (input.checked ? 'yes' : '') : input.value.trim();
    const message = rule(value, getFormValues(form));
    if (message) {
        showError(input, message);
        return false;
    }
    clearError(input);
    return true;
}

/* Wires validation to a form. Returns a function that checks the
   whole form and focuses the first mistake. */
function attachValidation(form, rules) {
    /* Check a field when the visitor leaves it. */
    form.addEventListener('focusout', event => {
        if (event.target.id && rules[event.target.id]) {
            validateField(event.target, rules, form);
        }
    });

    /* Once a field is marked wrong, re-check it on every keystroke
       so the message disappears the moment it is fixed. */
    const recheck = event => {
        if (event.target.getAttribute('aria-invalid') === 'true') {
            validateField(event.target, rules, form);
        }
    };
    form.addEventListener('input', recheck);
    form.addEventListener('change', recheck);

    return function validateAll() {
        let firstInvalid = null;
        $$('input, select, textarea', form).forEach(field => {
            const ok = validateField(field, rules, form);
            if (!ok && !firstInvalid) firstInvalid = field;
        });
        if (firstInvalid) firstInvalid.focus();
        return !firstInvalid;
    };
}

/* A live "123 / 500" character counter under a textarea. */
function addCharCounter(textarea, max) {
    const counter = document.createElement('p');
    counter.className = 'char-count';
    textarea.insertAdjacentElement('afterend', counter);

    const refresh = () => {
        const length = textarea.value.length;
        counter.textContent = `${length} / ${max} characters`;
        counter.classList.toggle('over-limit', length > max);
    };
    textarea.addEventListener('input', refresh);
    refresh();
    return refresh;
}

/* Checks used by more than one form */
/* The consent checkbox on both forms must be ticked. */
function checkConsent(value) {
    return value ? '' : 'Please tick the box to agree before you continue.';
}

function checkName(value) {
    if (!value) return 'Please enter your full name.';
    if (value.length < 2) return 'Your name must be at least 2 characters.';
    if (value.length > 60) return 'Your name must be 60 characters or fewer.';
    if (!PATTERNS.name.test(value)) return 'Use letters, spaces, hyphens or apostrophes only.';
    return '';
}

function checkEmail(value) {
    if (!value) return 'Please enter your email address.';
    if (!PATTERNS.email.test(value)) return 'Enter a valid email, like name@example.com.';
    return '';
}

function checkPhone(value, required) {
    if (!value) return required ? 'Please enter your phone number.' : '';
    const digits = value.replace(/[\s()-]/g, '');   // ignore spaces, dashes, brackets
    if (!PATTERNS.saPhone.test(digits)) {
        return 'Enter a South African number, like 031 555 0456 or +27 31 555 0456.';
    }
    return '';
}


/* =============================================================
   9. ENQUIRY FORM
   Validates, sends the data with AJAX (fetch), then shows a reply
   about cost and availability.
   ============================================================= */

/* Looks for a listed pair that matches what the visitor typed.
   If more than one matches, a pair in the requested size wins. */
function findProduct(modelText, size) {
    const wanted = normalise(modelText);
    if (!wanted) return null;
    const matches = PRODUCTS.filter(product => {
        const name = normalise(product.name);
        return name.includes(wanted) || wanted.includes(name);
    });
    return matches.find(product => product.size === size) || matches[0] || null;
}

/* Works out the reply shown after a valid enquiry is sent.
   Returns { title, lines } where lines is a list of sentences. */
function buildEnquiryReply(data) {
    const size = parseSize(data.size);
    const product = findProduct(data['sneaker-model'], size);
    const rules = STORE_RULES;

    /* ----- RESERVE A LISTED PAIR ----- */
    if (data['enquiry-type'] === 'reserve') {
        if (product && product.size === size) {
            const deposit = product.price * rules.depositRate;
            return {
                title: 'Good news — this pair is available',
                lines: [
                    `${product.name} (UK ${product.size}, ${product.conditionNote}) is in stock at ${formatPrice(product.price)}.`,
                    `Pay a ${formatPrice(deposit)} deposit (${rules.depositRate * 100}%) and we will hold it for ${rules.holdHours} hours.`,
                    `Collection date requested: ${data['pickup-date']}.`
                ]
            };
        }
        if (product) {
            return {
                title: 'That size is not in stock',
                lines: [
                    `We have the ${product.name} in UK ${product.size} only (${formatPrice(product.price)}).`,
                    `We can try to source UK ${size} for a ${formatPrice(rules.sourcingFee)} sourcing fee, usually in ${rules.sourcingDays} working days.`
                ]
            };
        }
    }

    /* ----- MAKE AN OFFER ----- */
    if (data['enquiry-type'] === 'offer' && product) {
        const offer = parseFloat(data['offer-amount']);
        const ratio = offer / product.price;
        if (ratio >= rules.acceptRate) {
            return {
                title: 'Your offer looks good',
                lines: [
                    `${formatPrice(offer)} for the ${product.name} (listed at ${formatPrice(product.price)}) is acceptable.`,
                    'We will confirm by email within 24 hours.'
                ]
            };
        }
        if (ratio >= rules.minOfferRate) {
            const counter = Math.round((product.price * rules.acceptRate) / 50) * 50;
            return {
                title: 'We have a counter-offer',
                lines: [
                    `Your offer of ${formatPrice(offer)} is a little below the ${formatPrice(product.price)} listing.`,
                    `We could meet you at ${formatPrice(counter)}. Reply to our email to accept.`
                ]
            };
        }
        return {
            title: 'That offer is too low',
            lines: [
                `We cannot accept ${formatPrice(offer)} for the ${product.name}, which is listed at ${formatPrice(product.price)}.`,
                'Please send a higher offer and we will gladly consider it.'
            ]
        };
    }

    /* ----- ANYTHING ELSE: sourcing request (or a model we do not list) ----- */
    const model = data['sneaker-model'] || 'the pair you described';
    return {
        title: 'We will source this for you',
        lines: [
            `We do not have ${model} in stock right now, but we can search for it.`,
            `Sourcing takes about ${rules.sourcingDays} working days and costs a ${formatPrice(rules.sourcingFee)} sourcing fee.`,
            'We will email you the price before you commit to anything.'
        ]
    };
}

function initEnquiryForm() {
    const form = $('#enquiry-form');
    if (!form) return;
    form.noValidate = true;   // we show our own messages instead of the browser's

    const typeSelect = $('#enquiry-type');
    const offerGroup = $('#offer-group');
    const dateGroup = $('#date-group');
    const dateInput = $('#pickup-date');
    const responseBox = $('#enquiry-response');
    const submitButton = $('.submit-btn', form);

    /* Fill the model suggestions list from the product data. */
    const modelList = $('#model-list');
    PRODUCTS.forEach(product => {
        const option = document.createElement('option');
        option.value = product.name;
        modelList.appendChild(option);
    });

    /* A collection date can be today up to 14 days ahead. */
    dateInput.min = toISODate(new Date());
    dateInput.max = toISODate(addDays(14));

    /* Show only the fields that suit the chosen enquiry type. */
    function updateFields() {
        offerGroup.hidden = typeSelect.value !== 'offer';
        dateGroup.hidden = typeSelect.value !== 'reserve';
    }
    typeSelect.addEventListener('change', updateFields);
    updateFields();

    /* ----- Validation rules: one function per field ----- */
    const rules = {
        'full-name': checkName,
        'email': checkEmail,
        'phone': value => checkPhone(value, true),

        'enquiry-type': value => value ? '' : 'Please choose an enquiry type.',
        'consent': checkConsent,

        'sneaker-model': (value, all) => {
            const needed = all['enquiry-type'] === 'reserve' || all['enquiry-type'] === 'offer';
            if (needed && !value) return 'Please tell us which sneaker you mean.';
            if (value.length > 80) return 'Keep the model name under 80 characters.';
            return '';
        },

        'size': (value, all) => {
            const needed = all['enquiry-type'] === 'reserve' || all['enquiry-type'] === 'request';
            if (!value) return needed ? 'Please enter a size, like UK 8.' : '';
            if (!PATTERNS.ukSize.test(value)) return 'Enter a size like 8, 8.5 or UK 8.';
            const number = parseSize(value);
            if (number < 3 || number > 14) return 'Sizes must be between UK 3 and UK 14.';
            return '';
        },

        'offer-amount': (value, all) => {
            if (all['enquiry-type'] !== 'offer') return '';
            if (!value) return 'Please enter your offer in rand.';
            const amount = Number(value);
            if (Number.isNaN(amount)) return 'Enter numbers only, like 3500.';
            if (amount < 500 || amount > 100000) return 'Offers must be between R500 and R100 000.';
            return '';
        },

        'pickup-date': (value, all) => {
            if (all['enquiry-type'] !== 'reserve') return '';
            if (!value) return 'Please choose a collection date.';
            if (value < dateInput.min) return 'The date cannot be in the past.';
            if (value > dateInput.max) return 'Please choose a date within the next 14 days.';
            return '';
        },

        'message': value => value.length > 500 ? 'Please keep your message under 500 characters.' : ''
    };

    const validateAll = attachValidation(form, rules);
    addCharCounter($('#message'), 500);

    /* ----- Submit ----- */
    form.addEventListener('submit', async event => {
        event.preventDefault();              // stop the normal page reload
        responseBox.hidden = true;

        if (!validateAll()) return;

        const data = getFormValues(form);
        submitButton.disabled = true;
        submitButton.textContent = 'Sending…';

        try {
            /* AJAX: send the data to the URL in the form's action
               attribute without reloading the page. */
            const reply = await fetch(form.action, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            if (!reply.ok) throw new Error(`Server replied with status ${reply.status}`);

            showEnquiryReply(responseBox, buildEnquiryReply(data), data);
            form.reset();
            updateFields();
            $$('.char-count', form).forEach(counter => { counter.textContent = '0 / 500 characters'; });
        } catch (error) {
            console.error('Enquiry could not be sent:', error);
            showEnquiryProblem(responseBox);
        } finally {
            submitButton.disabled = false;
            submitButton.textContent = 'Submit Enquiry';
        }
    });
}

/* Draws the success reply (built with DOM methods, not innerHTML). */
function showEnquiryReply(box, reply, data) {
    const reference = 'SNK-' + Date.now().toString(36).toUpperCase().slice(-6);

    const heading = document.createElement('h2');
    heading.textContent = reply.title;

    const list = document.createElement('ul');
    reply.lines.forEach(line => {
        const item = document.createElement('li');
        item.textContent = line;
        list.appendChild(item);
    });

    const footer = document.createElement('p');
    footer.className = 'response-ref';
    footer.textContent = `Thanks, ${data['full-name'].split(' ')[0]}. Your reference is ${reference}. Please quote it when we reply to ${data.email}.`;

    box.className = 'response-box success';
    box.replaceChildren(heading, list, footer);
    box.hidden = false;
    box.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth', block: 'center' });
}

function showEnquiryProblem(box) {
    const heading = document.createElement('h2');
    heading.textContent = 'Something went wrong';
    const text = document.createElement('p');
    text.textContent = 'We could not send your enquiry. Check your internet connection and try again, or contact us directly from the Contact page.';

    box.className = 'response-box failure';
    box.replaceChildren(heading, text);
    box.hidden = false;
    box.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth', block: 'center' });
}


/* =============================================================
   10. CONTACT FORM
   Validates the message, then compiles it into an email. The
   visitor can open it in their email app and send it to the
   address stored in the form's action attribute.
   ============================================================= */

function initContactForm() {
    const form = $('#contact-form');
    if (!form) return;
    form.noValidate = true;

    /* The recipient is read from  action="mailto:..."  in the HTML. */
    const recipient = form.getAttribute('action').replace(/^mailto:/i, '');
    const preview = $('#email-preview');

    const rules = {
        'contact-name': checkName,
        'contact-email': checkEmail,
        'contact-phone': value => checkPhone(value, false),   // optional
        'contact-type': value => value ? '' : 'Please choose what your message is about.',
        'contact-consent': checkConsent,
        'contact-message': value => {
            if (!value) return 'Please type your message.';
            if (value.length < 10) return 'Your message must be at least 10 characters.';
            if (value.length > 500) return 'Please keep your message under 500 characters.';
            return '';
        }
    };

    const validateAll = attachValidation(form, rules);
    const refreshCounter = addCharCounter($('#contact-message'), 500);

    form.addEventListener('submit', event => {
        event.preventDefault();
        preview.hidden = true;
        if (!validateAll()) return;

        const data = getFormValues(form);
        const typeLabel = $('#contact-type').selectedOptions[0].textContent;

        /* Compile the email: subject line + body text. */
        const subject = `Sneaks website: ${typeLabel} from ${data['contact-name']}`;
        const body = [
            'Hi Sneaks team,',
            '',
            data['contact-message'],
            '',
            '---',
            `Name: ${data['contact-name']}`,
            `Email: ${data['contact-email']}`,
            `Phone: ${data['contact-phone'] || 'not provided'}`,
            `Message type: ${typeLabel}`
        ].join('\n');

        /* encodeURIComponent makes the text safe to place inside a link. */
        const mailtoLink = `mailto:${recipient}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

        showEmailPreview(preview, { recipient, subject, body, mailtoLink });
        form.reset();
        refreshCounter();
    });
}

function showEmailPreview(box, email) {
    const heading = document.createElement('h2');
    heading.textContent = 'Your message is ready to send';

    const intro = document.createElement('p');
    intro.textContent = 'Check the details below. When you are happy, press Send Email and your email app will open with this message ready to send.';

    const details = document.createElement('dl');
    details.className = 'email-details';
    [['To', email.recipient], ['Subject', email.subject]].forEach(([label, value]) => {
        const term = document.createElement('dt');
        term.textContent = label;
        const description = document.createElement('dd');
        description.textContent = value;
        details.append(term, description);
    });

    const message = document.createElement('pre');
    message.className = 'email-body';
    message.textContent = email.body;

    const button = document.createElement('a');
    button.className = 'cta-button';
    button.href = email.mailtoLink;
    button.textContent = 'Send Email';

    box.className = 'response-box success';
    box.replaceChildren(heading, intro, details, message, button);
    box.hidden = false;
    box.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth', block: 'center' });
}


/* =============================================================
   11. INTERACTIVE MAP (LEAFLET + ESRI MAPS)
   One map with a marker for each location. The "Show on map"
   buttons fly the map to that location.
   ============================================================= */

function initMap() {
    const mapElement = $('#store-map');
    if (!mapElement) return;

    /* If the Leaflet library did not load (e.g. no internet),
       show a plain message instead of an empty box. */
    if (typeof L === 'undefined') {
        mapElement.textContent = 'The map could not be loaded. Please use the addresses above.';
        mapElement.classList.add('map-failed');
        return;
    }

    const map = L.map(mapElement, { scrollWheelZoom: false });

    /* ---- Base maps (all from Esri, which needs no API key) ----
       The plain OpenStreetMap server blocks pages opened straight from
       a file, and CARTO now requires a key, so Esri is used instead. */
    const esri = 'https://server.arcgisonline.com/ArcGIS/rest/services/';
    const esriCredit = 'Tiles &copy; Esri';

    const street = L.tileLayer(esri + 'World_Street_Map/MapServer/tile/{z}/{y}/{x}', {
        maxZoom: 19,
        attribution: esriCredit + ' &mdash; Source: Esri, DeLorme, NAVTEQ, USGS'
    });

    const light = L.tileLayer(esri + 'Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}', {
        maxNativeZoom: 16,
        maxZoom: 19,
        attribution: esriCredit + ' &mdash; Source: Esri, HERE, Garmin, OpenStreetMap contributors'
    });

    /* Satellite photos plus a layer of place names and borders on top,
       so the satellite view is still easy to read. */
    const satellite = L.layerGroup([
        L.tileLayer(esri + 'World_Imagery/MapServer/tile/{z}/{y}/{x}', {
            maxZoom: 19,
            attribution: esriCredit + ' &mdash; Source: Esri, Maxar, Earthstar Geographics, and the GIS User Community'
        }),
        L.tileLayer(esri + 'Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}', {
            maxZoom: 19
        })
    ]);

    street.addTo(map);   // the view shown first

    /* The layer switcher (top right) lets the visitor change view. */
    L.control.layers({ 'Street': street, 'Light': light, 'Satellite': satellite }, null,
                     { position: 'topright' }).addTo(map);
    L.control.scale({ imperial: false, position: 'bottomleft' }).addTo(map);

    /* The scroll wheel only zooms the map after the visitor clicks it,
       so the page can still be scrolled normally past the map. */
    map.on('focus', () => map.scrollWheelZoom.enable());
    map.on('blur', () => map.scrollWheelZoom.disable());

    /* ---- Custom branded markers (styled in style.css) ---- */
    const pinIcon = L.divIcon({
        className: 'sneaks-pin',
        html: '<span></span>',
        iconSize: [34, 42],
        iconAnchor: [17, 42],
        popupAnchor: [0, -38]
    });

    const markers = STORE_LOCATIONS.map(place => {
        const marker = L.marker([place.lat, place.lng], {
            icon: pinIcon,
            title: place.name,
            alt: place.name + ' location',
            riseOnHover: true
        }).addTo(map);
        const directions = `https://www.google.com/maps/dir/?api=1&destination=${place.lat},${place.lng}`;
        marker.bindPopup(
            `<div class="map-popup">` +
            `<strong>${escapeHTML(place.name)}</strong>` +
            `<span>${escapeHTML(place.address)}</span>` +
            `<a href="${directions}" target="_blank" rel="noopener noreferrer">Get directions</a>` +
            `</div>`);
        return marker;
    });

    /* Zoom so both markers fit on screen. */
    map.fitBounds(L.featureGroup(markers).getBounds().pad(0.4));

    /* "Show on map" buttons */
    $$('.show-on-map').forEach(button => {
        button.addEventListener('click', () => {
            const index = Number(button.dataset.index);
            map.flyTo([STORE_LOCATIONS[index].lat, STORE_LOCATIONS[index].lng], 16,
                      { animate: !prefersReducedMotion() });
            markers[index].openPopup();
            mapElement.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth', block: 'center' });
        });
    });
}


/* =============================================================
   12. START-UP
   Run each feature once the page's HTML has finished loading.
   Every function first checks that its page elements exist, so
   the same file safely runs on all five pages.
   ============================================================= */

document.addEventListener('DOMContentLoaded', () => {
    initNavigation();
    initBackToTop();
    initScrollReveal();
    initProductsPage();
    initAccordion();
    initEnquiryForm();
    initContactForm();
    initMap();
});
