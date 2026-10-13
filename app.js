/**
 * BIRKENSTOCK MARKETING PRESENTATION APPLICATION ENGINE
 * Interactive 4 Ps & STP Showcase
 */

document.addEventListener('DOMContentLoaded', () => {

  // GitHub's standard file API is text-oriented, so the larger closing film
  // is stored as sequential base64 chunks and rebuilt only when the section is
  // opened. This keeps the repository portable while preserving the original
  // MP4 in the browser.
  const closingVideo = document.querySelector('#stp-closing-video video');
  const closingSource = closingVideo?.querySelector('source[data-chunked-src]');
  if (closingVideo && closingSource) {
    closingVideo.addEventListener('play', async () => {
      if (closingSource.src || closingVideo.dataset.ready) return;
      closingVideo.dataset.ready = 'loading';
      try {
        const parts = [];
        for (let index = 1; index <= 29; index += 1) {
          const response = await fetch(`${closingSource.dataset.chunkedSrc}.part${String(index).padStart(2, '0')}`);
          if (!response.ok) throw new Error(`Video chunk ${index} unavailable`);
          parts.push(await response.text());
        }
        const binary = atob(parts.join(''));
        const bytes = new Uint8Array(binary.length);
        for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index);
        closingSource.src = URL.createObjectURL(new Blob([bytes], { type: 'video/mp4' }));
        closingVideo.load();
        closingVideo.dataset.ready = 'true';
        await closingVideo.play();
      } catch (error) {
        closingVideo.dataset.ready = '';
        console.warn('Closing film could not be assembled from repository chunks.', error);
      }
    }, { once: true });
  }

  // Keep the muted hero film playing when a browser briefly suspends media
  // during page hydration or tab visibility changes. Do not fight a user's
  // explicit pause once they have interacted with the control.
  const heroVideo = document.querySelector('video[aria-label="Birkenstock promotional video"]');
  const heroSource = heroVideo?.querySelector('source[data-chunked-src]');
  if (heroVideo) {
    let heroWasInteractedWith = false;
    ['click', 'pointerdown', 'touchstart', 'keydown'].forEach(eventName => {
      heroVideo.addEventListener(eventName, () => { heroWasInteractedWith = true; }, { once: true });
    });
    const resumeHeroVideo = () => {
      if (!heroWasInteractedWith && document.visibilityState === 'visible' && heroVideo.paused) {
        heroVideo.play().catch(() => {});
      }
    };
    heroVideo.addEventListener('loadeddata', resumeHeroVideo, { once: true });
    heroVideo.addEventListener('canplay', resumeHeroVideo, { once: true });
    heroVideo.addEventListener('pause', () => {
      if (!heroWasInteractedWith && document.visibilityState === 'visible') {
        window.setTimeout(resumeHeroVideo, 120);
      }
    });
    document.addEventListener('visibilitychange', resumeHeroVideo);

    if (heroSource) {
      (async () => {
        try {
          const parts = [];
          for (let index = 1; index <= 9; index += 1) {
            const response = await fetch(`${heroSource.dataset.chunkedSrc}.part${String(index).padStart(2, '0')}`);
            if (!response.ok) throw new Error(`Promo video chunk ${index} unavailable`);
            parts.push(await response.text());
          }
          const binary = atob(parts.join(''));
          const bytes = new Uint8Array(binary.length);
          for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index);
          heroSource.src = URL.createObjectURL(new Blob([bytes], { type: 'video/mp4' }));
          heroVideo.load();
          heroVideo.addEventListener('loadeddata', resumeHeroVideo, { once: true });
        } catch (error) {
          console.warn('Promo video could not be assembled from repository chunks.', error);
        }
      })();
    }
  }

  /* -------------------------------------------------------------
     1. SCROLL PROGRESS BAR
     ------------------------------------------------------------- */
  const scrollProgress = document.getElementById('scroll-progress');
  
  function updateScrollProgress() {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    if (scrollHeight > 0) {
      const progressPercent = (scrollTop / scrollHeight) * 100;
      scrollProgress.style.width = `${progressPercent}%`;
    }
  }

  window.addEventListener('scroll', updateScrollProgress, { passive: true });
  updateScrollProgress();


  /* -------------------------------------------------------------
     2. NAVIGATION SCROLL SPY & SMOOTH SCROLLING
     ------------------------------------------------------------- */
  const sections = document.querySelectorAll('section[id]');
  const desktopNavLinks = document.querySelectorAll('#main-nav .nav-link');
  const mobileNavLinks = document.querySelectorAll('#mobile-nav-drawer .mobile-nav-link');

  function updateActiveNav() {
    const scrollPos = window.scrollY + 140; // Offset for sticky navbar

    sections.forEach(section => {
      const top = section.offsetTop;
      const height = section.offsetHeight;
      const id = section.getAttribute('id');

      if (scrollPos >= top && scrollPos < top + height) {
        desktopNavLinks.forEach(link => {
          if (link.getAttribute('data-section') === id) {
            link.classList.add('active-nav');
          } else {
            link.classList.remove('active-nav');
          }
        });

        mobileNavLinks.forEach(link => {
          if (link.getAttribute('data-section') === id) {
            link.classList.add('active-nav');
          } else {
            link.classList.remove('active-nav');
          }
        });
      }
    });
  }

  window.addEventListener('scroll', updateActiveNav, { passive: true });
  updateActiveNav();


  /* -------------------------------------------------------------
     3. MOBILE DRAWER MENU TOGGLE
     ------------------------------------------------------------- */
  const mobileToggle = document.getElementById('mobile-menu-toggle');
  const mobileDrawer = document.getElementById('mobile-nav-drawer');
  const menuIconOpen = document.getElementById('menu-icon-open');
  const menuIconClose = document.getElementById('menu-icon-close');

  function toggleMobileMenu() {
    const isHidden = mobileDrawer.classList.contains('hidden');
    if (isHidden) {
      mobileDrawer.classList.remove('hidden');
      menuIconOpen.classList.add('hidden');
      menuIconClose.classList.remove('hidden');
    } else {
      mobileDrawer.classList.add('hidden');
      menuIconOpen.classList.remove('hidden');
      menuIconClose.classList.add('hidden');
    }
  }

  if (mobileToggle) {
    mobileToggle.addEventListener('click', toggleMobileMenu);
  }

  // Close mobile drawer when clicking any mobile link
  mobileNavLinks.forEach(link => {
    link.addEventListener('click', () => {
      mobileDrawer.classList.add('hidden');
      menuIconOpen.classList.remove('hidden');
      menuIconClose.classList.add('hidden');
    });
  });


  /* -------------------------------------------------------------
     4. PRICE SECTION: COST-PER-WEAR CALCULATOR (in ₹ INR)
     ------------------------------------------------------------- */
  const priceSlider = document.getElementById('calc-price-slider');
  const yearsSlider = document.getElementById('calc-years-slider');
  const daysSlider = document.getElementById('calc-days-slider');
  const priceDisplay = document.getElementById('calc-price-display');
  const yearsDisplay = document.getElementById('calc-years-display');
  const daysDisplay = document.getElementById('calc-days-display');
  const calcResult = document.getElementById('calc-result');
  const fastFashionComparison = document.getElementById('calc-comparison-text');
  const calcSavings = document.getElementById('calc-savings-text');

  function updateCostPerWear() {
    if (!priceSlider || !yearsSlider || !daysSlider) return;
    const price = parseFloat(priceSlider.value);
    const years = parseFloat(yearsSlider.value);
    const days = parseFloat(daysSlider.value);

    priceDisplay.textContent = `₹${price.toLocaleString('en-IN')}`;
    yearsDisplay.textContent = `${years} Year${years > 1 ? 's' : ''}`;
    daysDisplay.textContent = `${days} Days / Year`;

    const totalWears = years * days;
    const costPerWear = (price / totalWears).toFixed(2);
    if (calcResult) {
      calcResult.textContent = `₹${costPerWear}`;
    }
    if (fastFashionComparison) {
      const ffCost = (2500 / 90).toFixed(2);
      fastFashionComparison.innerHTML = `At <strong>₹${costPerWear} per wear</strong>, Birkenstock provides sustained anatomical support. In comparison, a disposable ₹2,500 fast-fashion sandal worn for ~90 days before failure costs <strong>₹${ffCost} per wear</strong> with zero biomechanical benefits.`;
    }
    if (calcSavings) {
      const savings = (2500 / 90 - costPerWear).toFixed(2);
      calcSavings.textContent = savings > 0
        ? `You save ₹${savings} per comfortable day compared with the disposable alternative.`
        : `The premium is ₹${Math.abs(savings)} per day for longer-lasting anatomical support.`;
    }
  }

  if (priceSlider && yearsSlider && daysSlider) {
    priceSlider.addEventListener('input', updateCostPerWear);
    yearsSlider.addEventListener('input', updateCostPerWear);
    daysSlider.addEventListener('input', updateCostPerWear);
    updateCostPerWear();
  }

  /* -------------------------------------------------------------
     4B. PRODUCT COMPARISON TABLE FILTER
     ------------------------------------------------------------- */
  const productFilterBtns = document.querySelectorAll('.product-filter-btn');
  const comparisonRows = document.querySelectorAll('.comparison-row');

  productFilterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const filter = btn.getAttribute('data-filter');
      
      productFilterBtns.forEach(b => {
        b.classList.remove('bg-cork-700', 'text-white', 'shadow-sm');
        b.classList.add('bg-sand-100', 'text-espresso-700');
      });
      btn.classList.add('bg-cork-700', 'text-white', 'shadow-sm');
      btn.classList.remove('bg-sand-100', 'text-espresso-700');

      comparisonRows.forEach(row => {
        const rowCategory = row.getAttribute('data-product-category');
        if (filter === 'all' || rowCategory === filter) {
          row.classList.remove('hidden');
        } else {
          row.classList.add('hidden');
        }
      });
    });
  });


  /* -------------------------------------------------------------
     5. PLACE SECTION: INTERACTIVE CHANNEL FLOW
     ------------------------------------------------------------- */
  const channelButtons = document.querySelectorAll('.channel-flow-btn');
  const channelDetailPanel = document.getElementById('channel-detail-panel');

  const channelData = {
    dtc: {
      title: "Direct-to-Consumer (DTC) E-Commerce",
      margin: "Margin Control: ~100%",
      description: "Direct-to-consumer online store (Birkenstock.com) provides complete ownership of customer relationships, zero grey-market friction, full line availability, and highest margin capture.",
      control: "Highest",
      counterfeit: "Zero",
      customerData: "1st Party Owned",
      pricing: "Guaranteed Full MSRP"
    },
    flagship: {
      title: "Physical Brand Flagships",
      margin: "Experience: Ultra-Premium",
      description: "Sensory retail spaces in prime cultural fashion capitals (SoHo, Marais, Ginza). Feature natural cork walls, tactile materials, and expert fitting orthopedists to educate customers in anatomical comfort.",
      control: "Total Brand Immersion",
      counterfeit: "Zero",
      customerData: "In-Store Registry",
      pricing: "Full MSRP + Exclusives"
    },
    wholesale: {
      title: "Selective Wholesale Partnerships",
      margin: "Wholesale Margin: ~50%",
      description: "Strictly limited to upscale department stores (Nordstrom, Selfridges), independent fashion boutiques, and specialty outdoor shops (REI). Excludes mass-discount retailers to maintain brand prestige.",
      control: "High (Contractual M.A.P.)",
      counterfeit: "Vetted Distributors Only",
      customerData: "Partner Shared",
      pricing: "Strict Minimum Advertised Price"
    }
  };

  channelButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const channel = btn.getAttribute('data-channel');
      
      // Update button visual states
      channelButtons.forEach(b => {
        b.classList.remove('active-channel', 'border-cork-500', 'bg-cork-100/70');
        b.classList.add('border-sand-300', 'bg-white');
      });
      btn.classList.add('active-channel', 'border-cork-500', 'bg-cork-100/70');
      btn.classList.remove('border-sand-300', 'bg-white');

      // Update detail panel content
      const data = channelData[channel];
      if (data && channelDetailPanel) {
        channelDetailPanel.innerHTML = `
          <div class="flex items-center justify-between mb-3">
            <span class="text-xs uppercase tracking-widest font-bold text-cork-700">Selected Path: ${data.title}</span>
            <span class="text-xs px-2.5 py-1 rounded bg-cork-100 text-cork-800 font-semibold">${data.margin}</span>
          </div>
          <p class="text-espresso-700 leading-relaxed mb-3">${data.description}</p>
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-3 border-t border-sand-100">
            <div><span class="text-espresso-400 block text-[10px] uppercase">Control Level</span><strong>${data.control}</strong></div>
            <div><span class="text-espresso-400 block text-[10px] uppercase">Counterfeit Risk</span><strong>${data.counterfeit}</strong></div>
            <div><span class="text-espresso-400 block text-[10px] uppercase">Customer Data</span><strong>${data.customerData}</strong></div>
            <div><span class="text-espresso-400 block text-[10px] uppercase">Price Consistency</span><strong>${data.pricing}</strong></div>
          </div>
        `;
      }
    });
  });


  /* -------------------------------------------------------------
     6. STP SECTION: INTERACTIVE TABS (Segmentation / Targeting / Positioning)
     ------------------------------------------------------------- */
  const stpTabs = document.querySelectorAll('.stp-tab-btn');
  const stpPanes = {
    segmentation: document.getElementById('stp-tab-segmentation'),
    targeting: document.getElementById('stp-tab-targeting'),
    positioning: document.getElementById('stp-tab-positioning')
  };

  stpTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const target = tab.getAttribute('data-tab');

      // Update Tab button states
      stpTabs.forEach(t => {
        t.classList.remove('active-tab', 'border-cork-600', 'text-cork-700');
        t.classList.add('border-transparent', 'text-espresso-500');
      });
      tab.classList.add('active-tab', 'border-cork-600', 'text-cork-700');
      tab.classList.remove('border-transparent', 'text-espresso-500');

      // Show matching Pane
      Object.keys(stpPanes).forEach(paneKey => {
        if (paneKey === target) {
          stpPanes[paneKey].classList.remove('hidden');
        } else {
          stpPanes[paneKey].classList.add('hidden');
        }
      });
    });
  });


  /* -------------------------------------------------------------
     7. PRODUCT SPECIFICATION MODAL
     ------------------------------------------------------------- */
  const productModal = document.getElementById('product-modal');
  const modalContent = document.getElementById('modal-content');
  const closeModalBtn = document.getElementById('close-product-modal');
  const openModalButtons = document.querySelectorAll('.open-product-modal-btn');

  const productSpecs = {
    single: {
      name: "Single-Strap Sandal (Madrid / Gizeh)",
      subtitle: "The Easy Entry • Light, Slip-on Warm-Weather Entry",
      indicativePrice: "₹5,490 – ₹8,490 (Indicative India Listings)",
      launch: "1963 (Original Karl Birkenstock Silhouette)",
      materials: "Skin-friendly Birko-Flor or Oiled Leather, Anatomical Cork-Latex footbed, Suede lining, Lightweight shock-absorbing EVA outsole, Single adjustable pin buckle.",
      ergonomics: "Single-strap design engages toe-grip reflexes during walking, exercising calf muscles while providing breezy slip-on comfort.",
      marketingRole: "A friendly first Birkenstock that brings new buyers in. Pushed via vibrant social content and digital marketplaces.",
      targetConsumer: "First-time buyers, university students, and warm-weather leisure seekers looking for an accessible entry point."
    },
    arizona: {
      name: "Double-Strap Sandal (Arizona)",
      subtitle: "The Hero • The Timeless Orthopedic Benchmark",
      indicativePrice: "₹5,943 – ₹10,990 (Indicative India Listings)",
      launch: "1973 (Over 50 Years of Design Consistency)",
      materials: "Oiled Nubuck Leather upper, Cork-Latex anatomical footbed, Suede lining, Lightweight EVA sole, Corrosion-resistant branded buckles.",
      ergonomics: "Two individually adjustable straps distribute foot tension evenly across the instep, preventing clawing of toes during walking.",
      marketingRole: "The classic shape that shows off the footbed and the design. Leads the comfort story; pushed via owned website and exclusive boutiques.",
      targetConsumer: "Universal appeal across demographics — from college students to podiatrists and fashion stylists."
    },
    boston: {
      name: "Boston Closed-Toe Clog",
      subtitle: "The All-Rounder • Year-Round Streetwear & Utility",
      indicativePrice: "₹12,990 – ₹13,990 (Indicative India Listings)",
      launch: "1979",
      materials: "Supple Suede or Smooth Natural Leather, Contoured Cork-Latex footbed with optional soft foam cushion insert, EVA sole, Adjustable pin buckle.",
      ergonomics: "Closed-toe upper provides forefoot warmth and protection while maintaining full anatomical arch support and deep heel stabilization.",
      marketingRole: "Takes the brand from sandal season to everyday utility. Pushed with limited drops and high-fashion designer collaborations.",
      targetConsumer: "Creative professionals, urban fashion curators, and culinary/healthcare workers seeking effortless all-day covered comfort."
    }
  };

  function openProductModal(productId) {
    const spec = productSpecs[productId];
    if (!spec || !modalContent) return;

    modalContent.innerHTML = `
      <div class="space-y-6">
        <div>
          <span class="text-xs uppercase font-bold tracking-widest text-cork-700">Technical Teardown & Strategic Spec</span>
          <h3 class="font-serif text-3xl font-bold text-espresso-900 mt-1">${spec.name}</h3>
          <p class="text-xs text-cork-600 font-semibold uppercase tracking-wider">${spec.subtitle}</p>
          <div class="mt-2 inline-block px-3 py-1 rounded-full bg-cork-100 text-cork-900 text-xs font-mono font-bold">
            ${spec.indicativePrice}
          </div>
        </div>

        <div class="space-y-4 text-xs sm:text-sm text-espresso-700">
          <div class="bg-sand-50 p-4 rounded-xl border border-sand-200">
            <strong class="text-espresso-900 block mb-1">Materials & Construction:</strong>
            ${spec.materials}
          </div>

          <div class="bg-sand-50 p-4 rounded-xl border border-sand-200">
            <strong class="text-espresso-900 block mb-1">Biomechanical Ergonomics:</strong>
            ${spec.ergonomics}
          </div>

          <div class="bg-sand-50 p-4 rounded-xl border border-sand-200">
            <strong class="text-espresso-900 block mb-1">Strategic Portfolio Role (From Slide 4 & 5):</strong>
            ${spec.marketingRole}
          </div>

          <div class="bg-sand-50 p-4 rounded-xl border border-sand-200">
            <strong class="text-espresso-900 block mb-1">Target Customer Profile:</strong>
            ${spec.targetConsumer}
          </div>
        </div>

        <div class="pt-4 border-t border-sand-200 text-center">
          <button id="modal-close-action" class="px-6 py-2 rounded-full bg-espresso-900 text-sand-50 text-xs uppercase font-bold tracking-wider hover:bg-cork-700 transition-colors">
            Close Technical Sheet
          </button>
        </div>
      </div>
    `;

    productModal.classList.remove('hidden');
    productModal.classList.add('flex');

    const modalCloseAction = document.getElementById('modal-close-action');
    if (modalCloseAction) {
      modalCloseAction.addEventListener('click', closeProductModal);
    }
  }

  function closeProductModal() {
    if (productModal) {
      productModal.classList.add('hidden');
      productModal.classList.remove('flex');
    }
  }

  openModalButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const prod = btn.getAttribute('data-product');
      openProductModal(prod);
    });
  });

  if (closeModalBtn) {
    closeModalBtn.addEventListener('click', closeProductModal);
  }

  if (productModal) {
    productModal.addEventListener('click', (e) => {
      if (e.target === productModal) closeProductModal();
    });
  }


  /* -------------------------------------------------------------
     8. PRESENTATION MODE ENGINE (7 Slides)
     Order: 1. HOME → 2. PRODUCT → 3. PRICE → 4. PLACE → 5. PROMOTION → 6. STP → 7. CONCLUSION
     ------------------------------------------------------------- */
  const presentationOverlay = document.getElementById('presentation-overlay');
  const presSlideContent = document.getElementById('pres-slide-content');
  const presSlideCounter = document.getElementById('pres-slide-counter');
  const presPrevBtn = document.getElementById('pres-prev-btn');
  const presNextBtn = document.getElementById('pres-next-btn');
  const presFullscreenBtn = document.getElementById('pres-fullscreen-btn');
  const enterPresBtn = document.getElementById('enter-pres-btn');
  const exitPresBtn = document.getElementById('exit-pres-btn');
  const launchTriggers = document.querySelectorAll('.launch-presentation-trigger');

  let currentSlide = 0;

  const slidesData = [
    {
      id: "slide-1",
      title: "Title & Executive Overview",
      badge: "SLIDE 01 / 11 • MARKETING MANAGEMENT",
      headline: "Birkenstock: STP in Marketing Management",
      sub: "One comfort idea, three ways to wear it: the single-strap sandal, the double-strap sandal and the clog.",
      contentHtml: `
        <div class="grid grid-cols-1 md:grid-cols-12 gap-8 items-center slide-content-anim">
          <div class="md:col-span-7 space-y-6">
            <div class="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cork-800 text-cork-200 text-xs font-semibold tracking-widest uppercase">
              <span>Prepared by · Brand Builders</span>
            </div>
            <h2 class="font-serif text-4xl sm:text-5xl font-bold text-white leading-tight">Birkenstock: STP in Marketing Management</h2>
            <p class="text-sand-300 text-base leading-relaxed">
              "One comfort idea, three ways to wear it: the single-strap sandal, the double-strap sandal and the clog."
            </p>
            <div class="p-4 rounded-xl bg-espresso-800 border border-espresso-700 text-xs text-sand-200">
              <strong class="text-cork-300 block mb-1">Core Marketing Architecture:</strong>
              Product (The 1st P) → Price in ₹ (The 2nd P) → Place (The 3rd P) → Promotion (The 4th P) → Segmentation, Targeting & Positioning (STP).
            </div>
          </div>
          <div class="md:col-span-5 grid grid-cols-1 gap-3">
            <div class="bg-espresso-800/80 p-3 rounded-xl border border-espresso-700 flex items-center space-x-4">
              <img src="assets/images/hero-arizona.jpg" alt="Double Strap" class="w-16 h-16 rounded-lg object-cover">
              <div>
                <span class="text-xs font-bold text-cork-400 uppercase">The Hero</span>
                <h4 class="font-serif font-bold text-white text-base">Double strap</h4>
                <p class="text-[11px] text-sand-300">Arizona silhouette</p>
              </div>
            </div>
            <div class="bg-espresso-800/80 p-3 rounded-xl border border-espresso-700 flex items-center space-x-4">
              <img src="assets/images/gizeh-sandal.jpg" alt="Single Strap" class="w-16 h-16 rounded-lg object-cover">
              <div>
                <span class="text-xs font-bold text-cork-400 uppercase">The Easy Entry</span>
                <h4 class="font-serif font-bold text-white text-base">Single strap</h4>
                <p class="text-[11px] text-sand-300">Madrid / Gizeh entry</p>
              </div>
            </div>
            <div class="bg-espresso-800/80 p-3 rounded-xl border border-espresso-700 flex items-center space-x-4">
              <img src="assets/images/boston-clog.jpg" alt="Clog" class="w-16 h-16 rounded-lg object-cover">
              <div>
                <span class="text-xs font-bold text-cork-400 uppercase">The All-Rounder</span>
                <h4 class="font-serif font-bold text-white text-base">Clog</h4>
                <p class="text-[11px] text-sand-300">Boston closed-toe mule</p>
              </div>
            </div>
          </div>
        </div>
      `
    },
    {
      id: "slide-2",
      title: "The Birkenstock Story",
      badge: "SLIDE 02 / 11 • BRAND HERITAGE",
      headline: "From a village shoemaker to a global comfort brand",
      sub: "250-Year Craft Continuum (1774–2023) and Why Customers Stay for the Long Run",
      contentHtml: `
        <div class="space-y-6 slide-content-anim">
          <div class="grid grid-cols-2 sm:grid-cols-5 gap-3 text-left">
            <div class="bg-espresso-800 p-4 rounded-xl border border-espresso-700">
              <span class="text-cork-400 text-xs font-bold font-mono">1774</span>
              <h5 class="text-white text-xs font-bold mt-1 mb-1">Johann Adam</h5>
              <p class="text-[11px] text-sand-300 leading-snug">Recorded as a cobbler in Langen, Germany.</p>
            </div>
            <div class="bg-espresso-800 p-4 rounded-xl border border-espresso-700">
              <span class="text-cork-400 text-xs font-bold font-mono">1896</span>
              <h5 class="text-white text-xs font-bold mt-1 mb-1">Konrad Birkenstock</h5>
              <p class="text-[11px] text-sand-300 leading-snug">Opens Frankfurt shoe stores; designs flexible arch-support insoles.</p>
            </div>
            <div class="bg-espresso-800 p-4 rounded-xl border border-espresso-700">
              <span class="text-cork-400 text-xs font-bold font-mono">1963</span>
              <h5 class="text-white text-xs font-bold mt-1 mb-1">Karl Birkenstock</h5>
              <p class="text-[11px] text-sand-300 leading-snug">Builds contoured footbed into an everyday sandal.</p>
            </div>
            <div class="bg-espresso-800 p-4 rounded-xl border border-espresso-700">
              <span class="text-cork-400 text-xs font-bold font-mono">1966</span>
              <h5 class="text-white text-xs font-bold mt-1 mb-1">Margot Fraser</h5>
              <p class="text-[11px] text-sand-300 leading-snug">Brings sandals to US health-food stores. Word spreads organically.</p>
            </div>
            <div class="bg-espresso-800 p-4 rounded-xl border border-cork-500">
              <span class="text-cork-400 text-xs font-bold font-mono">2023</span>
              <h5 class="text-white text-xs font-bold mt-1 mb-1">NYSE Listing</h5>
              <p class="text-[11px] text-sand-300 leading-snug">Birkenstock lists on NYSE as global comfort and fashion brand.</p>
            </div>
          </div>

          <div class="border-t border-espresso-800 pt-4">
            <span class="text-xs uppercase font-bold text-cork-300 tracking-wider block mb-3">Why customers stay for the long run</span>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div class="bg-espresso-800/80 p-4 rounded-xl border border-espresso-700">
                <div class="flex items-center space-x-2 text-cork-400 font-bold text-xs mb-1">
                  <span class="w-2 h-2 rounded-full bg-cork-400"></span>
                  <span>The footbed moulds to you</span>
                </div>
                <p class="text-xs text-sand-300">The cork-latex footbed shapes itself to the wearer's foot, so comfort grows with wear.</p>
              </div>
              <div class="bg-espresso-800/80 p-4 rounded-xl border border-espresso-700">
                <div class="flex items-center space-x-2 text-cork-400 font-bold text-xs mb-1">
                  <span class="w-2 h-2 rounded-full bg-cork-400"></span>
                  <span>Built to last</span>
                </div>
                <p class="text-xs text-sand-300">Durable materials and soles that can be repaired or replaced, so a pair stays in use for years.</p>
              </div>
              <div class="bg-espresso-800/80 p-4 rounded-xl border border-espresso-700">
                <div class="flex items-center space-x-2 text-cork-400 font-bold text-xs mb-1">
                  <span class="w-2 h-2 rounded-full bg-cork-400"></span>
                  <span>Same idea, fresh looks</span>
                </div>
                <p class="text-xs text-sand-300">The footbed never changes, while colours, materials and collaborations keep the style current.</p>
              </div>
            </div>
          </div>
        </div>
      `
    },
    {
      id: "slide-3",
      title: "The 4 Ps Overview",
      badge: "SLIDE 03 / 11 • THE 4 Ps",
      headline: "Birkenstock sells comfort as a premium product",
      sub: "The Operational Marketing Mix Framework",
      contentHtml: `
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-5 slide-content-anim">
          <div class="bg-espresso-800 p-5 rounded-2xl border border-espresso-700">
            <span class="text-xs font-bold text-cork-400 uppercase tracking-widest block mb-1">Product</span>
            <h4 class="font-serif text-xl font-bold text-white mb-2">Contoured Cork Footbed</h4>
            <p class="text-xs text-sand-300 leading-relaxed">
              A contoured cork-latex footbed made in Germany, sold in three easy-to-spot shapes: the single-strap sandal, the double-strap sandal and the clog.
            </p>
          </div>
          <div class="bg-espresso-800 p-5 rounded-2xl border-2 border-cork-500">
            <div class="flex items-center justify-between mb-1">
              <span class="text-xs font-bold text-cork-300 uppercase tracking-widest">Price</span>
              <span class="text-xs px-2 py-0.5 rounded bg-cork-700 text-white font-mono font-bold">₹6,000 – ₹15,000+</span>
            </div>
            <h4 class="font-serif text-xl font-bold text-white mb-2">Value-Based Premium</h4>
            <p class="text-xs text-sand-300 leading-relaxed">
              A premium range for upper-middle and high-income buyers. Single strap starts near ₹5,490, double strap runs to about ₹10,990 and clogs sit around ₹13,000.
            </p>
          </div>
          <div class="bg-espresso-800 p-5 rounded-2xl border border-espresso-700">
            <span class="text-xs font-bold text-cork-400 uppercase tracking-widest block mb-1">Place</span>
            <h4 class="font-serif text-xl font-bold text-white mb-2">Selective Omnichannel</h4>
            <p class="text-xs text-sand-300 leading-relaxed">
              Own stores and website, premium retailers and online marketplaces. The focus is metro and tier-1 cities, with online reach into tier-2 towns.
            </p>
          </div>
          <div class="bg-espresso-800 p-5 rounded-2xl border border-espresso-700">
            <span class="text-xs font-bold text-cork-400 uppercase tracking-widest block mb-1">Promotion</span>
            <h4 class="font-serif text-xl font-bold text-white mb-2">Heritage & Subcultural Pull</h4>
            <p class="text-xs text-sand-300 leading-relaxed">
              Collaborations, influencers and limited-edition drops, all built on heritage and foot-health stories that explain why the footbed matters.
            </p>
          </div>
        </div>
      `
    },
    {
      id: "slide-4",
      title: "Product Portfolio",
      badge: "SLIDE 04 / 11 • PRODUCT PORTFOLIO",
      headline: "Three styles stretch comfort across the whole day",
      sub: "Portfolio Architecture & Indicative India Listings (in ₹)",
      contentHtml: `
        <div class="grid grid-cols-1 md:grid-cols-3 gap-5 slide-content-anim">
          <div class="bg-espresso-800 p-5 rounded-2xl border border-espresso-700 flex flex-col justify-between">
            <div>
              <span class="text-xs font-bold text-cork-400 uppercase">Single strap</span>
              <h4 class="font-serif text-2xl font-bold text-white mt-1">The easy entry</h4>
              <div class="text-xl font-serif text-cork-300 my-2">₹5,490 – ₹8,490</div>
              <p class="text-[10px] text-sand-400 uppercase tracking-wider mb-4">*Indicative India listings</p>
              <div class="space-y-2 text-xs text-sand-300">
                <p><strong>Need:</strong> Slip-on comfort that still looks put together.</p>
                <p><strong>Use:</strong> Daily wear, leisure and warm-weather travel.</p>
              </div>
            </div>
            <div class="pt-3 mt-4 border-t border-espresso-700 text-xs text-cork-300">
              <strong>Role:</strong> A friendly first Birkenstock that brings new buyers in.
            </div>
          </div>

          <div class="bg-espresso-800 p-5 rounded-2xl border-2 border-cork-500 flex flex-col justify-between shadow-xl">
            <div>
              <span class="text-xs font-bold text-cork-300 uppercase">Double strap</span>
              <h4 class="font-serif text-2xl font-bold text-white mt-1">The hero</h4>
              <div class="text-xl font-serif text-cork-200 my-2">₹5,943 – ₹10,990</div>
              <p class="text-[10px] text-sand-400 uppercase tracking-wider mb-4">*Indicative India listings</p>
              <div class="space-y-2 text-xs text-sand-300">
                <p><strong>Need:</strong> Adjustable support that still makes a style statement.</p>
                <p><strong>Use:</strong> Daily wear, travel and leisure.</p>
              </div>
            </div>
            <div class="pt-3 mt-4 border-t border-espresso-700 text-xs text-cork-300">
              <strong>Role:</strong> The classic shape that shows off the footbed and the design.
            </div>
          </div>

          <div class="bg-espresso-800 p-5 rounded-2xl border border-espresso-700 flex flex-col justify-between">
            <div>
              <span class="text-xs font-bold text-cork-400 uppercase">Clog</span>
              <h4 class="font-serif text-2xl font-bold text-white mt-1">The all-rounder</h4>
              <div class="text-xl font-serif text-cork-300 my-2">₹12,990 – ₹13,990</div>
              <p class="text-[10px] text-sand-400 uppercase tracking-wider mb-4">*Indicative India listings</p>
              <div class="space-y-2 text-xs text-sand-300">
                <p><strong>Need:</strong> All-day comfort with more coverage.</p>
                <p><strong>Use:</strong> Daily wear, travel and cooler days.</p>
              </div>
            </div>
            <div class="pt-3 mt-4 border-t border-espresso-700 text-xs text-cork-300">
              <strong>Role:</strong> Takes the brand from sandal season to everyday utility.
            </div>
          </div>
        </div>
      `
    },
    {
      id: "slide-5",
      title: "Marketing Strategy by Silhouette",
      badge: "SLIDE 05 / 11 • MARKETING STRATEGY",
      headline: "Giving each style its own job",
      sub: "Differentiated channel distribution and customer conversion roles",
      contentHtml: `
        <div class="space-y-4 slide-content-anim">
          <div class="p-5 rounded-2xl bg-espresso-800 border border-espresso-700 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div class="max-w-xl">
              <span class="text-xs uppercase font-bold text-cork-400">Single strap: the easy entry</span>
              <p class="text-xs text-sand-300 mt-1">Simple, light and quick to love. Aimed at first-time buyers and warm-weather wear.</p>
            </div>
            <div class="px-4 py-2 rounded-xl bg-cork-800/80 border border-cork-600 text-xs font-semibold text-white whitespace-nowrap">
              Push with social content and online marketplaces.
            </div>
          </div>

          <div class="p-5 rounded-2xl bg-espresso-800 border-2 border-cork-500 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div class="max-w-xl">
              <span class="text-xs uppercase font-bold text-cork-300">Double strap: the hero</span>
              <p class="text-xs text-sand-300 mt-1">The adjustable fit makes the footbed visible, so it leads the comfort story.</p>
            </div>
            <div class="px-4 py-2 rounded-xl bg-cork-700 text-xs font-semibold text-white whitespace-nowrap">
              Push with our own website and exclusive stores.
            </div>
          </div>

          <div class="p-5 rounded-2xl bg-espresso-800 border border-espresso-700 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div class="max-w-xl">
              <span class="text-xs uppercase font-bold text-cork-400">Clog: the all-rounder</span>
              <p class="text-xs text-sand-300 mt-1">Covered comfort for cooler days, work and travel, at the top of the price range.</p>
            </div>
            <div class="px-4 py-2 rounded-xl bg-cork-800/80 border border-cork-600 text-xs font-semibold text-white whitespace-nowrap">
              Push with limited drops and collaborations.
            </div>
          </div>
        </div>
      `
    },
    {
      id: "slide-6",
      title: "Segmentation",
      badge: "SLIDE 06 / 11 • STP: SEGMENTATION",
      headline: "Four lenses show a market bigger than age",
      sub: "Geographic, Demographic, Psychographic, and Behavioral Analysis",
      contentHtml: `
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-5 slide-content-anim">
          <div class="bg-espresso-800 p-5 rounded-2xl border border-espresso-700">
            <span class="text-xs font-bold text-cork-400 uppercase">Geographic</span>
            <p class="text-xs text-sand-200 mt-2 mb-3">Metro and tier-1 cities, with online reach into tier-2.</p>
            <div class="p-2.5 rounded-lg bg-espresso-900 border border-espresso-700 text-xs text-cork-300 font-medium">
              <strong>So:</strong> Lead in the cities and widen discovery online.
            </div>
          </div>

          <div class="bg-espresso-800 p-5 rounded-2xl border border-espresso-700">
            <span class="text-xs font-bold text-cork-400 uppercase">Demographic</span>
            <p class="text-xs text-sand-200 mt-2 mb-3">Ages 18–55, core 22–45, upper-middle to high income.</p>
            <div class="p-2.5 rounded-lg bg-espresso-900 border border-espresso-700 text-xs text-cork-300 font-medium">
              <strong>So:</strong> Focus on the core but welcome nearby ages.
            </div>
          </div>

          <div class="bg-espresso-800 p-5 rounded-2xl border border-espresso-700">
            <span class="text-xs font-bold text-cork-400 uppercase">Psychographic</span>
            <p class="text-xs text-sand-200 mt-2 mb-3">Comfort-seeking, wellness-minded and style-conscious.</p>
            <div class="p-2.5 rounded-lg bg-espresso-900 border border-espresso-700 text-xs text-cork-300 font-medium">
              <strong>So:</strong> Make comfort look like a deliberate choice.
            </div>
          </div>

          <div class="bg-espresso-800 p-5 rounded-2xl border border-espresso-700">
            <span class="text-xs font-bold text-cork-400 uppercase">Behavioral</span>
            <p class="text-xs text-sand-200 mt-2 mb-3">Daily wear, travel, leisure, foot-pain relief and repeat buying.</p>
            <div class="p-2.5 rounded-lg bg-espresso-900 border border-espresso-700 text-xs text-cork-300 font-medium">
              <strong>So:</strong> Show real occasions that encourage repeat wear.
            </div>
          </div>
        </div>
      `
    },
    {
      id: "slide-7",
      title: "Target Customer Profile",
      badge: "SLIDE 07 / 11 • STP: TARGETING",
      headline: "Our core customer wants comfort that looks good",
      sub: "Balancing work, travel and downtime without compromise",
      contentHtml: `
        <div class="grid grid-cols-1 md:grid-cols-12 gap-6 items-center slide-content-anim">
          <div class="md:col-span-7 space-y-4">
            <div class="p-5 rounded-2xl bg-espresso-800 border border-espresso-700">
              <span class="text-xs font-bold text-cork-400 uppercase">Core Persona</span>
              <h4 class="font-serif text-2xl font-bold text-white mt-1">Urban professionals aged 22–40</h4>
              <p class="text-xs text-sand-300 mt-2 leading-relaxed">
                Balancing work, travel and downtime, and unwilling to pick between comfort and style.
              </p>
            </div>

            <div class="p-5 rounded-2xl bg-espresso-800/80 border border-espresso-700 space-y-3">
              <span class="text-xs font-bold text-cork-400 uppercase block">Age Bands</span>
              <div class="flex items-center justify-between text-xs py-1 border-b border-espresso-700">
                <span class="text-sand-300">Full Audience</span>
                <strong class="text-white font-mono">18–55</strong>
              </div>
              <div class="flex items-center justify-between text-xs py-1 border-b border-espresso-700">
                <span class="text-sand-300">Core Range</span>
                <strong class="text-cork-300 font-mono">22–45</strong>
              </div>
              <div class="flex items-center justify-between text-xs py-1">
                <span class="text-sand-300">Primary Focus</span>
                <strong class="text-white font-mono bg-cork-700 px-2 py-0.5 rounded">22–40</strong>
              </div>
            </div>
          </div>

          <div class="md:col-span-5 p-5 rounded-2xl bg-cork-900/60 border border-cork-600 text-xs text-sand-200 space-y-3">
            <strong class="text-cork-300 text-sm block">How we win them:</strong>
            <p class="leading-relaxed">
              Lead with all-day comfort, then present the double strap as everyday style, never a compromise.
            </p>
            <p class="leading-relaxed">
              Start on our own website and in exclusive stores, and save limited drops for discovery.
            </p>
          </div>
        </div>
      `
    },
    {
      id: "slide-8",
      title: "Targeting Framework",
      badge: "SLIDE 08 / 11 • STP: TARGETING MODEL",
      headline: "Targeting: where comfort meets culture",
      sub: "Concentric Alignment: Reach, Audience Fit, and Primary Target",
      contentHtml: `
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 items-center slide-content-anim">
          <div class="space-y-4">
            <div class="p-4 rounded-xl bg-espresso-800 border border-espresso-700">
              <span class="text-xs uppercase font-bold text-cork-400">Layer 1: Reach</span>
              <h5 class="text-white text-sm font-bold mt-1">Metro and tier-1 cities first</h5>
              <p class="text-xs text-sand-300">With digital e-commerce reach into tier-2 towns.</p>
            </div>
            <div class="p-4 rounded-xl bg-espresso-800 border border-espresso-700">
              <span class="text-xs uppercase font-bold text-cork-300">Layer 2: Audience Fit</span>
              <h5 class="text-white text-sm font-bold mt-1">Upper-middle to high-income buyers</h5>
              <p class="text-xs text-sand-300">Shoppers seeking uncompromising premium comfort with refined contemporary style.</p>
            </div>
            <div class="p-4 rounded-xl bg-espresso-800 border-2 border-cork-500">
              <span class="text-xs uppercase font-bold text-white">Layer 3: Primary Target</span>
              <h5 class="text-white text-sm font-bold mt-1">Urban young professionals aged 22–40</h5>
              <p class="text-xs text-sand-300">The cultural and economic sweet spot driving highest repeat lifetime value.</p>
            </div>
          </div>

          <div class="p-6 rounded-2xl bg-espresso-800/90 border border-espresso-700 text-xs text-sand-200">
            <span class="text-xs uppercase font-bold text-cork-400 block mb-2">Our Play:</span>
            <p class="leading-relaxed mb-4">
              Reach urban professionals where they already shop, in stores and online, and use comfort, heritage and style stories to make premium feel current.
            </p>
            <div class="p-3 rounded-lg bg-espresso-900 border border-espresso-700 text-[11px] text-cork-300">
              Sandal + Clog cross-selling extends wardrobe utility across work, home, and travel.
            </div>
          </div>
        </div>
      `
    },
    {
      id: "slide-9",
      title: "Positioning Strategy",
      badge: "SLIDE 09 / 11 • STP: POSITIONING",
      headline: "Premium, comfort-first fashion footwear",
      sub: "The Four Positioning Pillars & Indicative Price Spectrum (in ₹)",
      contentHtml: `
        <div class="space-y-6 slide-content-anim">
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div class="bg-espresso-800 p-4 rounded-xl border border-espresso-700 text-center">
              <span class="text-xs font-bold text-cork-400 uppercase">Comfort</span>
              <p class="text-xs text-white font-medium mt-1">Anatomical cork-latex footbed</p>
            </div>
            <div class="bg-espresso-800 p-4 rounded-xl border border-espresso-700 text-center">
              <span class="text-xs font-bold text-cork-400 uppercase">Craft</span>
              <p class="text-xs text-white font-medium mt-1">German craftsmanship</p>
            </div>
            <div class="bg-espresso-800 p-4 rounded-xl border border-espresso-700 text-center">
              <span class="text-xs font-bold text-cork-400 uppercase">Design</span>
              <p class="text-xs text-white font-medium mt-1">Iconic design with authenticity</p>
            </div>
            <div class="bg-espresso-800 p-4 rounded-xl border border-espresso-700 text-center">
              <span class="text-xs font-bold text-cork-400 uppercase">Meaning</span>
              <p class="text-xs text-white font-medium mt-1">Heritage, well-being & expression</p>
            </div>
          </div>

          <div class="p-5 rounded-2xl bg-espresso-800 border border-espresso-700">
            <span class="text-xs uppercase font-bold text-cork-400 block mb-3">Where each style sits on price (India, indicative listings)</span>
            <div class="space-y-2 text-xs">
              <div class="flex items-center justify-between">
                <span class="text-sand-300">Single strap</span>
                <span class="font-mono text-cork-300">₹5,490 – ₹8,490</span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-sand-300 font-semibold text-white">Double strap (Hero)</span>
                <span class="font-mono text-cork-200 font-bold">₹5,943 – ₹10,990</span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-sand-300">Clog (All-rounder)</span>
                <span class="font-mono text-cork-300">₹12,990 – ₹13,990</span>
              </div>
            </div>
          </div>

          <div class="p-4 rounded-xl bg-cork-900/60 border border-cork-700 text-xs text-sand-100 text-center">
            <strong>Value proposition:</strong> Functional credibility meets emotional meaning. Comfort you can feel, in a design you are happy to be seen in.
            <div class="text-cork-300 uppercase tracking-widest text-[10px] font-bold mt-1">“Comfort you can see”</div>
          </div>
        </div>
      `
    },
    {
      id: "slide-10",
      title: "Go-To-Market Growth Plan",
      badge: "SLIDE 10 / 11 • GO-TO-MARKET PLAN",
      headline: "Turning STP into a growth plan",
      sub: "Strategic Vectors and Selective Omnichannel Deployment",
      contentHtml: `
        <div class="space-y-5 slide-content-anim">
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <div class="p-3 rounded-xl bg-espresso-800 border border-espresso-700">
              <span class="text-xs text-cork-400 font-mono font-bold">01. Segment</span>
              <p class="text-xs text-white mt-1">18–55 broad, core 22–45</p>
            </div>
            <div class="p-3 rounded-xl bg-espresso-800 border border-espresso-700">
              <span class="text-xs text-cork-400 font-mono font-bold">02. Target</span>
              <p class="text-xs text-white mt-1">Urban professionals 22–40</p>
            </div>
            <div class="p-3 rounded-xl bg-espresso-800 border border-espresso-700">
              <span class="text-xs text-cork-400 font-mono font-bold">03. Position</span>
              <p class="text-xs text-white mt-1">Premium comfort-first fashion</p>
            </div>
            <div class="p-3 rounded-xl bg-espresso-800 border border-cork-500">
              <span class="text-xs text-cork-300 font-mono font-bold">04. Activate</span>
              <p class="text-xs text-white mt-1">Make easy to discover & buy</p>
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div class="p-4 rounded-xl bg-espresso-800 border border-espresso-700">
              <strong class="text-cork-400 block mb-1">Own the relationship</strong>
              <p class="text-sand-300">Exclusive stores and our own website.</p>
            </div>
            <div class="p-4 rounded-xl bg-espresso-800 border border-espresso-700">
              <strong class="text-cork-400 block mb-1">Extend selective reach</strong>
              <p class="text-sand-300">Premium retailers and marketplaces.</p>
            </div>
            <div class="p-4 rounded-xl bg-espresso-800 border border-espresso-700">
              <strong class="text-cork-400 block mb-1">Create cultural pull</strong>
              <p class="text-sand-300">Limited-edition drops and collaborations.</p>
            </div>
            <div class="p-4 rounded-xl bg-espresso-800 border border-espresso-700">
              <strong class="text-cork-400 block mb-1">Make comfort legible</strong>
              <p class="text-sand-300">Heritage and foot-health education.</p>
            </div>
          </div>

          <div class="p-3 rounded-xl bg-espresso-900 border border-espresso-700 text-center text-xs text-cork-300 font-medium">
            Single strap brings people in, double strap is the hero, and the clog extends the range.
          </div>
        </div>
      `
    },
    {
      id: "slide-11",
      title: "Conclusion & Discussion",
      badge: "SLIDE 11 / 11 • THANK YOU",
      headline: "Thank you",
      sub: "Questions? Prepared by Brand Builders · Marketing Management",
      contentHtml: `
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8 items-center slide-content-anim">
          <div class="space-y-6">
            <span class="px-3 py-1 rounded-full bg-cork-700 text-white text-xs uppercase font-bold tracking-widest">Discussion & Dialogue</span>
            <h2 class="font-serif text-5xl font-bold text-white leading-tight">Thank you</h2>
            <p class="text-sand-300 text-sm leading-relaxed">
              We invite your thoughts, critical feedback, and strategic discussion on Birkenstock's enduring marketing management journey.
            </p>
            <div class="p-4 rounded-xl bg-espresso-800 border border-espresso-700 text-xs text-sand-200 space-y-1">
              <div><strong>Presentation Team:</strong> Brand Builders</div>
              <div><strong>Domain:</strong> Marketing Management • STP & 4 Ps Integration</div>
              <div><strong>Focus Market:</strong> India Metro & Tier-1 / Global Footprint</div>
            </div>
          </div>
          <div class="relative rounded-2xl overflow-hidden border border-espresso-700 shadow-2xl bg-espresso-800 p-6 text-center">
            <img src="assets/images/boston-clog.jpg" alt="The Clog" class="w-full h-56 object-cover rounded-xl mb-4">
            <span class="text-xs uppercase font-bold tracking-widest text-cork-300">The Clog — All-Season Utility</span>
          </div>
        </div>
      `
    }
  ];

  // The conclusion slide was removed from the website flow; keep presentation mode aligned.
  slidesData.pop();

  function renderSlide(index) {
    if (index < 0) index = 0;
    if (index >= slidesData.length) index = slidesData.length - 1;
    currentSlide = index;

    const data = slidesData[currentSlide];
    presSlideCounter.textContent = `Slide ${currentSlide + 1} of ${slidesData.length} — ${data.title}`;

    presSlideContent.innerHTML = `
      <div class="space-y-4">
        <span class="text-xs font-bold uppercase tracking-widest text-cork-400 block">${data.badge}</span>
        <h2 class="font-serif text-3xl sm:text-4xl font-bold text-white">${data.headline}</h2>
        <p class="text-xs sm:text-sm text-sand-300 mb-6">${data.sub}</p>
        <div>${data.contentHtml}</div>
      </div>
    `;

    // Button states
    presPrevBtn.disabled = currentSlide === 0;
    presNextBtn.disabled = currentSlide === slidesData.length - 1;
  }

  function openPresentationMode(initialSlide = 0) {
    currentSlide = initialSlide;
    renderSlide(currentSlide);
    presentationOverlay.classList.remove('hidden');
    presentationOverlay.classList.add('flex');
    document.body.style.overflow = 'hidden';
  }

  function closePresentationMode() {
    presentationOverlay.classList.add('hidden');
    presentationOverlay.classList.remove('flex');
    document.body.style.overflow = '';
  }

  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        console.log(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  }

  // Event Listeners for Presentation Mode
  if (enterPresBtn) {
    enterPresBtn.addEventListener('click', () => openPresentationMode(0));
  }

  launchTriggers.forEach(btn => {
    btn.addEventListener('click', () => openPresentationMode(0));
  });

  // Direct slide launch triggers (e.g. from Slide-to-Website Verification Map)
  document.addEventListener('click', (e) => {
    const slideBtn = e.target.closest('[data-slide-index]');
    if (slideBtn) {
      const idx = parseInt(slideBtn.getAttribute('data-slide-index'), 10);
      if (!isNaN(idx)) {
        openPresentationMode(idx);
      }
    }
  });

  if (exitPresBtn) {
    exitPresBtn.addEventListener('click', closePresentationMode);
  }

  if (presPrevBtn) {
    presPrevBtn.addEventListener('click', () => {
      if (currentSlide > 0) renderSlide(currentSlide - 1);
    });
  }

  if (presNextBtn) {
    presNextBtn.addEventListener('click', () => {
      if (currentSlide < slidesData.length - 1) renderSlide(currentSlide + 1);
    });
  }

  if (presFullscreenBtn) {
    presFullscreenBtn.addEventListener('click', toggleFullscreen);
  }

  // Keyboard Navigation
  window.addEventListener('keydown', (e) => {
    // If modal is open, Escape closes modal
    if (!productModal.classList.contains('hidden') && e.key === 'Escape') {
      closeProductModal();
      return;
    }

    // If presentation mode is open
    if (!presentationOverlay.classList.contains('hidden')) {
      if (e.key === 'ArrowRight' || e.key === 'PageDown' || e.key === ' ') {
        e.preventDefault();
        if (currentSlide < slidesData.length - 1) renderSlide(currentSlide + 1);
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        e.preventDefault();
        if (currentSlide > 0) renderSlide(currentSlide - 1);
      } else if (e.key === 'Escape') {
        closePresentationMode();
      } else if (e.key === 'f' || e.key === 'F') {
        toggleFullscreen();
      }
    }
  });



  /* -------------------------------------------------------------
     NEW: WORLD MAP REVENUE INTERACTION
     ------------------------------------------------------------- */
  const worldMapRegions = document.querySelectorAll('.map-region');
  const revenuePanel = document.getElementById('revenue-detail-panel');

  const revenueData = {
    'north-america': { name: 'North America', revenue: '$2.1B', share: '43%', status: 'Largest market', roi: 'High', consumers: '85M', penetration: '8.5%', competitors: 'Crocs, Skechers' },
    'europe': { name: 'Europe', revenue: '$1.8B', share: '37%', status: 'Heritage core', roi: 'Very high', consumers: '70M', penetration: '10.2%', competitors: 'Dr. Martens, Geox' },
    'asia-pacific': { name: 'Asia-Pacific', revenue: '$0.6B', share: '12%', status: 'Expansion market', roi: 'Medium–high', consumers: '180M', penetration: '1.8%', competitors: 'Crocs, local premium brands' },
    'latin-america': { name: 'Latin America', revenue: '$0.2B', share: '4%', status: 'Emerging presence', roi: 'Medium', consumers: '95M', penetration: '1.2%', competitors: 'Skechers, Havaianas' },
    'middle-east-africa': { name: 'Middle East & Africa', revenue: '$0.1B', share: '2%', status: 'Selective presence', roi: 'Medium', consumers: '65M', penetration: '0.8%', competitors: 'Crocs, premium boutiques' },
  };

  worldMapRegions.forEach(region => {
    region.addEventListener('click', () => {
      const id = region.getAttribute('data-region');
      const data = revenueData[id];
      if (data && revenuePanel) {
        revenuePanel.innerHTML = `
          <div class="flex items-center justify-between mb-2">
            <span class="text-xs uppercase font-bold text-cork-700">${data.name}</span>
            <span class="text-xs px-2 py-0.5 rounded bg-cork-100 text-cork-800 font-semibold">Illustrative</span>
          </div>
          <div class="mt-4 rounded-xl bg-white/70 border border-cork-200 p-4">
            <span class="block text-[10px] uppercase tracking-widest text-espresso-500">Revenue</span>
            <strong class="font-serif text-3xl text-espresso-900">${data.revenue}</strong>
          </div>
          <div class="grid grid-cols-2 gap-2 text-[10px] uppercase tracking-wider text-espresso-500 mt-4">
            <div class="flex flex-col gap-1">
              <span>Turnover share</span><strong class="text-espresso-800 text-sm">${data.share}</strong>
            </div>
            <div class="flex flex-col gap-1">
              <span>ROI signal</span><strong class="text-espresso-800 text-xs normal-case">${data.roi}</strong>
            </div>
          </div>
          <div class="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-cork-200 text-[10px] uppercase tracking-wider text-espresso-500">
            <div class="flex flex-col gap-1"><span>Addressable consumers</span><strong class="text-espresso-800 text-sm">${data.consumers}</strong></div>
            <div class="flex flex-col gap-1"><span>Using Birkenstock</span><strong class="text-espresso-800 text-sm">${data.penetration}</strong></div>
          </div>
          <div class="mt-4 pt-4 border-t border-cork-200 text-[10px] text-espresso-500">
            <span class="uppercase tracking-wider">Primary competitor set</span>
            <strong class="block text-espresso-800 text-xs normal-case mt-1">${data.competitors}</strong>
          </div>
        `;
        revenuePanel.classList.remove('hidden');
        worldMapRegions.forEach(item => item.querySelectorAll('.map-region-path').forEach(path => path.classList.remove('active-region')));
        region.querySelectorAll('.map-region-path').forEach(path => path.classList.add('active-region'));
      }
    });
    region.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        region.click();
      }
    });
  });

  /* -------------------------------------------------------------
     WORLD MAP GEOMETRY: recognizable country-level map
     ------------------------------------------------------------- */
  const worldMapSvg = document.getElementById('world-map-svg');
  const countryLayer = document.getElementById('world-map-countries');
  if (worldMapSvg && countryLayer && window.d3 && window.topojson) {
    const regionCountries = {
      'north-america': ['United States of America', 'Canada', 'Mexico'],
      'latin-america': ['Brazil', 'Argentina', 'Chile', 'Colombia', 'Peru'],
      'europe': ['Germany', 'France', 'Italy', 'Spain', 'United Kingdom', 'Netherlands', 'Sweden', 'Norway', 'Poland'],
      'middle-east-africa': ['Saudi Arabia', 'United Arab Emirates', 'Egypt', 'South Africa', 'Nigeria', 'Kenya', 'Morocco'],
      'asia-pacific': ['China', 'Japan', 'India', 'Australia', 'Indonesia', 'South Korea', 'Thailand', 'Vietnam', 'Singapore']
    };
    const regionForCountry = (name = '') => Object.entries(regionCountries).find(([, countries]) => countries.some(country => name.toLowerCase().includes(country.toLowerCase())))?.[0] || 'asia-pacific';
    const regionColors = {
      'north-america': '#9c5c2d',
      'latin-america': '#c9933b',
      'europe': '#3b281f',
      'middle-east-africa': '#c9933b',
      'asia-pacific': '#9c5c2d'
    };
    fetch('https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json')
      .then(response => response.json())
      .then(world => {
        const countries = topojson.feature(world, world.objects.countries);
        const projection = d3.geoNaturalEarth1().fitExtent([[18, 18], [982, 452]], countries);
        const path = d3.geoPath(projection);
        d3.select(countryLayer).selectAll('*').remove();
        d3.selectAll('#world-map-svg > .map-region').style('display', 'none');
        d3.select(countryLayer).selectAll('path')
          .data(countries.features)
          .join('path')
          .attr('class', 'world-country')
          .attr('d', path)
          .attr('fill', feature => regionColors[regionForCountry(feature.properties?.name)] || '#d9cbba')
          .attr('data-region', feature => regionForCountry(feature.properties?.name))
          .attr('aria-label', feature => `${feature.properties?.name || 'Country'} market region`)
          .on('click', function(event, feature) {
            const region = regionForCountry(feature.properties?.name);
            const target = document.querySelector(`.map-region[data-region="${region}"]`);
            if (target) target.dispatchEvent(new MouseEvent('click', { bubbles: true }));
            d3.selectAll('.world-country').classed('active-country', false);
            d3.select(this).classed('active-country', true);
          });
      })
      .catch(() => {
        // The embedded fallback regions remain available if the map data CDN is unavailable.
      });
  }

});
