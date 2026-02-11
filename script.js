// Wait for DOM to be fully loaded before running any code
document.addEventListener("DOMContentLoaded", () => {
  // Theme toggle functionality
  const themeToggle = document.getElementById("themeToggle");
  const body = document.body;
  const a11yToggle = document.getElementById("a11yToggle");
  const a11yPanel = document.getElementById("a11yPanel");
  
  if (themeToggle) {
    console.log("Theme toggle found, initializing...");
    
    // Check for saved theme preference or default to dark mode
    const savedTheme = localStorage.getItem("theme") || "dark";
    if (savedTheme === "light") {
      body.classList.add("light-mode");
      themeToggle.setAttribute("aria-pressed", "true");
      console.log("Light mode applied from localStorage");
    }

    // Theme toggle event listener
    themeToggle.addEventListener("click", () => {
      console.log("Theme toggle clicked!");
      const isLightMode = body.classList.toggle("light-mode");
      localStorage.setItem("theme", isLightMode ? "light" : "dark");
      themeToggle.setAttribute("aria-pressed", isLightMode);
      console.log("Theme changed to:", isLightMode ? "light" : "dark");
    });

    // Respect system preference if no saved preference
    if (!localStorage.getItem("theme")) {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      if (!prefersDark) {
        body.classList.add("light-mode");
        themeToggle.setAttribute("aria-pressed", "true");
        console.log("System prefers light mode, applying it");
      }
    }
  } else {
    console.error("Theme toggle button not found!");
  }

  // Accessibility highlights toggle
  const setA11yPanel = (open) => {
    if (!a11yToggle || !a11yPanel) return;
    a11yPanel.toggleAttribute("hidden", !open);
    a11yPanel.classList.toggle("is-open", open);
    a11yToggle.setAttribute("aria-expanded", open);
    if (open) {
      a11yPanel.focus();
      announceToScreenReader("Accessibility highlights opened");
    }
  };

  if (a11yToggle && a11yPanel) {
    a11yToggle.addEventListener("click", () => {
      const isOpen = a11yToggle.getAttribute("aria-expanded") === "true";
      setA11yPanel(!isOpen);
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && a11yToggle.getAttribute("aria-expanded") === "true") {
        setA11yPanel(false);
        a11yToggle.focus();
      }

      // Global shortcut: '/' opens the accessibility highlights panel
      const activeTag = document.activeElement?.tagName;
      const isTextField = activeTag === "INPUT" || activeTag === "TEXTAREA" || activeTag === "SELECT";
      if (!isTextField && e.key === "/" && !e.ctrlKey && !e.metaKey && !e.altKey && !e.shiftKey) {
        e.preventDefault();
        setA11yPanel(true);
      }
    });

    document.addEventListener("click", (e) => {
      const isOpen = a11yToggle.getAttribute("aria-expanded") === "true";
      if (!isOpen) return;
      if (!a11yPanel.contains(e.target) && e.target !== a11yToggle) {
        setA11yPanel(false);
      }
    });
  }

  // Set background images from data attributes
  document.querySelectorAll(".story-section").forEach((section) => {
    const bg = section.getAttribute("data-bg");
    if (bg) {
      section.style.backgroundImage = `url(${bg})`;
    }
  });

  // Add text-to-speech buttons per section
  const synth = window.speechSynthesis;
  let activeUtterance = null;
  let activeButton = null;

  const stopSpeech = () => {
    if (synth && (synth.speaking || synth.pending)) {
      synth.cancel();
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

  document.querySelectorAll(".story-section").forEach((section) => {
    const contentText = section.querySelector(".content-text");
    if (!contentText) return;

    const name = section.querySelector("h2")?.textContent?.trim() || "this section";
    const button = document.createElement("button");
    button.type = "button";
    button.className = "audio-btn";
    button.textContent = "Listen";
    button.setAttribute("aria-pressed", "false");
    button.setAttribute("aria-label", `Play audio for ${name}`);

    if (!synth || typeof SpeechSynthesisUtterance === "undefined") {
      button.disabled = true;
      button.textContent = "Audio unavailable";
      button.setAttribute("aria-label", `Audio unavailable for ${name}`);
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
        synth.speak(utterance);
      });
    }

    contentText.appendChild(button);
  });

  // Knowledge check quiz
  const quizContainer = document.querySelector(".quiz");
  const quizItems = [
    {
      question: "Who invented the laserphaco probe used in cataract removal?",
      options: ["Dr. Patricia Bath", "Dr. Charles Drew", "Vivien Thomas"],
      answer: "Dr. Patricia Bath",
      reminder: "Dr. Patricia Bath pioneered community ophthalmology and invented the laserphaco probe."
    },
    {
      question: "Which inventor improved the pacemaker control unit?",
      options: ["Otis Boykin", "James McCune Smith", "Dr. Percy Julian"],
      answer: "Otis Boykin",
      reminder: "Otis Boykin patented devices that improved pacemaker reliability."
    },
    {
      question: "Who helped develop the Moderna COVID-19 vaccine?",
      options: ["Dr. Kizzmekia S. Corbett-Helaire", "Dr. Rebecca Lee Crumpler", "Dr. Joycelyn Elders"],
      answer: "Dr. Kizzmekia S. Corbett-Helaire",
      reminder: "Dr. Corbett-Helaire led NIH research that helped create mRNA-1273."
    },
    {
      question: "Who is known as the " + '"Father of the Blood Bank"' + "?",
      options: ["Dr. Charles Drew", "Dr. Daniel Hale Williams", "Dr. Miles V. Lynk"],
      answer: "Dr. Charles Drew",
      reminder: "Dr. Drew revolutionized blood plasma preservation and large-scale blood banks."
    },
    {
      question: "Who was the first African American Surgeon General?",
      options: ["Dr. Joycelyn Elders", "Dr. Rebecca Lee Crumpler", "Vivien Thomas"],
      answer: "Dr. Joycelyn Elders",
      reminder: "Dr. Elders served as the 15th Surgeon General and advanced public health education."
    },
    {
      question: "Which physician performed early successful open-heart surgery and founded Provident Hospital?",
      options: ["Dr. Daniel Hale Williams", "Dr. Percy Julian", "Dr. Miles V. Lynk"],
      answer: "Dr. Daniel Hale Williams",
      reminder: "Dr. Williams pioneered open-heart surgery and established Provident Hospital."
    },
    {
      question: "Who advanced synthetic cortisone production for arthritis treatment?",
      options: ["Dr. Percy Julian", "Otis Boykin", "Dr. Charles Drew"],
      answer: "Dr. Percy Julian",
      reminder: "Dr. Julian synthesized medicinal compounds that expanded access to cortisone."
    },
    {
      question: "Who was the first African American woman to earn a medical degree in the U.S.?",
      options: ["Dr. Rebecca Lee Crumpler", "Dr. Joycelyn Elders", "Dr. Patricia Bath"],
      answer: "Dr. Rebecca Lee Crumpler",
      reminder: "Dr. Crumpler earned her degree in 1864 and cared for women and children."
    },
    {
      question: "Who was the first Black physician in the U.S. with a medical degree?",
      options: ["James McCune Smith", "Dr. Miles V. Lynk", "Vivien Thomas"],
      answer: "James McCune Smith",
      reminder: "James McCune Smith earned his degree in Glasgow and practiced in New York."
    },
    {
      question: "Who helped pioneer surgical techniques for congenital heart conditions?",
      options: ["Vivien Thomas", "Dr. Kizzmekia S. Corbett-Helaire", "Dr. Daniel Hale Williams"],
      answer: "Vivien Thomas",
      reminder: "Vivien Thomas developed tools and techniques that advanced heart surgery."
    },
    {
      question: "Who co-founded the National Medical Association and published an early Black medical journal?",
      options: ["Dr. Miles V. Lynk", "Dr. Patricia Bath", "Dr. Charles Drew"],
      answer: "Dr. Miles V. Lynk",
      reminder: "Dr. Lynk launched The Medical and Surgical Observer and co-founded the NMA."
    }
  ];

  if (quizContainer) {
    const scoreSummary = document.createElement("div");
    scoreSummary.className = "quiz-summary";
    scoreSummary.setAttribute("role", "status");
    scoreSummary.textContent = `Score: 0 / ${quizItems.length} · Answered: 0 / ${quizItems.length}`;
    quizContainer.appendChild(scoreSummary);

    const updateScore = () => {
      let correct = 0;
      let answered = 0;
      quizItems.forEach((item, index) => {
        const selected = document.querySelector(`input[name='quiz-${index}']:checked`);
        if (selected && selected.value === item.answer) {
          correct += 1;
        }
        if (selected) {
          answered += 1;
        }
      });
      scoreSummary.textContent = `Score: ${correct} / ${quizItems.length} · Answered: ${answered} / ${quizItems.length}`;
    };

    quizItems.forEach((item, index) => {
      const quizItem = document.createElement("div");
      quizItem.className = "quiz-item";

      const question = document.createElement("p");
      question.className = "quiz-question";
      question.textContent = `${index + 1}. ${item.question}`;

      const options = document.createElement("div");
      options.className = "quiz-options";

      const feedback = document.createElement("div");
      feedback.className = "quiz-feedback";
      feedback.setAttribute("role", "status");

      item.options.forEach((option, optionIndex) => {
        const id = `quiz-${index}-option-${optionIndex}`;
        const label = document.createElement("label");

        const input = document.createElement("input");
        input.type = "radio";
        input.name = `quiz-${index}`;
        input.id = id;
        input.value = option;

        const text = document.createElement("span");
        text.textContent = option;

        input.addEventListener("change", () => {
          const isCorrect = option === item.answer;
          feedback.innerHTML = `${isCorrect ? "Correct" : "Not quite"}. ` +
            `<strong>Answer:</strong> ${item.answer}. ${item.reminder}`;
          updateScore();
        });

        label.appendChild(input);
        label.appendChild(text);
        options.appendChild(label);
      });

      quizItem.appendChild(question);
      quizItem.appendChild(options);
      quizItem.appendChild(feedback);
      quizContainer.appendChild(quizItem);
    });
  }

  // Progressive enhancement: lazy-load inline images
  document.querySelectorAll("img").forEach((img) => {
    if (!img.hasAttribute("loading")) img.setAttribute("loading", "lazy");
    img.decoding = "async";
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
        const heading = entry.target.querySelector("h2");
        if (heading) {
          announceToScreenReader(`${heading.textContent} section has loaded`);
        }
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

  // Parallax + progress with requestAnimationFrame for smoothness
  const sections = Array.from(document.querySelectorAll(".story-section"));
  const progressBar = document.querySelector(".progress-bar");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let latestScroll = 0;
  let ticking = false;

  const onScroll = () => {
    latestScroll = window.scrollY;
    if (!ticking) {
      window.requestAnimationFrame(() => {
        const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
        const scrollProgress = (latestScroll / totalHeight) * 100;

        if (!reduceMotion) {
          sections.forEach((section) => {
            const sectionOffset = section.offsetTop;
            const parallaxOffset = (latestScroll - sectionOffset) * 0.25;
            section.style.backgroundPosition = `center calc(50% + ${parallaxOffset}px)`;
          });
        }

        if (progressBar) {
          progressBar.style.width = scrollProgress + "%";
          progressBar.setAttribute("aria-valuenow", Math.round(scrollProgress));
        }

        updateActiveNavLink();
        ticking = false;
      });
      ticking = true;
    }
  };

  window.addEventListener("scroll", onScroll, { passive: true });

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

  // Post iframe height to parent for auto-resize embeds
  const postHeight = () => {
    if (window.parent === window) return;
    const height = document.documentElement.scrollHeight;
    window.parent.postMessage({ type: "storyHeight", height }, "*");
  };

  postHeight();
  window.addEventListener("load", postHeight);
  window.addEventListener("resize", postHeight);

  if ("ResizeObserver" in window) {
    const resizeObserver = new ResizeObserver(() => postHeight());
    resizeObserver.observe(document.body);
  }
});
