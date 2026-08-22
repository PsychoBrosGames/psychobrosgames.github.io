const header = document.querySelector("[data-header]");
const menuToggle = document.querySelector(".menu-toggle");
const mobileNav = document.querySelector(".mobile-nav");
const mobileNavLinks = document.querySelectorAll(".mobile-nav a");
const themeToggle = document.querySelector(".theme-toggle");
const revealItems = document.querySelectorAll(".reveal");
const lensTabs = Array.from(document.querySelectorAll("[data-lens]"));
const lensPanels = Array.from(document.querySelectorAll("[data-panel]"));
const reviewSearch = document.querySelector("[data-review-search]");
const reviewGroup = document.querySelector("[data-review-group]");
const reviewCards = Array.from(document.querySelectorAll("[data-review-card]"));
const reviewCount = document.querySelector("[data-review-count]");
const reviewLabel = document.querySelector("[data-review-label]");
const reviewEmpty = document.querySelector("[data-review-empty]");

const legacyHomeDestination = {
  "#crew": "about/#crew",
  "#standards": "about/#standards",
  "#contact": "about/#press",
}[window.location.hash];

if (document.body.classList.contains("home-page") && legacyHomeDestination) {
  window.location.replace(new URL(legacyHomeDestination, window.location.href));
}

const updateHeader = () => {
  header?.classList.toggle("is-scrolled", window.scrollY > 16);
};

const closeMenu = () => {
  header?.classList.remove("is-menu-open");
  document.body.classList.remove("menu-open");
  menuToggle?.setAttribute("aria-expanded", "false");
  menuToggle?.setAttribute("aria-label", "Open navigation");
  mobileNav?.setAttribute("aria-hidden", "true");
  mobileNav?.setAttribute("inert", "");
};

menuToggle?.addEventListener("click", () => {
  const isOpen = header?.classList.toggle("is-menu-open") ?? false;
  document.body.classList.toggle("menu-open", isOpen);
  menuToggle.setAttribute("aria-expanded", String(isOpen));
  menuToggle.setAttribute("aria-label", isOpen ? "Close navigation" : "Open navigation");
  mobileNav?.setAttribute("aria-hidden", String(!isOpen));
  mobileNav?.toggleAttribute("inert", !isOpen);
});

mobileNavLinks.forEach((link) => link.addEventListener("click", closeMenu));

window.addEventListener("scroll", updateHeader, { passive: true });
window.addEventListener("resize", () => {
  if (window.innerWidth > 1040) {
    closeMenu();
  }
});
updateHeader();

themeToggle?.addEventListener("click", () => {
  const nextTheme = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
  document.documentElement.dataset.theme = nextTheme;
  localStorage.setItem("psychobros-theme", nextTheme);

  const url = new URL(window.location.href);
  url.searchParams.set("scoutTheme", nextTheme);
  window.history.replaceState({}, "", url);
});

const activateLens = (selectedTab, moveFocus = false) => {
  const selectedLens = selectedTab.dataset.lens;

  lensTabs.forEach((tab) => {
    const isSelected = tab === selectedTab;
    tab.classList.toggle("is-active", isSelected);
    tab.setAttribute("aria-selected", String(isSelected));
    tab.tabIndex = isSelected ? 0 : -1;
  });

  lensPanels.forEach((panel) => {
    panel.hidden = panel.dataset.panel !== selectedLens;
  });

  if (moveFocus) {
    selectedTab.focus();
  }
};

lensTabs.forEach((tab, index) => {
  tab.addEventListener("click", () => activateLens(tab));
  tab.addEventListener("keydown", (event) => {
    if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) {
      return;
    }

    event.preventDefault();
    let nextIndex = index;

    if (event.key === "ArrowLeft") {
      nextIndex = (index - 1 + lensTabs.length) % lensTabs.length;
    } else if (event.key === "ArrowRight") {
      nextIndex = (index + 1) % lensTabs.length;
    } else if (event.key === "Home") {
      nextIndex = 0;
    } else if (event.key === "End") {
      nextIndex = lensTabs.length - 1;
    }

    activateLens(lensTabs[nextIndex], true);
  });
});

const filterReviews = () => {
  const query = reviewSearch?.value.trim().toLowerCase() ?? "";
  const group = reviewGroup?.value ?? "all";
  let visibleCount = 0;

  reviewCards.forEach((card) => {
    const searchableText = [
      card.dataset.reviewTitle,
      card.dataset.reviewStudio,
      card.dataset.reviewGenre,
    ]
      .filter(Boolean)
      .join(" ");
    const matchesQuery = !query || searchableText.includes(query);
    const matchesGroup = group === "all" || card.dataset.reviewGroup === group;
    const isVisible = matchesQuery && matchesGroup;

    card.hidden = !isVisible;
    if (isVisible) visibleCount += 1;
  });

  if (reviewCount) reviewCount.textContent = String(visibleCount);
  if (reviewLabel) reviewLabel.textContent = visibleCount === 1 ? "review shown" : "reviews shown";
  if (reviewEmpty) reviewEmpty.hidden = visibleCount !== 0;
};

reviewSearch?.addEventListener("input", filterReviews);
reviewGroup?.addEventListener("change", filterReviews);

if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }

        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.12 },
  );

  revealItems.forEach((item) => observer.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add("is-visible"));
}

const year = document.querySelector("[data-year]");
if (year) year.textContent = new Date().getFullYear();
