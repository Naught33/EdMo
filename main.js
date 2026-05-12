// ─── Hamburger menu (mobile) ──────────────────────────────────────────────────
const hamburger = document.querySelector("header > ion-icon");
const mobileNav = document.querySelector("header nav");
const navClose  = document.querySelector(".nav-close");

function openNav()  { mobileNav.classList.add("open"); }
function closeNav() { mobileNav.classList.remove("open"); }

hamburger.addEventListener("click", openNav);
navClose.addEventListener("click", closeNav);

// Close when any nav link or button is tapped
mobileNav.addEventListener("click", (e) => {
    if (e.target.tagName === "A" || e.target.tagName === "BUTTON") closeNav();
});


import { services } from "./servicelist.js";

// ─── DOM elements ─────────────────────────────────────────────────────────────
const header = document.querySelector("header");
const logo = document.querySelector(".logo");
const heroTitle = document.querySelector(".hero h1");
const overviewEl = document.getElementById("overview");
const listEl = document.getElementById("list");
const servicesSection = document.querySelector(".services");

const isMobile = () => window.innerWidth <= 768;

// ─── Logo blur ────────────────────────────────────────────────────────────────
function syncLogoBlur() {
    if (isMobile()) return;
    const rect = heroTitle.getBoundingClientRect();
    if (rect.bottom < -300 || rect.top < -300) logo.classList.add("blurred");
    else logo.classList.remove("blurred");
}

const heroObserver = new IntersectionObserver(
    ([entry]) => {
        if (!entry.isIntersecting) logo.classList.add("blurred");
        else logo.classList.remove("blurred");
    },
    { threshold: 0, rootMargin: `-300px 0px 0px 0px` }
);

if (!isMobile()) heroObserver.observe(heroTitle);

// ─── Scroll lock (desktop only) ───────────────────────────────────────────────
let savedScrollY = 0;
let scrollIsLocked = false;

function lockScroll() {
    if (isMobile() || scrollIsLocked) return;
    scrollIsLocked = true;
    savedScrollY = window.scrollY;
    document.body.style.overflow = "hidden";
    document.body.style.position = "fixed";
    document.body.style.top = `-${savedScrollY}px`;
    document.body.style.width = "100%";
}

function unlockScroll() {
    if (isMobile() || !scrollIsLocked) return;
    scrollIsLocked = false;
    document.body.style.overflow = "";
    document.body.style.position = "";
    document.body.style.top = "";
    document.body.style.width = "";
    window.scrollTo({ top: savedScrollY, behavior: "instant" });
}

// ─── Services data ────────────────────────────────────────────────────────────
const showcaseIds = ["1", "3", "6", "7", "9"];
const showcaseServices = showcaseIds.map(id => services.find(s => s.id === id));

let currentIndex = 0;
let isSnapped = false;
let isTransitioning = false;

// ─── Build overview panel ─────────────────────────────────────────────────────
function buildOverview(service) {
    const idx = showcaseServices.indexOf(service);
    const isLast = idx === showcaseServices.length - 1;

    const dots = showcaseServices.map((_, i) =>
        `<span class="swipe-dot${i === idx ? ' active' : ''}"></span>`
    ).join("");

    overviewEl.innerHTML = `
        <div class="view" style="background-image: url('${service.bgUrl}');">
            <div class="view-content">
                <span class="service-num">0${idx + 1}</span>
                <h1>${service.name}</h1>
                <p class="cat">${service.category}</p>
                <p class="view-desc">${service.description}</p>
                ${isMobile() ? `
                    <div class="swipe-dots">${dots}</div>
                    <div class="mobile-cta-row${isLast ? ' last' : ''}">
                        ${isLast
                            ? `<a href="tel:+254000000000" class="mobile-cta-btn filled">Call us now</a>
                               <a href="services.html" class="mobile-cta-btn outlined">All Services</a>`
                            : `<span class="swipe-hint"><ion-icon name="swap-horizontal-outline"></ion-icon> Swipe for more</span>`
                        }
                    </div>
                ` : ''}
            </div>
        </div>
    `;
}

// ─── Build list cards (desktop only) ─────────────────────────────────────────
function buildList(activeIndex) {
    if (isMobile()) return;
    listEl.innerHTML = "";

    const positions = [-2, -1, 0, 1, 2];

    positions.forEach(offset => {
        const idx = activeIndex + offset;

        if (offset === 2 && activeIndex === showcaseServices.length - 1) {
            const cta = document.createElement("div");
            cta.className = "horizontal-card cta-card down";
            cta.innerHTML = `
                <a href="tel:+254000000000" class="call">Call us now</a>
                <a href="services.html" class="services-link">All Services</a>
            `;
            listEl.appendChild(cta);
            return;
        }

        if (idx < 0 || idx >= showcaseServices.length) {
            const ghost = document.createElement("div");
            ghost.className = "horizontal-card ghost";
            listEl.appendChild(ghost);
            return;
        }

        const s = showcaseServices[idx];
        const card = document.createElement("div");

        let cls = "horizontal-card";
        if (offset === 0) cls += " selected";
        else if (offset === -1) cls += " up";
        else if (offset === 1) cls += " down";
        else if (offset < -1) cls += " far-up";
        else cls += " far-down";

        card.className = cls;
        card.dataset.idx = idx;
        card.innerHTML = `
            <h1>${s.name}</h1>
            <p class="cat">${s.category}</p>
            <p>${s.description}</p>
        `;

        card.addEventListener("click", () => {
            if (isTransitioning) return;
            navigateTo(idx);
        });

        listEl.appendChild(card);
    });
}

