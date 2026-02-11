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
      entry.target.style.animation = "fadeIn 0.8s ease forwards";
    }
  });
}, observerOptions);

document.querySelectorAll(".content").forEach((content) => {
  observer.observe(content);
});
