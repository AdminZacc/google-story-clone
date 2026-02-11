// Theme toggle functionality
document.addEventListener("DOMContentLoaded", () => {
  const themeToggle = document.getElementById("themeToggle");
  const body = document.body;
  
  if (!themeToggle) {
    console.error("Theme toggle button not found");
    return;
  }

  // Check for saved theme preference or default to dark mode
  const savedTheme = localStorage.getItem("theme") || "dark";
  if (savedTheme === "light") {
    body.classList.add("light-mode");
    themeToggle.setAttribute("aria-pressed", "true");
  }

  // Theme toggle event listener
  themeToggle.addEventListener("click", () => {
    const isLightMode = body.classList.toggle("light-mode");
    localStorage.setItem("theme", isLightMode ? "light" : "dark");
    themeToggle.setAttribute("aria-pressed", isLightMode);
    
    // Announce theme change to screen readers
    const themeName = isLightMode ? "light mode" : "dark mode";
    announceToScreenReader(`Switched to ${themeName}`);
  });

  // Respect system preference if no saved preference
  if (!localStorage.getItem("theme")) {
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    if (!prefersDark) {
      body.classList.add("light-mode");
      themeToggle.setAttribute("aria-pressed", "true");
    }
  }
});

// Set background images from data attributes
document.querySelectorAll(".story-section").forEach((section) => {
  const bg = section.getAttribute("data-bg");
  if (bg) {
    section.style.backgroundImage = `url(${bg})`;
  }
});

// Parallax scrolling effect
window.addEventListener("scroll", () => {
  document.querySelectorAll(".story-section").forEach((section) => {
    const scrollPosition = window.scrollY;
    const sectionOffset = section.offsetTop;
    const parallaxOffset = (scrollPosition - sectionOffset) * 0.5;
    section.style.backgroundPosition = `center calc(center + ${parallaxOffset}px)`;
  });
  
  // Update progress bar
  const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
  const scrollProgress = (window.scrollY / totalHeight) * 100;
  const progressBar = document.querySelector(".progress-bar");
  if (progressBar) {
    progressBar.style.width = scrollProgress + "%";
    // Update ARIA attributes for accessibility
    progressBar.setAttribute("aria-valuenow", Math.round(scrollProgress));
  }
  
  // Update active nav link
  updateActiveNavLink();
});

// Animation on reveal with IntersectionObserver
const observerOptions = {
  threshold: 0.3,
  rootMargin: "0px"
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add("visible");
      // Announce to screen readers when content comes into view
      announceToScreenReader(`${entry.target.querySelector("h2")?.textContent || ""} section has loaded`);
    }
  });
}, observerOptions);

document.querySelectorAll(".content").forEach((content) => {
  observer.observe(content);
});

// Update active nav link based on scroll position
function updateActiveNavLink() {
  const sections = document.querySelectorAll(".story-section[id]");
  const navLinks = document.querySelectorAll(".nav a");
  
  let currentSection = "";
  
  sections.forEach((section) => {
    const sectionTop = section.offsetTop;
    const sectionHeight = section.clientHeight;
    
    if (window.scrollY >= sectionTop - sectionHeight / 3) {
      currentSection = section.getAttribute("id");
    }
  });
  
  navLinks.forEach((link) => {
    link.classList.remove("active");
    const href = link.getAttribute("href").substring(1);
    if (href === currentSection) {
      link.classList.add("active");
      link.setAttribute("aria-current", "page");
    } else {
      link.removeAttribute("aria-current");
    }
  });
}

// Announce messages to screen readers using aria-live
function announceToScreenReader(message) {
  let liveRegion = document.querySelector("[aria-live='polite']");
  if (!liveRegion) {
    liveRegion = document.createElement("div");
    liveRegion.setAttribute("aria-live", "polite");
    liveRegion.setAttribute("aria-atomic", "true");
    liveRegion.style.position = "absolute";
    liveRegion.style.left = "-10000px";
    document.body.appendChild(liveRegion);
  }
  liveRegion.textContent = message;
}

// Smooth scroll on nav click with better keyboard support
document.querySelectorAll(".nav a").forEach((link) => {
  link.addEventListener("click", (e) => {
    e.preventDefault();
    const targetId = link.getAttribute("href").substring(1);
    const targetSection = document.getElementById(targetId);
    if (targetSection) {
      targetSection.scrollIntoView({ behavior: "smooth" });
      // Announce navigation and focus on the target
      announceToScreenReader(`Navigated to ${link.getAttribute("aria-label")}`);
      // Focus on the main content after scroll
      const heading = targetSection.querySelector("h2");
      if (heading) {
        heading.tabIndex = -1;
        heading.focus();
      }
    }
  });
});

// Keyboard support for arrow keys
document.addEventListener("keydown", (e) => {
  if (e.key === "ArrowRight" || e.key === "ArrowDown") {
    const navLinks = Array.from(document.querySelectorAll(".nav a"));
    const activeLink = document.querySelector(".nav a.active");
    const currentIndex = navLinks.findIndex(link => link === activeLink);
    if (currentIndex < navLinks.length - 1) {
      navLinks[currentIndex + 1].click();
      navLinks[currentIndex + 1].focus();
    }
  } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
    const navLinks = Array.from(document.querySelectorAll(".nav a"));
    const activeLink = document.querySelector(".nav a.active");
    const currentIndex = navLinks.findIndex(link => link === activeLink);
    if (currentIndex > 0) {
      navLinks[currentIndex - 1].click();
      navLinks[currentIndex - 1].focus();
    }
  }
});
