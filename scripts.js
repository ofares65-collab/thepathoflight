// scripts.js – مسار العائلة المقدسة
// تمت إعادة كتابة الملف بالكامل بعد إصلاح Swiper وإضافة virtual-tours-swiper
// أخر تحديث: 2025-09-24

document.addEventListener('DOMContentLoaded', () => {

  // ================= 1. القائمة للموبايل =================
  const mobileToggle = document.getElementById('mobileToggle');
  const navMenu       = document.getElementById('navMenu');
  if (mobileToggle) {
    mobileToggle.addEventListener('click', () => {
      const isExpanded = navMenu.classList.contains('active');
      navMenu.classList.toggle('active');
      mobileToggle.setAttribute('aria-expanded', !isExpanded);
      const icon = mobileToggle.querySelector('i');
      icon.classList.toggle('fa-bars');
      icon.classList.toggle('fa-times');
    });
  }

  // ================= 2. تأثير الظهور عند التمرير =================
  const fadeElements = document.querySelectorAll('.fade-in');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) entry.target.classList.add('visible');
    });
  }, { threshold: 0.1 });
  fadeElements.forEach(el => observer.observe(el));

  // ================= 3. إعدادات Swiper الموحدة =================
  const swiperConfig = {
    loop: true,
    slidesPerView: 1,
    spaceBetween: 30,
    navigation: {
      nextEl: '.swiper-button-next',
      prevEl: '.swiper-button-prev',
    },
    pagination: {
      el: '.swiper-pagination',
      clickable: true,
    },
    breakpoints: {
      768: { slidesPerView: 2 },
      1024: { slidesPerView: 3 },
    }
  };

  // ================= 4. تهيئة جميع السواipers =================
  // وجهات
  if (document.querySelector('.destinations-swiper')) {
    new Swiper('.destinations-swiper', swiperConfig);
  }

  // أنشطة
  if (document.querySelector('.activities-swiper')) {
    new Swiper('.activities-swiper', swiperConfig);
  }

  // معرض الصور
  if (document.querySelector('.gallery-swiper')) {
    new Swiper('.gallery-swiper', {
      ...swiperConfig,
      autoplay: {
        delay: 3000,
        disableOnInteraction: false,
      },
      breakpoints: {
        640: { slidesPerView: 2, spaceBetween: 20 },
        768: { slidesPerView: 3, spaceBetween: 30 },
        1024: { slidesPerView: 4, spaceBetween: 40 },
      }
    });
  }

  // الجولات الافتراضية
  if (document.querySelector('.virtual-tours-swiper')) {
    new Swiper('.virtual-tours-swiper', {
      ...swiperConfig,
      slidesPerView: 1,
      spaceBetween: 20,
      breakpoints: {
        640: { slidesPerView: 1 },
        768: { slidesPerView: 2 },
        1024: { slidesPerView: 3 }
      }
    });
  }

  // ================= 5. تهيئة الخريطة (Leaflet) =================
  const mapContainer = document.getElementById('map');
  if (mapContainer) {
    if (!mapContainer.style.height || mapContainer.style.height === '0px') {
      mapContainer.style.height = '400px';
    }
    const map = L.map('map').setView([27.0, 31.0], 6);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);

    const generalMarkers = [
      { name: "الكنيسة المعلقة (القاهرة)", coords: [30.005, 31.230], image: "images/hanging-church.jpg", page: "cairo.html" },
      { name: "دير جبل الطير (المنيا)", coords: [28.070, 30.820], image: "images/gabal-eltayr.jpg", page: "minya.html" },
      { name: "دير الأنبا بيشوي (البحيرة)", coords: [30.340, 30.290], image: "images/anba-bishoy.jpg", page: "beheira.html" },
      { name: "دير السيدة العذراء بدرنكة (أسيوط)", coords: [27.140, 31.130], image: "images/assiut/dronka.jpg", page: "asyut.html" },
      { name: "تل بسطة (الشرقية)", coords: [30.582, 31.528], image: "images/sharqia/telbasta.jpg", page: "sharqia.html" }
    ];

    generalMarkers.forEach(m => {
      L.marker(m.coords).addTo(map)
        .bindPopup(`
          <b>${m.name}</b><br>
          <img src="${m.image}" style="width:100px; height:auto; margin-top:5px;"><br>
          <a href="${m.page}" target="_blank">المزيد</a>
        `);
    });
  }

  // ================= 6. تهيئة Fancybox =================
  if (typeof Fancybox !== 'undefined') {
    Fancybox.bind("[data-fancybox='gallery']", {});
  }

  // ================= 7. Toggle Details (تفويض) =================
  document.addEventListener('click', e => {
    const btn = e.target.closest('.toggle-details');
    if (!btn) return;

    const targetId = btn.dataset.target;
    if (!targetId) return;

    const target = document.getElementById(targetId);
    if (!target) return;

    e.preventDefault(); // منع القفز

    // أغلق أى تفاصيل مفتوحة سابقاً
    document.querySelectorAll('.details.open').forEach(detail => {
      if (detail !== target) {
        detail.classList.remove('open');
        const prevBtn = document.querySelector(`.toggle-details[data-target="${detail.id}"]`);
        if (prevBtn) prevBtn.classList.remove('active');
      }
    });

    // تبديل الحالة الحالية
    const nowOpen = target.classList.toggle('open');
    btn.classList.toggle('active', nowOpen);
  });

  // ================= 8. تحميل الصور الكسولة (optional) =================
  const lazyImages = document.querySelectorAll('img[data-src]');
  const imageObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        img.src = img.dataset.src;
        img.classList.remove('lazy');
        observer.unobserve(img);
      }
    });
  });
  lazyImages.forEach(img => imageObserver.observe(img));

  // ================= 9. تأثير hover على البطاقات =================
  const cards = document.querySelectorAll('.destination-card, .activity-card, .virtual-tour-item');
  cards.forEach(card => {
    card.addEventListener('mouseenter', () => {
      card.style.transform = 'translateY(-5px)';
      card.style.boxShadow = '0 8px 20px rgba(0,0,0,0.15)';
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = 'translateY(0)';
      card.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
    });
  });

  // ================= 10. التعامل مع الأخطاء المحتملة =================
  window.addEventListener('error', (e) => {
    if (e.message.includes('Swiper')) console.warn('Swiper Error:', e.message);
    if (e.message.includes('Leaflet')) console.warn('Leaflet Map Error:', e.message);
  });

  // ================= 11. إعلان النهاية =================
  console.log('✅ تم تحميل scripts.js بنجاح مع جميع التعديلات.');
});