function navigateTo(idx) {
    if (idx < 0 || idx >= showcaseServices.length) return;
    if (idx === currentIndex) return;

    isTransitioning = true;
    currentIndex = idx;

    buildOverview(showcaseServices[currentIndex]);
    buildList(currentIndex);

    setTimeout(() => { isTransitioning = false; }, 400);
}

// ─── Desktop: section observers + wheel lock ──────────────────────────────────
if (!isMobile()) {
    // ── Snap hint ────────────────────────────────────────────────────────────
    const hint = document.createElement("div");
    hint.className = "scroll-hint";
    hint.innerHTML = `
        <ion-icon name="arrow-up-outline"></ion-icon>
        <ion-icon name="arrow-down-outline"></ion-icon>
        <span>Scroll, arrow keys, or spacebar to navigate</span>
    `;
    servicesSection.appendChild(hint);

    function showHint() { hint.classList.add("visible"); }
    function hideHint() { hint.classList.remove("visible"); }

    const headerObserver = new IntersectionObserver(
        ([entry]) => {
            if (entry.isIntersecting) {
                header.classList.add("hidden");
                servicesSection.scrollIntoView({ behavior: "smooth", block: "start" });
                setTimeout(lockScroll, 400);
                setTimeout(showHint, 500);
            } else {
                header.classList.remove("hidden");
                isSnapped = false;
                unlockScroll();
                hideHint();
                syncLogoBlur();
            }
        },
        { threshold: 0.5 }
    );

    const snapObserver = new IntersectionObserver(
        ([entry]) => { isSnapped = entry.isIntersecting; },
        { threshold: 0.9 }
    );

    headerObserver.observe(servicesSection);
    snapObserver.observe(servicesSection);

    // ── Shared navigate-or-exit logic ────────────────────────────────────────
    function handleNext() {
        if (currentIndex === showcaseServices.length - 1) { unlockScroll(); hideHint(); return; }
        navigateTo(currentIndex + 1);
    }
    function handlePrev() {
        if (currentIndex === 0) { unlockScroll(); hideHint(); return; }
        navigateTo(currentIndex - 1);
    }

    // ── Wheel ────────────────────────────────────────────────────────────────
    let accumulatedDelta = 0;
    const SCROLL_THRESHOLD = 80;

    window.addEventListener("wheel", (e) => {
        if (!isSnapped) return;

        const atStart = currentIndex === 0 && e.deltaY < 0;
        const atEnd   = currentIndex === showcaseServices.length - 1 && e.deltaY > 0;

        if (atStart || atEnd) {
            unlockScroll();
            hideHint();
            accumulatedDelta = 0;
            return;                 // don't preventDefault — let the scroll escape
        }

        e.preventDefault();
        accumulatedDelta += e.deltaY;
        if (Math.abs(accumulatedDelta) >= SCROLL_THRESHOLD) {
            if (!isTransitioning) {
                if (accumulatedDelta > 0) navigateTo(currentIndex + 1);
                else navigateTo(currentIndex - 1);
            }
            accumulatedDelta = 0;
        }
    }, { passive: false });

    // ── Keyboard ─────────────────────────────────────────────────────────────
    window.addEventListener("keydown", (e) => {
        if (!isSnapped) return;
        if (!["ArrowDown", "ArrowUp", " "].includes(e.key)) return;

        const goingDown = e.key === "ArrowDown" || e.key === " ";
        const atStart   = currentIndex === 0 && !goingDown;
        const atEnd     = currentIndex === showcaseServices.length - 1 && goingDown;

        if (atStart || atEnd) {
            unlockScroll();
            hideHint();
            return;                // don't preventDefault — let focus/scroll escape
        }

        e.preventDefault();
        if (!isTransitioning) {
            if (goingDown) navigateTo(currentIndex + 1);
            else navigateTo(currentIndex - 1);
        }
    });
}

// ─── Mobile: horizontal swipe on overview ────────────────────────────────────
// No body lock. Horizontal swipe navigates services; vertical scroll is
// entirely native and untouched.

if (isMobile()) {
    let touchStartX = 0;
    let touchStartY = 0;
    let isHorizontal = false;

    overviewEl.addEventListener("touchstart", (e) => {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
        isHorizontal = false;
    }, { passive: true });

    overviewEl.addEventListener("touchmove", (e) => {
        if (isHorizontal) { e.preventDefault(); return; }
        const dx = Math.abs(e.touches[0].clientX - touchStartX);
        const dy = Math.abs(e.touches[0].clientY - touchStartY);
        if (dx > dy + 8) {
            isHorizontal = true;
            e.preventDefault();
        }
    }, { passive: false });

    overviewEl.addEventListener("touchend", (e) => {
        if (!isHorizontal) return;
        const deltaX = touchStartX - e.changedTouches[0].clientX;
        if (Math.abs(deltaX) < 40) return;
        if (deltaX > 0) navigateTo(currentIndex + 1);
        else navigateTo(currentIndex - 1);
    }, { passive: true });
}

// ─── Init ─────────────────────────────────────────────────────────────────────
buildOverview(showcaseServices[0]);
buildList(0);