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
    }
  });
}

// Smooth scroll on nav click
document.querySelectorAll(".nav a").forEach((link) => {
  link.addEventListener("click", (e) => {
    e.preventDefault();
    const targetId = link.getAttribute("href").substring(1);
    const targetSection = document.getElementById(targetId);
    if (targetSection) {
      targetSection.scrollIntoView({ behavior: "smooth" });
    }
  });
});
