/* =========================================================
   Alya Al — Portfolio scripts
   Vanilla JS only. Handles: theme toggle (with saved preference),
   mobile nav, sticky-nav styling, and scroll-reveal animations.
   ========================================================= */

(function () {
  "use strict";

  /* ---------- 1. Theme toggle ---------- */
  // Remembers the visitor's choice; falls back to their OS preference.
  var root = document.documentElement;
  var toggle = document.getElementById("themeToggle");
  var STORAGE_KEY = "alya-theme";

  function applyTheme(theme) {
    root.setAttribute("data-theme", theme);
  }

  // Initial theme: saved choice > system preference > dark
  var saved = null;
  try { saved = localStorage.getItem(STORAGE_KEY); } catch (e) {}
  if (saved) {
    applyTheme(saved);
  } else if (window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches) {
    applyTheme("light");
  } else {
    applyTheme("dark");
  }

  if (toggle) {
    toggle.addEventListener("click", function () {
      var next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
      applyTheme(next);
      try { localStorage.setItem(STORAGE_KEY, next); } catch (e) {}
    });
  }

  /* ---------- 2. Mobile navigation ---------- */
  var burger = document.getElementById("navBurger");
  var navLinks = document.getElementById("navLinks");

  function closeMenu() {
    if (!navLinks || !burger) return;
    navLinks.classList.remove("is-open");
    burger.classList.remove("is-open");
    burger.setAttribute("aria-expanded", "false");
  }

  if (burger && navLinks) {
    burger.addEventListener("click", function () {
      var open = navLinks.classList.toggle("is-open");
      burger.classList.toggle("is-open", open);
      burger.setAttribute("aria-expanded", String(open));
    });
    // Close the menu after tapping a link
    navLinks.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", closeMenu);
    });
  }

  /* ---------- 3. Sticky navbar styling on scroll ---------- */
  var nav = document.getElementById("nav");
  function onScroll() {
    if (!nav) return;
    nav.classList.toggle("is-scrolled", window.scrollY > 20);
  }
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  /* ---------- 4. Scroll-reveal animations ---------- */
  // Uses IntersectionObserver; respects reduced-motion preferences.
  var revealEls = document.querySelectorAll(".reveal");
  var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (reduceMotion || !("IntersectionObserver" in window)) {
    revealEls.forEach(function (el) { el.classList.add("is-visible"); });
  } else {
    var observer = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });

    // Stagger items inside the same container for a nicer cascade
    revealEls.forEach(function (el, i) {
      el.style.transitionDelay = (i % 6) * 60 + "ms";
      observer.observe(el);
    });
  }

  /* ---------- 5. Projects: search, filter & carousel ---------- */
  var track = document.getElementById("projTrack");
  if (track) {
    var cards = Array.prototype.slice.call(track.querySelectorAll(".project"));
    var searchInput = document.getElementById("projSearch");
    var filterBar = document.getElementById("projFilters");
    var countEl = document.getElementById("projCount");
    var emptyEl = document.getElementById("projEmpty");
    var activeFilter = "all";

    function applyFilters() {
      var q = (searchInput ? searchInput.value : "").trim().toLowerCase();
      var shown = 0;

      cards.forEach(function (card) {
        var tags = (card.getAttribute("data-tags") || "").toLowerCase();
        var text = card.textContent.toLowerCase();
        var matchTag = activeFilter === "all" || tags.indexOf(activeFilter.toLowerCase()) !== -1;
        var matchText = !q || text.indexOf(q) !== -1;
        var visible = matchTag && matchText;

        if (visible) {
          card.hidden = false;
          // next frame removes the hidden class so the fade-in animates
          requestAnimationFrame(function () { card.classList.remove("is-hidden"); });
          shown++;
        } else {
          card.classList.add("is-hidden");
          // hide after the fade so layout collapses
          setTimeout(function () { if (card.classList.contains("is-hidden")) card.hidden = true; }, 320);
        }
      });

      if (countEl) countEl.textContent = shown;
      if (emptyEl) emptyEl.hidden = shown !== 0;
      updateArrows();
    }

    // Filter pills
    if (filterBar) {
      filterBar.addEventListener("click", function (e) {
        var btn = e.target.closest(".pill");
        if (!btn) return;
        filterBar.querySelectorAll(".pill").forEach(function (p) { p.classList.remove("is-active"); });
        btn.classList.add("is-active");
        activeFilter = btn.getAttribute("data-filter");
        track.scrollTo({ left: 0, behavior: "smooth" });
        applyFilters();
      });
    }

    // Live search (debounced)
    if (searchInput) {
      var t;
      searchInput.addEventListener("input", function () {
        clearTimeout(t);
        t = setTimeout(applyFilters, 120);
      });
    }

    // Carousel arrows
    var prev = document.getElementById("projPrev");
    var next = document.getElementById("projNext");
    function scrollAmount() {
      var first = cards.find(function (c) { return !c.hidden; });
      return first ? first.getBoundingClientRect().width + 22 : 360;
    }
    function updateArrows() {
      if (!prev || !next) return;
      var maxScroll = track.scrollWidth - track.clientWidth - 2;
      prev.disabled = track.scrollLeft <= 2;
      next.disabled = track.scrollLeft >= maxScroll || maxScroll <= 0;
    }
    if (prev) prev.addEventListener("click", function () { track.scrollBy({ left: -scrollAmount(), behavior: "smooth" }); });
    if (next) next.addEventListener("click", function () { track.scrollBy({ left: scrollAmount(), behavior: "smooth" }); });
    track.addEventListener("scroll", updateArrows, { passive: true });
    window.addEventListener("resize", updateArrows);

    applyFilters();
  }

  /* ---------- 6. Footer year ---------- */
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();
})();
