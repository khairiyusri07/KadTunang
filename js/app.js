// =======================================================
// Jemputan Digital - Adam & Hawa (FLO092) Application Logic
// =======================================================

document.addEventListener('DOMContentLoaded', () => {
  const data = INVITATION_DATA.order;

  // Audio state
  let isPlaying = false;
  let bgAudio = null;
  let ytPlayer = null;

  // Initialize UI elements
  initOpening();
  initCountdown();
  initAttendanceAndWishes();
  initModals();
  initMusic();
  initCalendar();
  initParticles();
  initScrollAnimations();
  initAutoScroll();

  // 1. OPENING SEQUENCE WITH SEAL SPARKLE BURST & 3D REVEAL
  function initOpening() {
    const seal = document.getElementById('seal-anchor');
    const envelopeStage = document.getElementById('envelope-stage');
    const envelope = document.getElementById('envelope');
    const coverEnvelope = document.getElementById('cover_envelope');
    const cardContent = document.getElementById('card-content');
    const floatingMusicBtn = document.getElementById('floating-music-btn');

    if (!seal) return;

    seal.addEventListener('click', (e) => {
      // 1. Trigger magical sparkle burst from wax seal
      const rect = seal.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      createSealSparkleBurst(centerX, centerY);

      // 2. Play romantic background melody
      startMusic();

      // Show floating music toggle button
      if (floatingMusicBtn) {
        floatingMusicBtn.classList.add('visible');
      }

      // 3. Smooth opening
      if (coverEnvelope) {
        coverEnvelope.classList.add('open');
      }

      // 4. Slide envelope downward
      setTimeout(() => {
        envelope.classList.add('open');
      }, 500);

      // 5. Reveal invitation card with upward rising elevation
      setTimeout(() => {
        envelopeStage.classList.add('stage-hidden');
        cardContent.classList.add('revealed');
        window.scrollTo({ top: 0, behavior: 'smooth' });

        // Pause for 4 seconds on cover, then gently auto-scroll
        startAutoScroll(4000);
      }, 1300);
    });

    const scrollPrompt = document.getElementById('cover-scroll-prompt');
    if (scrollPrompt) {
      scrollPrompt.addEventListener('click', () => {
        const details = document.getElementById('invite-details');
        if (details) {
          details.scrollIntoView({ behavior: 'smooth' });
        }
      });
    }
  }

  // Radial Gold & Rose Petal Sparkle Burst on Wax Seal Tap
  function createSealSparkleBurst(x, y) {
    const count = 28;
    for (let i = 0; i < count; i++) {
      const p = document.createElement('div');
      p.className = 'seal-burst-particle';
      const angle = (Math.PI * 2 * i) / count + (Math.random() * 0.3 - 0.15);
      const distance = Math.random() * 95 + 45;
      const dx = Math.cos(angle) * distance;
      const dy = Math.sin(angle) * distance;

      p.style.setProperty('--dx', `${dx}px`);
      p.style.setProperty('--dy', `${dy}px`);
      p.style.left = `${x}px`;
      p.style.top = `${y}px`;

      const size = Math.random() * 7 + 4;
      p.style.width = `${size}px`;
      p.style.height = `${size}px`;

      if (i % 2 === 0) {
        p.style.background = 'radial-gradient(circle, #fffdf2 0%, #fae29c 50%, #cba358 100%)';
        p.style.boxShadow = '0 0 10px #cba358';
      } else {
        p.style.background = 'radial-gradient(circle, #ffe7ec 0%, #f7aab8 60%, #e27d92 100%)';
        p.style.boxShadow = '0 0 8px #f7aab8';
      }

      document.body.appendChild(p);
      setTimeout(() => p.remove(), 1250);
    }
  }

  // 2. MUSIC PLAYER (assets/atasrestu.mp3)
  function initMusic() {
    bgAudio = document.getElementById('bg-audio');
    if (!bgAudio) {
      bgAudio = new Audio('assets/atasrestu.mp3');
      bgAudio.id = 'bg-audio';
      bgAudio.loop = true;
      document.body.appendChild(bgAudio);
    } else {
      bgAudio.src = 'assets/atasrestu.mp3';
    }
    bgAudio.loop = true;
    bgAudio.volume = 0.85;

    const musicBtn = document.getElementById('floating-music-btn');
    const musicPlayBtn = document.getElementById('btn-play-music');
    const disc = document.getElementById('music-disc');
    const soundwaves = document.querySelectorAll('.soundwave-bar');

    function updatePlayState(playing) {
      isPlaying = playing;
      if (musicBtn) {
        if (playing) musicBtn.classList.add('playing');
        else musicBtn.classList.remove('playing');
      }
      if (disc) {
        if (playing) disc.classList.add('rotating');
        else disc.classList.remove('rotating');
      }
      soundwaves.forEach(b => b.style.animationPlayState = playing ? 'running' : 'paused');
      if (musicPlayBtn) {
        musicPlayBtn.innerHTML = playing ? '&#10074;&#10074;' : '&#9654;';
      }
    }

    window.startMusic = function () {
      if (!bgAudio) return;
      const playPromise = bgAudio.play();
      if (playPromise !== undefined) {
        playPromise.then(() => {
          updatePlayState(true);
        }).catch(err => {
          console.log('Audio playback prevented or error:', err);
        });
      }
    };

    window.toggleMusic = function () {
      if (!bgAudio) return;
      if (bgAudio.paused) {
        bgAudio.play().then(() => {
          updatePlayState(true);
        }).catch(err => console.log('Audio resume error:', err));
      } else {
        bgAudio.pause();
        updatePlayState(false);
      }
    };

    if (musicBtn) {
      musicBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        window.toggleMusic();
      });
    }

    if (musicPlayBtn) {
      musicPlayBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        window.toggleMusic();
      });
    }

    bgAudio.addEventListener('play', () => updatePlayState(true));
    bgAudio.addEventListener('pause', () => updatePlayState(false));
  }

  // 3. COUNTDOWN TIMER
  function initCountdown() {
    // Target date: 19 December 2026 3:00 PM
    const targetDate = new Date('2026-12-19T15:00:00+08:00').getTime();

    const daysEl = document.getElementById('count-days');
    const hoursEl = document.getElementById('count-hours');
    const minsEl = document.getElementById('count-mins');
    const secsEl = document.getElementById('count-secs');

    function update() {
      const now = new Date().getTime();
      let diff = targetDate - now;

      // If already passed in current year, calculate demonstration counter or celebrate
      if (diff < 0) {
        // Let's create an ongoing anniversary or upcoming countdown
        diff = Math.abs(diff) % (365 * 24 * 60 * 60 * 1000);
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      daysEl.textContent = String(days).padStart(2, '0');
      hoursEl.textContent = String(hours).padStart(2, '0');
      minsEl.textContent = String(minutes).padStart(2, '0');
      secsEl.textContent = String(seconds).padStart(2, '0');
    }

    update();
    setInterval(update, 1000);
  }

  // 4. ATTENDANCE & WISHES
  function initAttendanceAndWishes() {
    const attTotal = document.getElementById('att-total');
    const attAdults = document.getElementById('att-adults');
    const attKids = document.getElementById('att-kids');
    const wishesContainer = document.getElementById('wishes-list');

    if (!attTotal && !wishesContainer) return;

    const rawRsvps = data.rsvps || [];
    const savedRsvps = JSON.parse(localStorage.getItem('adam_hawa_rsvps') || '[]');
    const allRsvps = [...savedRsvps, ...rawRsvps];

    // Compute stats
    let totalPax = 0;
    let adultPax = 0;
    let kidPax = 0;

    allRsvps.forEach(r => {
      if (r.status === 'yes') {
        const pax = Number(r.pax) || 1;
        const kids = Number(r.pax_kid) || 0;
        totalPax += pax + kids;
        adultPax += pax;
        kidPax += kids;
      }
    });

    if (attTotal) attTotal.textContent = totalPax;
    if (attAdults) attAdults.textContent = adultPax;
    if (attKids) attKids.textContent = kidPax;

    // Render wishes
    if (wishesContainer) {
      renderWishes(allRsvps);
    }
  }

  function renderWishes(rsvps) {
    const wishesContainer = document.getElementById('wishes-list');
    if (!wishesContainer) return;
    wishesContainer.innerHTML = '';

    const validWishes = rsvps.filter(r => r.wish && r.wish.trim() !== '');

    validWishes.slice(0, 30).forEach(w => {
      const item = document.createElement('div');
      item.className = 'wish-item';

      let statusBadge = '';
      if (w.status === 'yes') {
        statusBadge = '<span class="wish-badge hadir">Hadir</span>';
      } else if (w.status === 'maybe') {
        statusBadge = '<span class="wish-badge mungkin">Mungkin</span>';
      } else if (w.status === 'no') {
        statusBadge = '<span class="wish-badge tidak-hadir">Tidak Hadir</span>';
      }

      const dateStr = w.created_at ? w.created_at.split(' ')[0] : 'Terkini';

      item.innerHTML = `
        <div class="wish-item-header">
          <span class="wish-author">${escapeHtml(w.name || 'Tetamu')}</span>
          <span class="wish-time">${dateStr}</span>
        </div>
        <div class="wish-text">${escapeHtml(w.wish)}</div>
        ${statusBadge}
      `;
      wishesContainer.appendChild(item);
    });
  }

  // 5. MODALS & POPUPS
  function initModals() {
    const backdrop = document.getElementById('popup-backdrop');
    const popups = document.querySelectorAll('.popup');

    window.openPopup = function (popupId) {
      stopAutoScroll();
      closeAllPopups();
      const target = document.getElementById(popupId);
      if (target) {
        target.classList.add('show');
        backdrop.classList.add('show');
      }
    };

    window.closeAllPopups = function () {
      popups.forEach(p => p.classList.remove('show'));
      backdrop.classList.remove('show');
    };

    backdrop.addEventListener('click', closeAllPopups);

    document.querySelectorAll('.popup-close-btn').forEach(btn => {
      btn.addEventListener('click', closeAllPopups);
    });

    // Bottom Navigation Bar click bindings
    document.querySelectorAll('.btn-footer').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const action = btn.getAttribute('data-popup');
        if (action) {
          openPopup(action);
        }
      });
    });

    // Gift tabs switching
    const tabSalam = document.getElementById('tab-salam');
    const tabWishlist = document.getElementById('tab-wishlist');
    const viewSalam = document.getElementById('view-salam');
    const viewWishlist = document.getElementById('view-wishlist');

    if (tabSalam && tabWishlist) {
      tabSalam.addEventListener('click', () => {
        tabSalam.classList.add('active');
        tabWishlist.classList.remove('active');
        viewSalam.style.display = 'block';
        viewWishlist.style.display = 'none';
      });

      tabWishlist.addEventListener('click', () => {
        tabWishlist.classList.add('active');
        tabSalam.classList.remove('active');
        viewSalam.style.display = 'none';
        viewWishlist.style.display = 'block';
      });
    }

    // Copy Account Numbers
    window.copyAccountNumber = function (text, bank) {
      navigator.clipboard.writeText(text).then(() => {
        showToast(`Nombor akaun ${bank} disalin: ${text}`);
      }).catch(() => {
        showToast(`Nombor: ${text}`);
      });
    };

    // RSVP Form submission (if present)
    const rsvpForm = document.getElementById('rsvp-form');
    if (rsvpForm) {
      let selectedStatus = 'yes';

      document.querySelectorAll('.rsvp-type-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          document.querySelectorAll('.rsvp-type-btn').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          selectedStatus = btn.getAttribute('data-status');
        });
      });

      rsvpForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('rsvp-name').value.trim();
        const phone = document.getElementById('rsvp-phone').value.trim();
        const pax = parseInt(document.getElementById('rsvp-pax').value) || 1;
        const kids = parseInt(document.getElementById('rsvp-kids').value) || 0;
        const slot = document.getElementById('rsvp-slot').value;
        const wish = document.getElementById('rsvp-wish').value.trim();

        if (!name) {
          showToast('Sila masukkan nama anda');
          return;
        }

        const newRsvp = {
          id: Date.now(),
          name,
          phone,
          pax,
          pax_kid: kids,
          slot,
          wish,
          status: selectedStatus,
          created_at: new Date().toISOString().split('T')[0]
        };

        const saved = JSON.parse(localStorage.getItem('adam_hawa_rsvps') || '[]');
        saved.unshift(newRsvp);
        localStorage.setItem('adam_hawa_rsvps', JSON.stringify(saved));

        // Re-render
        initAttendanceAndWishes();

        showToast('Terima kasih atas maklum balas RSVP anda!');
        rsvpForm.reset();
        closeAllPopups();
      });
    }
  }

  // 6. CALENDAR INTEGRATION
  function initCalendar() {
    const btnGoogle = document.getElementById('btn-add-google-cal');
    const btnIcs = document.getElementById('btn-add-ics-cal');

    const eventTitle = encodeURIComponent("Majlis Pertunangan Aisya & Khairi");
    const eventDetails = encodeURIComponent("Majlis Pertunangan Aisya & Khairi di RS Resort.");
    const eventLocation = encodeURIComponent("RS Resort");
    // 2026-12-19 3:00 PM - 6:00 PM (UTC+8) -> 20261219T070000Z / 20261219T100000Z
    const gCalUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${eventTitle}&dates=20261219T070000Z/20261219T100000Z&details=${eventDetails}&location=${eventLocation}`;

    btnGoogle.href = gCalUrl;

    btnIcs.addEventListener('click', (e) => {
      e.preventDefault();
      const icsData = [
        "BEGIN:VCALENDAR",
        "VERSION:2.0",
        "PRODID:-//Jemputan//Majlis Pertunangan//MY",
        "CALSCALE:GREGORIAN",
        "BEGIN:VEVENT",
        "DTSTART:20261219T070000Z",
        "DTEND:20261219T100000Z",
        "SUMMARY:Majlis Pertunangan Aisya & Khairi",
        "DESCRIPTION:Majlis Pertunangan Aisya & Khairi di RS Resort",
        "LOCATION:RS Resort",
        "STATUS:CONFIRMED",
        "END:VEVENT",
        "END:VCALENDAR"
      ].join("\r\n");

      const blob = new Blob([icsData], { type: "text/calendar;charset=utf-8" });
      const link = document.createElement("a");
      link.href = window.URL.createObjectURL(blob);
      link.setAttribute("download", "Majlis_Pertunangan_Aisya_Khairi.ics");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showToast("Jadual disimpan ke peranti!");
    });
  }

  // 7. PARTICLES (3D Falling Rose Petals & Twinkling Gold Sparkles)
  function initParticles() {
    const container = document.getElementById('particles-container');
    if (!container) return;
    container.innerHTML = '';

    const totalCount = 28;
    for (let i = 0; i < totalCount; i++) {
      const isPetal = i % 3 !== 0;
      const p = document.createElement('div');
      p.className = isPetal ? 'petal-particle' : 'sparkle-particle';

      const size = isPetal ? (Math.random() * 8 + 10) : (Math.random() * 5 + 3);
      p.style.width = `${size}px`;
      p.style.height = isPetal ? `${size * 1.3}px` : `${size}px`;
      p.style.left = `${Math.random() * 98}%`;

      const duration = isPetal ? (Math.random() * 6 + 7) : (Math.random() * 5 + 5);
      const delay = Math.random() * 8;
      const swayDuration = Math.random() * 3 + 2.5;

      p.style.animationDuration = `${duration}s, ${swayDuration}s`;
      p.style.animationDelay = `${delay}s, ${delay}s`;

      container.appendChild(p);
    }
  }

  // 8. SCROLL REVEAL ANIMATIONS FOR ELEGANT CARDS & TEXT
  function initScrollAnimations() {
    const targets = document.querySelectorAll(
      '.bismillah-text, .greeting-lead, .couple-box, .hashtag-box, .doa-card, .venue-card, .countdown-container, .cal-date-card, .contact-card'
    );

    if (!('IntersectionObserver' in window)) {
      targets.forEach(el => el.classList.add('in-view'));
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.12,
      rootMargin: '0px 0px -40px 0px'
    });

    targets.forEach((el, idx) => {
      el.classList.add('scroll-reveal');
      el.style.transitionDelay = `${(idx % 3) * 0.1}s`;
      observer.observe(el);
    });
  }

  // 9. AUTO SCROLL FUNCTIONALITY
  let autoScrollActive = false;
  let autoScrollTimeout = null;
  let autoScrollAnimId = null;

  function getScrollPos() {
    return window.scrollY || window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
  }

  function setScrollPos(pos) {
    window.scrollTo(0, pos);
    if (document.documentElement) document.documentElement.scrollTop = pos;
    if (document.body) document.body.scrollTop = pos;
  }

  function initAutoScroll() {
    // Pengguna skrol secara manual (wheel, drag touch, atau kekunci panah) untuk henti auto scroll
    const stopEvents = ['wheel', 'touchmove'];
    stopEvents.forEach(evt => {
      window.addEventListener(evt, () => {
        if (autoScrollActive || autoScrollTimeout) {
          stopAutoScroll();
        }
      }, { passive: true });
    });

    window.addEventListener('keydown', (e) => {
      if (['ArrowDown', 'ArrowUp', 'PageDown', 'PageUp', 'Space', 'Home', 'End'].includes(e.code)) {
        if (autoScrollActive || autoScrollTimeout) {
          stopAutoScroll();
        }
      }
    }, { passive: true });
  }

  function startAutoScroll(delayMs = 4000) {
    stopAutoScroll();

    // Statik dulu dalam 4 saat sebelum mula skrol
    autoScrollTimeout = setTimeout(() => {
      autoScrollActive = true;
      let lastTimestamp = null;
      let fractionalScrollY = getScrollPos();

      // Kelajuan lancar & perlahan (~42px sesaat)
      const scrollSpeed = 42;

      function step(timestamp) {
        if (!autoScrollActive) return;

        if (!lastTimestamp) {
          lastTimestamp = timestamp;
          fractionalScrollY = getScrollPos();
        }

        const delta = Math.min(timestamp - lastTimestamp, 100) / 1000;
        lastTimestamp = timestamp;

        fractionalScrollY += scrollSpeed * delta;
        setScrollPos(fractionalScrollY);

        const maxScroll = Math.max(
          document.body.scrollHeight,
          document.documentElement.scrollHeight
        ) - window.innerHeight;

        // Berhenti jika sudah sampai penghujung halaman
        if (maxScroll > 10 && getScrollPos() >= maxScroll - 5) {
          stopAutoScroll();
          return;
        }

        autoScrollAnimId = requestAnimationFrame(step);
      }

      autoScrollAnimId = requestAnimationFrame(step);
    }, delayMs);
  }

  function stopAutoScroll() {
    if (autoScrollTimeout) {
      clearTimeout(autoScrollTimeout);
      autoScrollTimeout = null;
    }
    if (autoScrollAnimId) {
      cancelAnimationFrame(autoScrollAnimId);
      autoScrollAnimId = null;
    }
    autoScrollActive = false;
  }

  // Toast Helper
  function showToast(msg) {
    let toast = document.getElementById('toast-notice');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'toast-notice';
      toast.className = 'toast-notice';
      document.body.appendChild(toast);
    }
    toast.textContent = msg;
    toast.classList.add('show');
    setTimeout(() => {
      toast.classList.remove('show');
    }, 2800);
  }

  function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>"']/g, m => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    })[m]);
  }
});
