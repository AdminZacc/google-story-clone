// Performance-optimized script with cleaned up architecture
document.addEventListener("DOMContentLoaded", () => {
  // ============================================================================
  // CONFIGURATION & DOM CACHING
  // ============================================================================
  
  const DOM = {
    body: document.body,
    themeToggle: document.getElementById("themeToggle"),
    a11yToggle: document.getElementById("a11yToggle"),
    a11yPanel: document.getElementById("a11yPanel"),
    progressBar: document.querySelector(".progress-bar"),
    nav: document.querySelector(".nav"),
    story: document.getElementById("story"),
    sections: Array.from(document.querySelectorAll(".story-section[id]")),
    contentBlocks: Array.from(document.querySelectorAll(".content"))
  };

  const config = {
    reduceMotion: window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    observerThreshold: 0.3,
    synth: window.speechSynthesis
  };

  // ============================================================================
  // THEME TOGGLE
  // ============================================================================
  
  function initTheme() {
    if (!DOM.themeToggle) return;
    
    const savedTheme = localStorage.getItem("theme") || "dark";
    if (savedTheme === "light") {
      DOM.body.classList.add("light-mode");
      DOM.themeToggle.setAttribute("aria-pressed", "true");
    }

    DOM.themeToggle.addEventListener("click", () => {
      const isLight = DOM.body.classList.toggle("light-mode");
      localStorage.setItem("theme", isLight ? "light" : "dark");
      DOM.themeToggle.setAttribute("aria-pressed", isLight);
    });

    if (!localStorage.getItem("theme")) {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      if (!prefersDark) {
        DOM.body.classList.add("light-mode");
        DOM.themeToggle.setAttribute("aria-pressed", "true");
      }
    }
  }

  // ============================================================================
  // ACCESSIBILITY PANEL
  // ============================================================================
  
  function initA11yPanel() {
    if (!DOM.a11yToggle || !DOM.a11yPanel) return;

    const setA11yPanel = (open) => {
      DOM.a11yPanel.toggleAttribute("hidden", !open);
      DOM.a11yPanel.classList.toggle("is-open", open);
      DOM.a11yToggle.setAttribute("aria-expanded", open);
      if (open) {
        DOM.a11yPanel.focus();
        announceToScreenReader("Accessibility highlights opened");
      }
    };

    DOM.a11yToggle.addEventListener("click", () => {
      const isOpen = DOM.a11yToggle.getAttribute("aria-expanded") === "true";
      setA11yPanel(!isOpen);
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && DOM.a11yToggle.getAttribute("aria-expanded") === "true") {
        setA11yPanel(false);
        DOM.a11yToggle.focus();
      }

      const isTextField = ["INPUT", "TEXTAREA", "SELECT"].includes(document.activeElement?.tagName);
      if (!isTextField && e.key === "/" && !e.ctrlKey && !e.metaKey && !e.altKey && !e.shiftKey) {
        e.preventDefault();
        setA11yPanel(true);
      }
    });

    document.addEventListener("click", (e) => {
      const isOpen = DOM.a11yToggle.getAttribute("aria-expanded") === "true";
      if (isOpen && !DOM.a11yPanel.contains(e.target) && e.target !== DOM.a11yToggle) {
        setA11yPanel(false);
      }
    });
  }

  // ============================================================================
  // BACKGROUND IMAGES & TEXT-TO-SPEECH
  // ============================================================================
  
  function initBackgroundsAndAudio() {
    let activeUtterance = null;
    let activeButton = null;

    const stopSpeech = () => {
      if (config.synth && (config.synth.speaking || config.synth.pending)) {
        config.synth.cancel();
      }
      if (activeButton) {
        activeButton.classList.remove("is-playing");
        activeButton.setAttribute("aria-pressed", "false");
        activeButton.textContent = "Listen";
      }
      activeButton = null;
      activeUtterance = null;
    };

    const getSectionText = (section) => {
      const paragraphs = section.querySelectorAll(".content-text p");
      return Array.from(paragraphs)
        .map((p) => p.textContent.trim())
        .filter(Boolean)
        .join(" ");
    };

    DOM.sections.forEach((section) => {
      const contentText = section.querySelector(".content-text");
      if (!contentText) return;

      const name = section.querySelector("h2")?.textContent?.trim() || "section";
      const button = document.createElement("button");
      button.type = "button";
      button.className = "audio-btn";
      button.textContent = "Listen";
      button.setAttribute("aria-pressed", "false");
      button.setAttribute("aria-label", `Listen to ${name}`);

      if (!config.synth || typeof SpeechSynthesisUtterance === "undefined") {
        button.disabled = true;
        button.textContent = "Audio unavailable";
      } else {
        button.addEventListener("click", () => {
          const isPlaying = button.classList.contains("is-playing");
          if (isPlaying) {
            stopSpeech();
            return;
          }

          stopSpeech();
          const text = getSectionText(section);
          if (!text) return;

          const utterance = new SpeechSynthesisUtterance(text);
          utterance.onend = () => stopSpeech();
          utterance.onerror = () => stopSpeech();

          activeUtterance = utterance;
          activeButton = button;
          button.classList.add("is-playing");
          button.setAttribute("aria-pressed", "true");
          button.textContent = "Stop";
          config.synth.speak(utterance);
        });
      }

      contentText.appendChild(button);
    });
  }

  // ============================================================================
  // QUIZ INITIALIZATION
  // ============================================================================

  function initQuiz() {
    const quizContainer = document.querySelector(".quiz");
    if (!quizContainer) return;

    const quizItems = Array.from(document.querySelectorAll(".quiz-item"));
    const submitBtn = quizContainer.querySelector(".quiz-submit");
    const scoreDisplay = quizContainer.querySelector(".quiz-score");
    const scoreValue = quizContainer.querySelector(".score-value");

    // Add change listeners to all radio buttons
    quizItems.forEach((item) => {
      const radios = item.querySelectorAll("input[type='radio']");
      radios.forEach((radio) => {
        radio.addEventListener("change", () => {
          const answer = item.dataset.answer;
          const selected = item.querySelector("input[type='radio']:checked");
          const feedback = item.querySelector(".quiz-feedback");

          if (selected && feedback) {
            const isCorrect = selected.value === answer;
            feedback.textContent = isCorrect
              ? "✓ Correct answer!"
              : "✗ Incorrect. Try again or check another answer.";
            feedback.className = `quiz-feedback ${isCorrect ? "correct" : "incorrect"}`;
            item.classList.toggle("correct", isCorrect);
            item.classList.toggle("incorrect", !isCorrect);
          }
        });
      });
    });

    // Handle submit button
    if (submitBtn) {
      submitBtn.addEventListener("click", () => {
        let correct = 0;
        let answered = 0;

        quizItems.forEach((item) => {
          const answer = item.dataset.answer;
          const selected = item.querySelector("input[type='radio']:checked");

          if (selected) {
            answered += 1;
            if (selected.value === answer) {
              correct += 1;
            }
          }
        });

        scoreValue.textContent = correct;
        scoreDisplay.removeAttribute("hidden");
        announceToScreenReader(`Quiz submitted. Your score is ${correct} out of ${quizItems.length}`);
      });
    }
  }

  // ============================================================================
  // INTERSECTION OBSERVER FOR ANIMATIONS
  // ============================================================================
  
  function initObserver() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          const heading = entry.target.querySelector("h2");
          if (heading) {
            announceToScreenReader(`${heading.textContent} section loaded`);
          }
        }
      });
    }, { threshold: config.observerThreshold, rootMargin: "0px" });

    DOM.contentBlocks.forEach((block) => observer.observe(block));
  }

  // ============================================================================
  // SCROLL & PARALLAX (Optimized with RAF)
  // ============================================================================
  
  function initScroll() {
    let latestScroll = 0;
    let ticking = false;

    const updateScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollProgress = (latestScroll / totalHeight) * 100;

      if (!config.reduceMotion) {
        DOM.sections.forEach((section) => {
          const sectionOffset = section.offsetTop;
          const parallaxOffset = (latestScroll - sectionOffset) * 0.25;
          section.style.backgroundPosition = `center calc(50% + ${parallaxOffset}px)`;
        });
      }

      if (DOM.progressBar) {
        DOM.progressBar.style.width = scrollProgress + "%";
        DOM.progressBar.setAttribute("aria-valuenow", Math.round(scrollProgress));
      }

      updateActiveNavLink();
      ticking = false;
    };

    window.addEventListener("scroll", () => {
      latestScroll = window.scrollY;
      if (!ticking) {
        window.requestAnimationFrame(updateScroll);
        ticking = true;
      }
    }, { passive: true });
  }

  // ============================================================================
  // NAVIGATION
  // ============================================================================
  
  function updateActiveNavLink() {
    let currentSection = "";
    DOM.sections.forEach((section) => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.clientHeight;
      if (window.scrollY >= sectionTop - sectionHeight / 3) {
        currentSection = section.getAttribute("id");
      }
    });

    const navLinks = document.querySelectorAll(".nav a");
    navLinks.forEach((link) => {
      const href = link.getAttribute("href").substring(1);
      const isActive = href === currentSection;
      link.classList.toggle("active", isActive);
      link.setAttribute("aria-current", isActive ? "page" : "false");
    });
  }

  function initNavigation() {
    const navLinks = Array.from(document.querySelectorAll(".nav a"));

    navLinks.forEach((link) => {
      link.addEventListener("click", (e) => {
        e.preventDefault();
        const targetId = link.getAttribute("href").substring(1);
        const targetSection = document.getElementById(targetId);
        if (targetSection) {
          targetSection.scrollIntoView({ behavior: "smooth" });
          announceToScreenReader(`Navigated to ${link.getAttribute("aria-label")}`);
        }
      });
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "ArrowRight" || e.key === "ArrowDown" || e.key === "ArrowLeft" || e.key === "ArrowUp") {
        const activeLink = document.querySelector(".nav a.active");
        const currentIndex = navLinks.findIndex(link => link === activeLink);
        let nextIndex = currentIndex;

        if (e.key === "ArrowRight" || e.key === "ArrowDown") {
          nextIndex = Math.min(currentIndex + 1, navLinks.length - 1);
        } else {
          nextIndex = Math.max(currentIndex - 1, 0);
        }

        if (nextIndex !== currentIndex) {
          navLinks[nextIndex].click();
          navLinks[nextIndex].focus();
        }
      }
    });
  }

  // ============================================================================
  // ACCESSIBILITY UTILITIES
  // ============================================================================
  
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

  function initImages() {
    document.querySelectorAll("img").forEach((img) => {
      if (!img.hasAttribute("loading")) img.setAttribute("loading", "lazy");
      img.decoding = "async";
    });
  }

  function postHeight() {
    if (window.parent === window) return;
    const height = document.documentElement.scrollHeight;
    window.parent.postMessage({ type: "storyHeight", height }, "*");
  }

  // ============================================================================
  // INITIALIZATION
  // ============================================================================
  
  initTheme();
  initA11yPanel();
  initBackgroundsAndAudio();
  initQuiz();
  initObserver();
  initScroll();
  initNavigation();
  initImages();
  postHeight();

  window.addEventListener("load", postHeight);
  window.addEventListener("resize", postHeight);
});
