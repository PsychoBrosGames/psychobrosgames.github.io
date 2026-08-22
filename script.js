const header = document.querySelector("[data-header]");
const menuToggle = document.querySelector(".menu-toggle");
const mobileNavLinks = document.querySelectorAll(".mobile-nav a");
const themeToggle = document.querySelector(".theme-toggle");
const revealItems = document.querySelectorAll(".reveal");
const lensTabs = Array.from(document.querySelectorAll("[data-lens]"));
const lensPanels = Array.from(document.querySelectorAll("[data-panel]"));

const updateHeader = () => {
  header?.classList.toggle("is-scrolled", window.scrollY > 16);
};

const closeMenu = () => {
  header?.classList.remove("is-menu-open");
  document.body.classList.remove("menu-open");
  menuToggle?.setAttribute("aria-expanded", "false");
  menuToggle?.setAttribute("aria-label", "Open navigation");
};

menuToggle?.addEventListener("click", () => {
  const isOpen = header?.classList.toggle("is-menu-open") ?? false;
  document.body.classList.toggle("menu-open", isOpen);
  menuToggle.setAttribute("aria-expanded", String(isOpen));
  menuToggle.setAttribute("aria-label", isOpen ? "Close navigation" : "Open navigation");
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

document.querySelector("[data-year]").textContent = new Date().getFullYear();
