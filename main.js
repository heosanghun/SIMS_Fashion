// SIMS Fashion AI - Main JavaScript

(function() {
  'use strict';

  // ========================================
  // API Keys (.env → config.js 에서 주입, Gemini만 사용)
  // ========================================
  const GEMINI_API_KEY = (typeof window !== 'undefined' && window.__SIMS_GEMINI_KEY__) || '';

  // ========================================
  // 7컬러 × 퍼스널컬러 × 음악 추천 (BTS 멤버 미거론, 무드만 사용)
  // ========================================
  const COLOR_MUSIC = {
    red: { name: '빨강', mood: '열정적이고 강렬한', description: '에너지 넘치는 비트와 강렬한 무드가 잘 어울려요.', directLink: 'https://www.youtube.com/watch?v=4ujQOR2DMFM', searchLink: 'https://www.youtube.com/results?search_query=Fire+%EB%B6%88%ED%83%80%EC%98%A4%EB%A5%B4%EB%84%A4+official+MV' },
    orange: { name: '주황', mood: '따뜻하고 유쾌한', description: '스무스하고 경쾌한 팝 무드와 잘 맞아요.', directLink: 'https://www.youtube.com/watch?v=ZlQIw9EPui0', searchLink: 'https://www.youtube.com/results?search_query=Butter+official+MV' },
    yellow: { name: '노랑', mood: '밝고 활기찬', description: '디스코와 밝은 에너지가 잘 어울려요.', directLink: 'https://www.youtube.com/watch?v=gdZLi9oWNZg', searchLink: 'https://www.youtube.com/results?search_query=Dynamite+official+MV' },
    green: { name: '초록', mood: '달콤하고 설레는', description: '달달하고 희망적인 무드와 잘 맞아요.', directLink: 'https://www.youtube.com/watch?v=XsX3ATc3FbA', searchLink: 'https://www.youtube.com/results?search_query=Boy+With+Luv+%EC%9E%91%EC%9D%80+%EA%B2%83%EB%93%A4%EC%9D%84+%EC%9C%84%ED%95%9C+%EC%8B%9C+official' },
    blue: { name: '파랑', mood: '시원하고 청량한', description: '신선하고 쿨한 비트가 잘 어울려요.', directLink: 'https://www.youtube.com/watch?v=MBdVXkSdhwU', searchLink: 'https://www.youtube.com/results?search_query=DNA+official+MV' },
    indigo: { name: '남색', mood: '깊고 예술적인', description: '내면적이고 드라마틱한 무드와 잘 맞아요.', directLink: 'https://www.youtube.com/watch?v=0lapF4DQPKQ', searchLink: 'https://www.youtube.com/results?search_query=Black+Swan+official+MV' },
    violet: { name: '보라', mood: '감성적이고 몽환적인', description: '감성과 위로가 담긴 무드와 잘 맞아요.', directLink: 'https://www.youtube.com/watch?v=xEeFrLSkMm8', searchLink: 'https://www.youtube.com/results?search_query=%EB%B4%84%EB%82%A0+Spring+Day+official+MV' }
  };
  const PERSONAL_COLOR_TO_7COLOR = {
    '봄웜': { primary: 'yellow', secondary: 'orange' },
    '봄쿨': { primary: 'yellow', secondary: 'green' },
    '여름쿨': { primary: 'blue', secondary: 'violet' },
    '여름웜': { primary: 'green', secondary: 'blue' },
    '가을웜': { primary: 'red', secondary: 'indigo' },
    '가을쿨': { primary: 'indigo', secondary: 'violet' },
    '겨울쿨': { primary: 'red', secondary: 'indigo' },
    '겨울웜': { primary: 'violet', secondary: 'red' }
  };
  const SEASON_TO_7COLOR = { '봄': 'yellow', '여름': 'blue', '가을': 'red', '겨울': 'violet' };

  function getPrimary7Color(seasonString) {
    if (!seasonString || typeof seasonString !== 'string') return 'blue';
    var s = seasonString.trim();
    if (PERSONAL_COLOR_TO_7COLOR[s]) return PERSONAL_COLOR_TO_7COLOR[s].primary;
    if (s.indexOf('봄') !== -1) return 'yellow';
    if (s.indexOf('여름') !== -1) return 'blue';
    if (s.indexOf('가을') !== -1) return 'red';
    if (s.indexOf('겨울') !== -1) return 'violet';
    return 'blue';
  }

  // ========================================
  // Theme Toggle
  // ========================================
  const themeToggle = document.getElementById('theme-toggle');
  const html = document.documentElement;

  function getPreferredTheme() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) return savedTheme;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  function setTheme(theme) {
    if (theme === 'dark') {
      html.setAttribute('data-theme', 'dark');
    } else {
      html.removeAttribute('data-theme');
    }
    localStorage.setItem('theme', theme);
  }

  setTheme(getPreferredTheme());

  if (themeToggle) {
    themeToggle.addEventListener('click', function() {
      const currentTheme = html.getAttribute('data-theme');
      setTheme(currentTheme === 'dark' ? 'light' : 'dark');
    });
  }

  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function(e) {
    if (!localStorage.getItem('theme')) {
      setTheme(e.matches ? 'dark' : 'light');
    }
  });

  // ========================================
  // Navbar scroll effect
  // ========================================
  const navbar = document.querySelector('.navbar');

  window.addEventListener('scroll', function() {
    if (navbar) {
      if (window.scrollY > 100) {
        navbar.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.1)';
      } else {
        navbar.style.boxShadow = 'none';
      }
    }
  });

  // ========================================
  // Mobile Menu
  // ========================================
  const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
  const navLinks = document.querySelector('.nav-links');

  if (mobileMenuBtn && navLinks) {
    mobileMenuBtn.addEventListener('click', function() {
      mobileMenuBtn.classList.toggle('active');
      navLinks.classList.toggle('mobile-open');
    });

    // Close menu when clicking a link
    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        mobileMenuBtn.classList.remove('active');
        navLinks.classList.remove('mobile-open');
      });
    });
  }

  // ========================================
  // Smooth scroll for anchor links
  // ========================================
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const href = this.getAttribute('href');
      if (href && href !== '#') {
        e.preventDefault();
        const target = document.querySelector(href);
        if (target) {
          target.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        }
      }
    });
  });

  // ========================================
  // Intersection Observer for animations
  // ========================================
  const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.1
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animate-in');
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  document.querySelectorAll('.feature-card, .look-card, .testimonial-card, .step').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(el);
  });

  // Add animation class styles
  const animationStyle = document.createElement('style');
  animationStyle.textContent = `
    .animate-in {
      opacity: 1 !important;
      transform: translateY(0) !important;
    }
  `;
  document.head.appendChild(animationStyle);

  // ========================================
  // Counter animation for stats
  // ========================================
  function animateCounter(element, target, duration = 2000) {
    const start = 0;
    const increment = target / (duration / 16);
    let current = start;

    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        current = target;
        clearInterval(timer);
      }

      if (target >= 1000000) {
        element.textContent = (current / 1000000).toFixed(1) + 'M+';
      } else if (target >= 1000) {
        element.textContent = Math.floor(current / 1000) + 'K+';
      } else {
        element.textContent = Math.floor(current) + '%';
      }
    }, 16);
  }

  const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const statNumbers = entry.target.querySelectorAll('.stat-number');
        statNumbers.forEach(stat => {
          const text = stat.textContent;
          let target;
          if (text.includes('M')) {
            target = parseFloat(text) * 1000000;
          } else if (text.includes('K')) {
            target = parseFloat(text) * 1000;
          } else {
            target = parseInt(text);
          }
          animateCounter(stat, target);
        });
        statsObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  const heroStats = document.querySelector('.hero-stats');
  if (heroStats) {
    statsObserver.observe(heroStats);
  }

  // ========================================
  // Progress bar animation in AI demo
  // ========================================
  const demoObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const bars = entry.target.querySelectorAll('.bar-fill');
        bars.forEach((bar, index) => {
          setTimeout(() => {
            bar.style.width = bar.getAttribute('data-width') || bar.style.width;
            bar.style.transition = 'width 1s ease';
          }, index * 200);
        });
        demoObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  const aiDemo = document.querySelector('.ai-demo');
  if (aiDemo) {
    const bars = aiDemo.querySelectorAll('.bar-fill');
    bars.forEach(bar => {
      const targetWidth = bar.style.width;
      bar.setAttribute('data-width', targetWidth);
      bar.style.width = '0%';
    });
    demoObserver.observe(aiDemo);
  }

  // ========================================
  // Button ripple effect
  // ========================================
  document.querySelectorAll('.btn-primary, .btn-secondary, .btn-outline').forEach(button => {
    button.addEventListener('click', function(e) {
      const ripple = document.createElement('span');
      const rect = this.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      const x = e.clientX - rect.left - size / 2;
      const y = e.clientY - rect.top - size / 2;

      ripple.style.cssText = `
        position: absolute;
        width: ${size}px;
        height: ${size}px;
        left: ${x}px;
        top: ${y}px;
        background: rgba(255, 255, 255, 0.3);
        border-radius: 50%;
        transform: scale(0);
        animation: ripple 0.6s ease-out;
        pointer-events: none;
      `;

      this.style.position = 'relative';
      this.style.overflow = 'hidden';
      this.appendChild(ripple);

      setTimeout(() => ripple.remove(), 600);
    });
  });

  // Ripple animation style
  const rippleStyle = document.createElement('style');
  rippleStyle.textContent = `
    @keyframes ripple {
      to {
        transform: scale(4);
        opacity: 0;
      }
    }
  `;
  document.head.appendChild(rippleStyle);

  // ========================================
  // Parallax effect for floating shapes
  // ========================================
  window.addEventListener('mousemove', function(e) {
    const shapes = document.querySelectorAll('.shape');
    const x = e.clientX / window.innerWidth;
    const y = e.clientY / window.innerHeight;

    shapes.forEach((shape, index) => {
      const speed = (index + 1) * 20;
      const xOffset = (x - 0.5) * speed;
      const yOffset = (y - 0.5) * speed;
      shape.style.transform = `translate(${xOffset}px, ${yOffset}px)`;
    });
  });

  // ========================================
  // Lookbook Modal
  // ========================================
  const lookbookData = {
    'look-1': {
      image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800&q=80',
      tag: 'Spring Essential',
      title: '미니멀 시크',
      desc: '깔끔한 라인과 뉴트럴 컬러로 완성하는 모던 룩. 심플하면서도 세련된 느낌을 주는 스타일로, 어떤 상황에서도 품격 있는 인상을 남길 수 있습니다.',
      items: [
        { icon: '👔', name: '오버사이즈 블레이저' },
        { icon: '👖', name: '와이드 슬랙스' },
        { icon: '👟', name: '화이트 스니커즈' },
        { icon: '👜', name: '미니멀 토트백' }
      ],
      colors: ['#F5F5DC', '#D2B48C', '#8B7355', '#2F2F2F', '#FFFFFF']
    },
    'look-2': {
      image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&q=80',
      tag: 'Trending',
      title: '스트릿 캐주얼',
      desc: '트렌디한 스트릿 감성과 편안한 캐주얼의 조화. 자유롭고 개성 있는 스타일로 일상에서 특별한 존재감을 발휘해보세요.',
      items: [
        { icon: '🧥', name: '오버핏 후드 집업' },
        { icon: '👕', name: '그래픽 티셔츠' },
        { icon: '👖', name: '카고 팬츠' },
        { icon: '👟', name: '청키 스니커즈' }
      ],
      colors: ['#1A1A1A', '#4A4A4A', '#FF6B35', '#FFFFFF', '#7B68EE']
    },
    'look-3': {
      image: 'https://images.unsplash.com/photo-1507680434567-5739c80be1ac?w=800&q=80',
      tag: 'Office',
      title: '비즈니스 캐주얼',
      desc: '전문적이면서도 편안한 오피스 룩. 단정한 인상과 함께 자신감을 높여주는 스타일로 업무 효율도 UP!',
      items: [
        { icon: '👔', name: '슬림핏 셔츠' },
        { icon: '🧥', name: '싱글 자켓' },
        { icon: '👖', name: '슬랙스' },
        { icon: '👞', name: '로퍼' }
      ],
      colors: ['#1E3A5F', '#FFFFFF', '#D4AF37', '#2F4F4F', '#F5F5F5']
    },
    'look-4': {
      image: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=800&q=80',
      tag: 'Weekend',
      title: '릴렉스 핏',
      desc: '주말을 위한 편안하고 스타일리시한 룩. 활동성과 패션을 동시에 잡아주는 캐주얼 스타일입니다.',
      items: [
        { icon: '👕', name: '오버핏 맨투맨' },
        { icon: '👖', name: '와이드 데님' },
        { icon: '🧢', name: '볼캡' },
        { icon: '👟', name: '캔버스 스니커즈' }
      ],
      colors: ['#87CEEB', '#F0F0F0', '#4169E1', '#FFD700', '#FFFFFF']
    },
    'look-5': {
      image: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=800&q=80',
      tag: 'Date',
      title: '로맨틱 무드',
      desc: '특별한 날을 위한 로맨틱하고 우아한 스타일. 부드러운 컬러와 여성스러운 실루엣으로 사랑스러운 분위기를 연출해보세요.',
      items: [
        { icon: '👗', name: '플로럴 원피스' },
        { icon: '🧥', name: '크롭 가디건' },
        { icon: '👠', name: '스트랩 힐' },
        { icon: '👜', name: '미니 크로스백' }
      ],
      colors: ['#FFB6C1', '#FFF0F5', '#DDA0DD', '#FFDAB9', '#FFFFFF']
    }
  };

  const lookbookModal = document.getElementById('lookbook-modal');

  document.querySelectorAll('.btn-look').forEach((btn, index) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const lookKey = `look-${index + 1}`;
      const data = lookbookData[lookKey];

      if (data && lookbookModal) {
        document.getElementById('lookbook-modal-image').style.backgroundImage = `url(${data.image})`;
        document.getElementById('lookbook-modal-tag').textContent = data.tag;
        document.getElementById('lookbook-modal-title').textContent = data.title;
        document.getElementById('lookbook-modal-desc').textContent = data.desc;

        document.getElementById('lookbook-modal-items').innerHTML = data.items.map(item =>
          `<div class="lookbook-item">
            <div class="lookbook-item-icon">${item.icon}</div>
            <span>${item.name}</span>
          </div>`
        ).join('');

        document.getElementById('lookbook-modal-colors').innerHTML =
          `<div class="lookbook-palette">${data.colors.map(color =>
            `<div class="lookbook-color" style="background: ${color}" title="${color}"></div>`
          ).join('')}</div>`;

        lookbookModal.classList.add('active');
        document.body.style.overflow = 'hidden';
      }
    });
  });

  // Lookbook try button
  document.querySelector('.lookbook-try-btn')?.addEventListener('click', () => {
    if (lookbookModal) {
      lookbookModal.classList.remove('active');
      document.body.style.overflow = '';
    }
    openStylingModal();
  });

  // ========================================
  // Info Modal (Footer Links)
  // ========================================
  const infoModalData = {
    'ai-styling': {
      icon: '✨',
      title: 'AI 스타일링',
      content: `
        <h3>AI 스타일링이란?</h3>
        <p>SIMS Fashion AI의 핵심 기능으로, 인공지능이 당신의 체형, 피부톤, 선호도를 분석하여 최적의 스타일을 추천해드립니다.</p>
        <div class="highlight-box">
          <strong>주요 기능</strong>
          <ul>
            <li>체형 분석 및 맞춤 실루엣 추천</li>
            <li>퍼스널 컬러 진단</li>
            <li>TPO별 코디 추천</li>
            <li>매일 새로운 스타일 제안</li>
          </ul>
        </div>
        <h3>어떻게 작동하나요?</h3>
        <p>간단한 설문과 사진 분석을 통해 AI가 당신의 스타일 DNA를 파악합니다.</p>
      `
    },
    'personal-color': {
      icon: '🎨',
      title: '퍼스널 컬러',
      content: `
        <h3>퍼스널 컬러란?</h3>
        <p>개인의 피부톤, 눈동자, 머리카락 색상에 가장 잘 어울리는 색상 그룹을 말합니다.</p>
        <h3>4계절 퍼스널 컬러</h3>
        <div class="highlight-box">
          <p><strong>🌸 봄 웜톤:</strong> 밝고 화사한 컬러</p>
          <p><strong>☀️ 여름 쿨톤:</strong> 부드럽고 시원한 컬러</p>
          <p><strong>🍂 가을 웜톤:</strong> 깊고 따뜻한 컬러</p>
          <p><strong>❄️ 겨울 쿨톤:</strong> 선명하고 차가운 컬러</p>
        </div>
      `
    },
    'virtual-fitting': {
      icon: '👗',
      title: '가상 피팅',
      content: `
        <h3>AR 가상 피팅</h3>
        <p>옷을 직접 입어보지 않고도 AR 기술로 실제 착용 모습을 미리 확인할 수 있습니다.</p>
        <div class="highlight-box">
          <strong>Coming Soon</strong>
          <p>가상 피팅 기능은 2026년 상반기 출시 예정입니다.</p>
        </div>
      `
    },
    'pricing': {
      icon: '💰',
      title: '가격 정책',
      content: `
        <h3>요금제 안내</h3>
        <table class="pricing-table">
          <tr><th>플랜</th><th>가격</th><th>기능</th></tr>
          <tr><td><strong>Free</strong></td><td>무료</td><td>기본 스타일 분석, AI 챗봇</td></tr>
          <tr><td><strong>Pro</strong></td><td>₩9,900/월</td><td>무제한 분석, 맞춤 코디</td></tr>
          <tr><td><strong>Premium</strong></td><td>₩19,900/월</td><td>Pro + 1:1 스타일리스트 상담</td></tr>
        </table>
      `
    },
    'blog': {
      icon: '📝',
      title: 'Blog',
      content: `
        <h3>최신 패션 트렌드</h3>
        <div class="blog-post">
          <div class="blog-thumb" style="background-image: url('https://images.unsplash.com/photo-1483985988355-763728e1935b?w=200&q=80')"></div>
          <div class="blog-info">
            <h4>2026 S/S 트렌드 총정리</h4>
            <p>올해 봄여름 시즌 꼭 알아야 할 패션 키워드</p>
            <span>2026.02.01</span>
          </div>
        </div>
      `
    },
    'careers': {
      icon: '💼',
      title: 'Careers',
      content: `
        <h3>SIMS Fashion AI와 함께하세요</h3>
        <div class="job-card">
          <h4>AI Engineer</h4>
          <p>컴퓨터 비전 및 추천 시스템 개발</p>
          <div class="job-tags"><span class="job-tag">Python</span><span class="job-tag">PyTorch</span></div>
        </div>
        <div class="job-card">
          <h4>Frontend Developer</h4>
          <p>React 기반 웹/앱 서비스 개발</p>
          <div class="job-tags"><span class="job-tag">React</span><span class="job-tag">TypeScript</span></div>
        </div>
      `
    },
    'press': {
      icon: '📰',
      title: 'Press',
      content: `
        <h3>보도자료</h3>
        <div class="highlight-box">
          <strong>SIMS Fashion AI, 시리즈 A 투자 유치</strong>
          <p>50억원 규모 투자 유치로 글로벌 진출 가속화</p>
        </div>
        <p>미디어 문의: press@simsfashion.ai</p>
      `
    },
    'help': {
      icon: '❓',
      title: 'Help Center',
      content: `
        <h3>자주 묻는 질문</h3>
        <div class="highlight-box">
          <strong>Q. 퍼스널 컬러 진단은 어떻게 하나요?</strong>
          <p>A. AI 스타일링 시작하기 버튼을 클릭하여 간단한 설문을 진행하시면 됩니다.</p>
        </div>
        <div class="highlight-box">
          <strong>Q. 무료로 이용할 수 있나요?</strong>
          <p>A. 기본 기능은 무료로 제공됩니다.</p>
        </div>
      `
    },
    'contact': {
      icon: '📧',
      title: 'Contact',
      content: `
        <h3>문의하기</h3>
        <div class="contact-item"><span>📧</span><div><strong>이메일</strong><p>support@simsfashion.ai</p></div></div>
        <div class="contact-item"><span>📞</span><div><strong>전화</strong><p>02-1234-5678</p></div></div>
        <div class="contact-item"><span>📍</span><div><strong>주소</strong><p>서울특별시 강남구 테헤란로 123</p></div></div>
      `
    },
    'privacy': {
      icon: '🔒',
      title: 'Privacy Policy',
      content: `
        <h3>개인정보 처리방침</h3>
        <p>SIMS Fashion AI는 이용자의 개인정보를 중요시하며, 개인정보보호법을 준수합니다.</p>
        <h3>수집하는 개인정보</h3>
        <ul><li>필수: 이메일, 닉네임</li><li>선택: 성별, 연령대, 체형 정보</li></ul>
      `
    },
    'terms': {
      icon: '📋',
      title: 'Terms of Service',
      content: `
        <h3>이용약관</h3>
        <p>본 약관은 SIMS Fashion AI가 제공하는 서비스의 이용과 관련하여 회사와 회원 간의 권리, 의무 및 책임사항을 규정함을 목적으로 합니다.</p>
        <div class="highlight-box">
          <strong>문의</strong>
          <p>약관에 대한 문의는 support@simsfashion.ai로 연락주세요.</p>
        </div>
      `
    }
  };

  const infoModal = document.getElementById('info-modal');

  document.querySelectorAll('[data-modal]').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const modalKey = link.dataset.modal;
      const data = infoModalData[modalKey];

      if (data && infoModal) {
        document.getElementById('info-modal-icon').textContent = data.icon;
        document.getElementById('info-modal-title').textContent = data.title;
        document.getElementById('info-modal-body').innerHTML = data.content;

        infoModal.classList.add('active');
        document.body.style.overflow = 'hidden';
      }
    });
  });

  // Close modals
  document.querySelectorAll('[data-close-modal]').forEach(btn => {
    btn.addEventListener('click', () => {
      if (lookbookModal) lookbookModal.classList.remove('active');
      if (infoModal) infoModal.classList.remove('active');
      document.body.style.overflow = '';
    });
  });

  // Close on backdrop click
  [lookbookModal, infoModal].forEach(modal => {
    if (modal) {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          modal.classList.remove('active');
          document.body.style.overflow = '';
        }
      });
    }
  });

  // ========================================
  // AI Styling Modal
  // ========================================
  const stylingModal = document.getElementById('styling-modal');
  const stylingClose = document.getElementById('styling-close');
  const progressFill = document.getElementById('progress-fill');
  const progressSteps = document.querySelectorAll('.progress-step');

  // User data storage
  let stylingData = {
    gender: null,
    age: null,
    body: null,
    styles: [],
    skinTone: null,
    undertone: null,
    facePhoto: null,
    height: null,
    weight: null,
    bmi: null,
    selectedGarment: null,
    selectedGarmentBuyUrl: null,
    selectedGarmentName: null
  };

  let currentStep = 1;

  // ========================================
  // 취향 학습 (Taste Learning)
  // ========================================
  var TASTE_STORAGE_KEY = 'sims_taste_preferences';

  function getTastePreferences() {
    try {
      var raw = localStorage.getItem(TASTE_STORAGE_KEY);
      return raw ? JSON.parse(raw) : { likedStyles: [], savedOutfits: [] };
    } catch (e) {
      return { likedStyles: [], savedOutfits: [] };
    }
  }

  function saveTasteLike(outfitType, data) {
    var prefs = getTastePreferences();
    var entry = { type: outfitType, data: data || {}, at: new Date().toISOString() };
    prefs.savedOutfits.push(entry);
    if (entry.data.styles && entry.data.styles.length) {
      entry.data.styles.forEach(function (s) {
        if (prefs.likedStyles.indexOf(s) === -1) prefs.likedStyles.push(s);
      });
    }
    try {
      localStorage.setItem(TASTE_STORAGE_KEY, JSON.stringify(prefs));
    } catch (e) {}
    return prefs;
  }

  function getPreferredStylesForPrompt() {
    var prefs = getTastePreferences();
    var list = prefs.likedStyles || [];
    if (list.length === 0) return '';
    return 'User preferred styles (prioritize when possible): ' + list.slice(0, 6).join(', ') + '.';
  }

  function showTasteToast(message) {
    var el = document.createElement('div');
    el.className = 'taste-toast';
    el.textContent = message;
    document.body.appendChild(el);
    setTimeout(function () { el.classList.add('show'); }, 10);
    setTimeout(function () {
      el.classList.remove('show');
      setTimeout(function () { el.remove(); }, 300);
    }, 2000);
  }

  // Open modal function
  function openStylingModal() {
    if (stylingModal) {
      stylingModal.classList.add('active');
      document.body.style.overflow = 'hidden';
    }
  }

  function closeStylingModal() {
    if (stylingModal) {
      stylingModal.classList.remove('active');
      document.body.style.overflow = '';
    }
  }

  // Open modal buttons
  document.querySelectorAll('.btn-primary').forEach(btn => {
    const text = btn.textContent || btn.innerText;
    if (text.includes('시작') || text.includes('스타일링')) {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        openStylingModal();
      });
    }
  });

  if (stylingClose) {
    stylingClose.addEventListener('click', closeStylingModal);
  }

  if (stylingModal) {
    stylingModal.addEventListener('click', (e) => {
      if (e.target === stylingModal) closeStylingModal();
    });
  }

  // Option selection handlers
  document.querySelectorAll('.option-card').forEach(card => {
    card.addEventListener('click', () => {
      const field = card.dataset.field;
      const value = card.dataset.value;

      card.parentElement.querySelectorAll('.option-card').forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');

      if (field && value) {
        stylingData[field] = value;
      }
    });
  });

  // Style card selection (multiple)
  document.querySelectorAll('.style-card[data-style]').forEach(card => {
    card.addEventListener('click', () => {
      card.classList.toggle('selected');

      const style = card.dataset.style;
      if (card.classList.contains('selected')) {
        if (!stylingData.styles.includes(style)) {
          stylingData.styles.push(style);
        }
      } else {
        stylingData.styles = stylingData.styles.filter(s => s !== style);
      }
    });
  });

  // Color option selection
  document.querySelectorAll('.color-option').forEach(option => {
    option.addEventListener('click', () => {
      const field = option.dataset.field;
      option.parentElement.querySelectorAll('.color-option').forEach(o => o.classList.remove('selected'));
      option.classList.add('selected');
      if (field) {
        stylingData[field] = option.dataset.value;
      }
    });
  });

  // Undertone card selection
  document.querySelectorAll('.undertone-card').forEach(card => {
    card.addEventListener('click', () => {
      document.querySelectorAll('.undertone-card').forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
      if (card.dataset.field) {
        stylingData[card.dataset.field] = card.dataset.value;
      }
    });
  });

  // Navigation
  function goToStep(step) {
    currentStep = step;

    if (progressFill) {
      // 6 steps: each step is 16.67%
      progressFill.style.width = `${step * 16.67}%`;
    }

    progressSteps.forEach((s, i) => {
      s.classList.remove('active', 'completed');
      if (i + 1 < step) s.classList.add('completed');
      if (i + 1 === step) s.classList.add('active');
    });

    document.querySelectorAll('.styling-step').forEach(s => s.classList.remove('active'));
    const stepEl = document.getElementById(`step-${step}`);
    if (stepEl) {
      stepEl.classList.add('active');
    }

    if (step === 5) {
      startAIAnalysis();
      if (stylingData.facePhoto) {
        setTimeout(function () { generateFashionImage(); }, 100);
      }
      var naverBtn = document.getElementById('naver-shop-btn');
      if (naverBtn) {
        var styleMap = { minimal: '미니멀', casual: '캐주얼', street: '스트릿', romantic: '로맨틱', classic: '클래식', sporty: '스포티' };
        var q = (stylingData.styles && stylingData.styles.length) ? stylingData.styles.map(function (s) { return styleMap[s] || s; }).join(' ') + ' 패션' : '패션 코디';
        naverBtn.href = 'https://search.naver.com/search.naver?query=' + encodeURIComponent(q);
      }
    }

    if (step === 6) {
      loadUserPhotoForTryOn();
    }
  }

  // Navigation buttons - Updated for 6 steps
  document.getElementById('next-1')?.addEventListener('click', () => goToStep(2));
  document.getElementById('prev-2')?.addEventListener('click', () => goToStep(1));
  document.getElementById('next-2')?.addEventListener('click', () => goToStep(3));
  document.getElementById('prev-3')?.addEventListener('click', () => goToStep(2));
  document.getElementById('next-3')?.addEventListener('click', () => goToStep(4));
  document.getElementById('prev-4')?.addEventListener('click', () => goToStep(3));
  document.getElementById('next-4')?.addEventListener('click', () => goToStep(5));
  document.getElementById('go-to-tryon')?.addEventListener('click', () => goToStep(6));
  document.getElementById('prev-6')?.addEventListener('click', () => goToStep(5));
  document.getElementById('finish-styling')?.addEventListener('click', () => {
    closeStylingModal();
    showSaveNotification();
  });

  // Retry button
  document.getElementById('retry-analysis')?.addEventListener('click', () => {
    const loadingEl = document.getElementById('analysis-loading');
    const resultEl = document.getElementById('analysis-result');
    if (loadingEl) loadingEl.style.display = 'flex';
    if (resultEl) resultEl.style.display = 'none';
    startAIAnalysis();
  });

  // Save result button: save profile + download generated image to device (PC/mobile)
  document.getElementById('save-result')?.addEventListener('click', function () {
    var fashionImg = document.getElementById('generated-fashion-image');
    if (fashionImg && fashionImg.src && fashionImg.src.startsWith('data:')) {
      downloadImage(fashionImg.src, 'sims-fashion-result-' + Date.now() + '.png');
    }

    var resultData = {
      timestamp: new Date().toISOString(),
      userData: stylingData,
      personalColor: document.getElementById('personal-color-result')?.innerHTML,
      style: document.getElementById('style-result')?.innerHTML,
      recommendations: document.getElementById('recommendation-result')?.innerHTML,
      tips: document.getElementById('tips-result')?.innerHTML
    };

    var savedResults = JSON.parse(localStorage.getItem('sims_style_results') || '[]');
    savedResults.push(resultData);
    localStorage.setItem('sims_style_results', JSON.stringify(savedResults));

    showSaveNotification();
  });

  function showSaveNotification() {
    const notification = document.createElement('div');
    notification.className = 'save-notification';
    notification.innerHTML = `
      <div class="notification-content">
        <span class="notification-icon">✅</span>
        <div>
          <strong>저장 완료!</strong>
          <p>스타일 프로필이 저장되었습니다.</p>
        </div>
      </div>
    `;
    document.body.appendChild(notification);

    setTimeout(() => notification.classList.add('show'), 100);
    setTimeout(() => {
      notification.classList.remove('show');
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  }

  // ========================================
  // Step 2: Body Measurement Handlers
  // ========================================
  const photoUploadArea = document.getElementById('photo-upload-area');
  const facePhotoInput = document.getElementById('face-photo-input');
  const uploadPlaceholder = document.getElementById('upload-placeholder');
  const photoPreview = document.getElementById('photo-preview');
  const previewImage = document.getElementById('preview-image');
  const photoRemoveBtn = document.getElementById('photo-remove-btn');
  const heightInput = document.getElementById('height-input');
  const weightInput = document.getElementById('weight-input');
  const bmiPreview = document.getElementById('bmi-preview');

  // Photo upload click handler
  photoUploadArea?.addEventListener('click', (e) => {
    if (e.target.closest('#photo-remove-btn')) return;
    facePhotoInput?.click();
  });

  // Photo file input change
  facePhotoInput?.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        stylingData.facePhoto = event.target.result;
        if (previewImage) previewImage.src = event.target.result;
        if (uploadPlaceholder) uploadPlaceholder.style.display = 'none';
        if (photoPreview) photoPreview.style.display = 'block';
      };
      reader.readAsDataURL(file);
    }
  });

  // Photo remove button
  photoRemoveBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    stylingData.facePhoto = null;
    if (facePhotoInput) facePhotoInput.value = '';
    if (previewImage) previewImage.src = '';
    if (uploadPlaceholder) uploadPlaceholder.style.display = 'flex';
    if (photoPreview) photoPreview.style.display = 'none';
  });

  // BMI Calculation
  function calculateBMI() {
    const height = parseFloat(heightInput?.value);
    const weight = parseFloat(weightInput?.value);

    if (height && weight && height > 0 && weight > 0) {
      const heightM = height / 100;
      const bmi = weight / (heightM * heightM);
      stylingData.height = height;
      stylingData.weight = weight;
      stylingData.bmi = bmi.toFixed(1);

      // Update BMI display
      const bmiNumber = document.getElementById('bmi-number');
      const bmiCategory = document.getElementById('bmi-category');
      const bmiDescription = document.getElementById('bmi-description');

      if (bmiNumber) bmiNumber.textContent = stylingData.bmi;

      let category, description;
      if (bmi < 18.5) {
        category = '저체중';
        description = '슬림한 체형에 맞는 핏감 있는 스타일을 추천드려요';
      } else if (bmi < 23) {
        category = '정상';
        description = '다양한 스타일을 시도해볼 수 있는 균형 잡힌 체형이에요';
      } else if (bmi < 25) {
        category = '과체중';
        description = '체형을 살리면서 편안한 핏의 스타일을 추천드려요';
      } else {
        category = '비만';
        description = '세로 라인을 강조하는 스타일이 잘 어울려요';
      }

      if (bmiCategory) bmiCategory.textContent = category;
      if (bmiDescription) bmiDescription.textContent = description;
      if (bmiPreview) bmiPreview.style.display = 'block';
    }
  }

  heightInput?.addEventListener('input', calculateBMI);
  weightInput?.addEventListener('input', calculateBMI);

  // ========================================
  // Step 6: Virtual Try-On Handlers
  // ========================================
  var SHOP_SEARCH_BASE = 'https://search.naver.com/search.naver?query=';
  const sampleGarments = {
    tops: [
      { id: 't1', name: '화이트 셔츠', image: 'https://images.unsplash.com/photo-1598032895397-b9472444bf93?w=300&q=80', buyUrl: SHOP_SEARCH_BASE + encodeURIComponent('화이트 셔츠') },
      { id: 't2', name: '스트라이프 티', image: 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=300&q=80', buyUrl: SHOP_SEARCH_BASE + encodeURIComponent('스트라이프 티') },
      { id: 't3', name: '오버핏 후드', image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=300&q=80', buyUrl: SHOP_SEARCH_BASE + encodeURIComponent('오버핏 후드') },
      { id: 't4', name: '니트 스웨터', image: 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=300&q=80', buyUrl: SHOP_SEARCH_BASE + encodeURIComponent('니트 스웨터') }
    ],
    bottoms: [
      { id: 'b1', name: '슬림 데님', image: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=300&q=80', buyUrl: SHOP_SEARCH_BASE + encodeURIComponent('슬림 데님 청바지') },
      { id: 'b2', name: '와이드 슬랙스', image: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=300&q=80', buyUrl: SHOP_SEARCH_BASE + encodeURIComponent('와이드 슬랙스') },
      { id: 'b3', name: '카고 팬츠', image: 'https://images.unsplash.com/photo-1517438476312-10d79c077509?w=300&q=80', buyUrl: SHOP_SEARCH_BASE + encodeURIComponent('카고 팬츠') }
    ],
    dresses: [
      { id: 'd1', name: '플로럴 원피스', image: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=300&q=80', buyUrl: SHOP_SEARCH_BASE + encodeURIComponent('플로럴 원피스') },
      { id: 'd2', name: '셔츠 원피스', image: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=300&q=80', buyUrl: SHOP_SEARCH_BASE + encodeURIComponent('셔츠 원피스') }
    ],
    outerwear: [
      { id: 'o1', name: '트렌치코트', image: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=300&q=80', buyUrl: SHOP_SEARCH_BASE + encodeURIComponent('트렌치코트') },
      { id: 'o2', name: '레더 자켓', image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=300&q=80', buyUrl: SHOP_SEARCH_BASE + encodeURIComponent('레더 자켓') },
      { id: 'o3', name: '패딩 점퍼', image: 'https://images.unsplash.com/photo-1544923246-77307dd628b1?w=300&q=80', buyUrl: SHOP_SEARCH_BASE + encodeURIComponent('패딩 점퍼') }
    ]
  };

  let currentCategory = 'tops';

  // Category tab click handler
  document.querySelectorAll('.category-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.category-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      currentCategory = tab.dataset.category;
      loadGarmentGallery(currentCategory);
    });
  });

  // Load garment gallery (원클릭 쇼핑: 구매하기 링크 포함)
  function loadGarmentGallery(category) {
    const gallery = document.getElementById('garment-gallery');
    if (!gallery) return;

    const garments = sampleGarments[category] || [];
    gallery.innerHTML = garments.map(function (g) {
      var buyUrl = g.buyUrl || (SHOP_SEARCH_BASE + encodeURIComponent(g.name));
      return '<div class="garment-item" data-id="' + g.id + '" data-image="' + g.image + '" data-name="' + (g.name || '') + '" data-buy-url="' + (buyUrl || '') + '">' +
        '<img src="' + g.image + '" alt="' + g.name + '">' +
        '<span>' + g.name + '</span>' +
        '<a href="' + buyUrl + '" target="_blank" rel="noopener noreferrer" class="garment-buy-btn" onclick="event.stopPropagation()">구매하기</a>' +
        '</div>';
    }).join('');

    gallery.querySelectorAll('.garment-item').forEach(function (item) {
      item.addEventListener('click', function () {
        gallery.querySelectorAll('.garment-item').forEach(function (i) { i.classList.remove('selected'); });
        item.classList.add('selected');
        stylingData.selectedGarment = item.dataset.image;
        stylingData.selectedGarmentBuyUrl = item.dataset.buyUrl || '';
        stylingData.selectedGarmentName = item.dataset.name || '';
        document.getElementById('generate-tryon-btn')?.removeAttribute('disabled');
      });
    });
  }

  // Initialize garment gallery
  loadGarmentGallery('tops');

  // Garment upload handler
  const garmentInput = document.getElementById('garment-input');
  document.getElementById('upload-garment-btn')?.addEventListener('click', () => {
    garmentInput?.click();
  });

  garmentInput?.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        stylingData.selectedGarment = event.target.result;
        stylingData.selectedGarmentBuyUrl = null;
        stylingData.selectedGarmentName = null;
        document.querySelectorAll('.garment-item').forEach(i => i.classList.remove('selected'));
        document.getElementById('generate-tryon-btn')?.removeAttribute('disabled');

        // Show uploaded garment indicator
        const gallery = document.getElementById('garment-gallery');
        const existingUpload = gallery?.querySelector('.uploaded-garment');
        if (existingUpload) existingUpload.remove();

        const uploadedItem = document.createElement('div');
        uploadedItem.className = 'garment-item uploaded-garment selected';
        uploadedItem.innerHTML = `
          <img src="${event.target.result}" alt="Uploaded garment">
          <span>내 의류</span>
        `;
        gallery?.prepend(uploadedItem);
      };
      reader.readAsDataURL(file);
    }
  });

  // Load user photo for Try-On
  function loadUserPhotoForTryOn() {
    const tryonOriginal = document.getElementById('tryon-original');
    if (tryonOriginal && stylingData.facePhoto) {
      tryonOriginal.innerHTML = `<img src="${stylingData.facePhoto}" alt="User photo">`;
    }
  }

  // ========================================
  // Gemini Fashion Image Generation
  // ========================================
  document.getElementById('generate-fashion-btn')?.addEventListener('click', generateFashionImage);
  document.getElementById('regenerate-fashion-btn')?.addEventListener('click', generateFashionImage);
  document.getElementById('taste-like-fashion-btn')?.addEventListener('click', function () {
    saveTasteLike('fashion', { styles: stylingData.styles.slice(), gender: stylingData.gender, body: stylingData.body });
    showTasteToast('취향에 반영했어요. 다음 추천에 반영됩니다.');
  });

  async function generateFashionImage() {
    const placeholder = document.getElementById('fashion-image-placeholder');
    const resultContainer = document.getElementById('fashion-image-result');
    const generatedImage = document.getElementById('generated-fashion-image');

    if (!stylingData.facePhoto) {
      alert('나의 얼굴을 기반으로 전신 코디를 그리려면 Step 2에서 얼굴 사진을 먼저 업로드해주세요.');
      return;
    }

    if (placeholder) {
      placeholder.innerHTML = `
        <div class="loading-spinner"></div>
        <p>나의 얼굴과 키·몸무게로 전신 코디 이미지를 생성하고 있습니다...</p>
      `;
    }

    try {
      const useFaceAndBody = !!(stylingData.height || stylingData.weight);
      const prompt = buildFashionPrompt(useFaceAndBody, false);
      const faceResized = await compressFacePhoto(stylingData.facePhoto, 768);
      let imageBase64 = null;
      try {
        imageBase64 = await callGeminiImageGeneration(prompt, faceResized);
      } catch (firstErr) {
        console.warn('Face+image request failed, retrying text-only:', firstErr.message);
        imageBase64 = await callGeminiImageGeneration(buildFashionPrompt(useFaceAndBody, true), null);
      }

      if (imageBase64 && generatedImage) {
        generatedImage.src = `data:image/png;base64,${imageBase64}`;
        if (placeholder) placeholder.style.display = 'none';
        if (resultContainer) resultContainer.style.display = 'block';
      }
    } catch (error) {
      console.error('Fashion image generation error:', error);
      const errMsg = (error && error.message) ? String(error.message) : '';
      if (placeholder) {
        placeholder.innerHTML = `
          <div class="placeholder-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
              <circle cx="8.5" cy="8.5" r="1.5"/>
              <polyline points="21 15 16 10 5 21"/>
            </svg>
          </div>
          <p>이미지 생성에 실패했습니다. 다시 시도해주세요.</p>
          ${errMsg ? '<p class="fashion-error-detail">' + escapeHtml(errMsg) + '</p>' : ''}
          <button type="button" class="btn-generate-fashion" id="generate-fashion-btn">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
            </svg>
            다시 시도
          </button>
        `;
        document.getElementById('generate-fashion-btn')?.addEventListener('click', generateFashionImage);
      }
    }
  }

  var FASHION_PROMPT_FIXED = 'CRITICAL STYLE RULES (always follow): Photorealistic only. Do NOT draw cartoon, illustration, anime, comic, or manhwa style. Output must look like a real photograph taken by a professional fashion photographer. As if a professional fashion AI coordinator styled and dressed the person for a real photoshoot: natural skin texture, real fabric and lighting, soft shadows, consistent quality. Maintain real-photo image quality and style in every generation.';

  function buildFashionPrompt(useFaceAndBody, textOnly) {
    const genderMap = { female: '여성', male: '남성', neutral: '젠더리스' };
    const bodyMap = { slim: '슬림한', standard: '보통', muscular: '근육질', curvy: '볼륨감 있는' };
    const styleNames = stylingData.styles.map(s => {
      const map = { minimal: '미니멀', casual: '캐주얼', street: '스트릿', romantic: '로맨틱', classic: '클래식', sporty: '스포티' };
      return map[s] || s;
    }).join(', ');

    var preferredLine = getPreferredStylesForPrompt();
    if (textOnly) {
      var h = stylingData.height || 170;
      var w = stylingData.weight || 65;
      return (preferredLine ? preferredLine + '\n\n' : '') + FASHION_PROMPT_FIXED + '\n\nCreate ONE full-body image (head to toe). Photorealistic photograph of a ' + (genderMap[stylingData.gender] || 'person') + ', ' + (bodyMap[stylingData.body] || 'average') + ' build, height about ' + h + ' cm, weight about ' + w + ' kg. Outfit (professional coordinator recommendation): ' + (styleNames || 'modern casual') + '. Full-body standing pose, natural lighting, real photo quality. One image only.';
    }

    const hasHw = stylingData.height && stylingData.weight;
    var h = stylingData.height || 170;
    var w = stylingData.weight || 65;
    const bmiNum = stylingData.bmi != null
      ? (typeof stylingData.bmi === 'number' ? stylingData.bmi : parseFloat(stylingData.bmi))
      : (w / Math.pow(h / 100, 2));
    const bmi = (!isNaN(bmiNum) ? bmiNum.toFixed(1) : (w / Math.pow(h / 100, 2)).toFixed(1));
    const bodyLine = useFaceAndBody && hasHw
      ? `Body proportions appropriate for height ${h} cm and weight ${w} kg (BMI about ${bmi}).`
      : 'Natural, balanced full-body proportions.';

    var prefLine = getPreferredStylesForPrompt();
    return (prefLine ? prefLine + '\n\n' : '') + FASHION_PROMPT_FIXED + '\n\nThe attached image is this person\'s face. Generate ONE full-body photorealistic photograph (head to toe) that:\n1. Keeps this person\'s face exactly as in the attached photo; blend it seamlessly with the body (same skin tone and texture).\n2. ' + bodyLine + '\n3. They are dressed by a professional fashion coordinator: ' + (styleNames || 'modern casual') + ' style, ' + (genderMap[stylingData.gender] || 'person') + ', ' + (bodyMap[stylingData.body] || 'average') + ' build. Real clothing, real fabric, natural wrinkles and fit.\n4. Full-body standing pose. Professional fashion photography: natural lighting, soft shadows, real-photo quality. One image only. No cartoon, no illustration.';
  }

  function parseDataUrl(dataUrl) {
    if (!dataUrl || typeof dataUrl !== 'string') return null;
    const match = dataUrl.match(/^data:(image\/[a-z]+);base64,(.+)$/i);
    if (!match) return null;
    return { mimeType: match[1], data: match[2] };
  }

  async function callGeminiImageGeneration(prompt, facePhotoDataUrl) {
    const parts = [];
    if (facePhotoDataUrl) {
      const parsed = parseDataUrl(facePhotoDataUrl);
      if (parsed) {
        parts.push({
          inlineData: {
            mimeType: parsed.mimeType,
            data: parsed.data
          }
        });
      }
    }
    parts.push({ text: prompt });

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [{
          parts: parts
        }],
        generationConfig: {
          responseModalities: ["image", "text"],
          responseMimeType: "text/plain"
        }
      })
    });

    const data = await response.json();

    if (data.error) {
      const msg = data.error.message || (typeof data.error === 'string' ? data.error : JSON.stringify(data.error));
      throw new Error(msg);
    }
    if (!response.ok) {
      throw new Error(data.message || `API 오류 (${response.status})`);
    }

    if (data.candidates && data.candidates[0]?.content?.parts) {
      for (const part of data.candidates[0].content.parts) {
        if (part.inlineData?.mimeType?.startsWith('image/')) {
          return part.inlineData.data;
        }
      }
    }

    throw new Error('No image in response');
  }

  function compressFacePhoto(dataUrl, maxSize) {
    maxSize = maxSize || 768;
    return new Promise(function (resolve) {
      const img = new Image();
      img.onload = function () {
        let w = img.width;
        let h = img.height;
        if (w <= maxSize && h <= maxSize) {
          resolve(dataUrl);
          return;
        }
        if (w > h) {
          h = Math.round((h * maxSize) / w);
          w = maxSize;
        } else {
          w = Math.round((w * maxSize) / h);
          h = maxSize;
        }
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, w, h);
        try {
          resolve(canvas.toDataURL('image/jpeg', 0.85));
        } catch (e) {
          resolve(dataUrl);
        }
      };
      img.onerror = function () { resolve(dataUrl); };
      img.src = dataUrl;
    });
  }

  // ========================================
  // Virtual Try-On with HuggingFace IDM-VTON
  // ========================================
  document.getElementById('generate-tryon-btn')?.addEventListener('click', generateVirtualTryOn);

  async function generateVirtualTryOn() {
    const tryonResult = document.getElementById('tryon-result');
    const generateBtn = document.getElementById('generate-tryon-btn');
    const downloadBtn = document.getElementById('download-tryon-btn');

    if (!stylingData.facePhoto) {
      alert('먼저 Step 2에서 사진을 업로드해주세요.');
      return;
    }

    if (!stylingData.selectedGarment) {
      alert('의류를 선택해주세요.');
      return;
    }

    if (generateBtn) {
      generateBtn.disabled = true;
      generateBtn.innerHTML = `
        <div class="loading-spinner-small"></div>
        생성 중...
      `;
    }

    if (tryonResult) {
      tryonResult.innerHTML = '<div class="tryon-loading"><div class="loading-spinner"></div><p>나노 바나나(Gemini)로 Try-On 이미지를 생성하고 있습니다...</p><small>약 10~30초 소요</small></div>';
    }

    try {
      const resultImage = await callGeminiTryOn(stylingData.facePhoto, stylingData.selectedGarment);

      if (tryonResult && resultImage) {
        var buyHtml = stylingData.selectedGarmentBuyUrl
          ? '<a href="' + (stylingData.selectedGarmentBuyUrl || '#') + '" target="_blank" rel="noopener noreferrer" class="btn-tryon-shop">선택한 옷 쇼핑하기</a>'
          : '';
        tryonResult.innerHTML = '<div class="tryon-result-wrap"><img src="' + resultImage + '" alt="Try-On Result"><div class="tryon-result-actions"><button type="button" class="btn-taste-like" id="taste-like-tryon-btn">❤ 이 코디 마음에 들어요</button>' + buyHtml + '</div></div>';
        document.getElementById('taste-like-tryon-btn')?.addEventListener('click', function () {
          saveTasteLike('tryon', { styles: stylingData.styles.slice(), garmentName: stylingData.selectedGarmentName });
          showTasteToast('취향에 반영했어요.');
        });
        if (downloadBtn) {
          downloadBtn.disabled = false;
          downloadBtn.onclick = function () { downloadImage(resultImage, 'virtual-tryon.png'); };
        }
      }
    } catch (error) {
      console.error('Virtual Try-On error:', error);
      if (tryonResult) {
        var errText = (error && error.message) ? String(error.message) : '다시 시도해주세요.';
        tryonResult.innerHTML = '<div class="tryon-error"><p>Virtual Try-On 생성에 실패했습니다.</p><small>' + (typeof escapeHtml === 'function' ? escapeHtml(errText) : errText) + '</small></div>';
      }
    } finally {
      if (generateBtn) {
        generateBtn.disabled = false;
        generateBtn.innerHTML = `
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
          </svg>
          Try-On 생성
        `;
      }
    }
  }

  async function base64ToBlob(base64) {
    const response = await fetch(base64);
    return await response.blob();
  }

  async function fetchImageAsBlob(url) {
    if (url.startsWith('data:')) {
      return await base64ToBlob(url);
    }
    const response = await fetch(url);
    return await response.blob();
  }

  function urlOrDataUrlToImageParts(input) {
    if (!input) return Promise.resolve(null);
    if (typeof input === 'string' && input.startsWith('data:')) {
      return Promise.resolve(parseDataUrl(input));
    }
    return fetch(input)
      .then(function (r) { return r.blob(); })
      .then(function (blob) {
        return new Promise(function (resolve, reject) {
          var fr = new FileReader();
          fr.onload = function () {
            var parsed = parseDataUrl(fr.result);
            resolve(parsed || { mimeType: blob.type || 'image/jpeg', data: null });
          };
          fr.onerror = function () { resolve(null); };
          fr.readAsDataURL(blob);
        });
      })
      .catch(function () { return null; });
  }

  function buildTryOnPrompt() {
    var h = stylingData.height || 170;
    var w = stylingData.weight || 65;
    var bmiNum = stylingData.bmi != null
      ? (typeof stylingData.bmi === 'number' ? stylingData.bmi : parseFloat(stylingData.bmi))
      : (w / Math.pow(h / 100, 2));
    var bmiStr = (!isNaN(bmiNum) ? bmiNum.toFixed(1) : '22');
    var bodyLine = stylingData.height && stylingData.weight
      ? 'Show FULL BODY (head to toe) with body proportions for height ' + h + ' cm and weight ' + w + ' kg (BMI about ' + bmiStr + ').'
      : 'Show FULL BODY (head to toe) with natural, balanced proportions.';
    return 'CRITICAL: Photorealistic only. No cartoon, no illustration.\n' +
      'Image 1: This person\'s face.\n' +
      'Image 2: The garment to try on (may be a top, bottom, dress, or outerwear).\n' +
      'Generate ONE photorealistic FULL-BODY photo (head to toe, 전신). ' + bodyLine + ' ' +
      'Keep this person\'s face exactly as in image 1. Dress them in the garment from image 2: if it is a top, show full body wearing that top with fitting bottom; if it is a bottom, show full body wearing that bottom with fitting top; if dress or outerwear, show full body in that item. ' +
      'Natural fit, natural lighting, professional fashion photo. One image only.';
  }

  async function callGeminiTryOn(faceDataUrl, garmentUrlOrDataUrl) {
    var faceResized = await compressFacePhoto(faceDataUrl, 768);
    var faceParts = parseDataUrl(faceResized);
    var garmentParts = await urlOrDataUrlToImageParts(garmentUrlOrDataUrl);
    if (!faceParts || !faceParts.data) throw new Error('얼굴 이미지를 사용할 수 없습니다.');
    if (!garmentParts || !garmentParts.data) throw new Error('의류 이미지를 불러올 수 없습니다. 다른 의류를 선택하거나 직접 업로드해보세요.');

    var tryOnPrompt = buildTryOnPrompt();
    var parts = [
      { inlineData: { mimeType: faceParts.mimeType, data: faceParts.data } },
      { inlineData: { mimeType: garmentParts.mimeType, data: garmentParts.data } },
      { text: tryOnPrompt }
    ];

    var response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent?key=' + encodeURIComponent(GEMINI_API_KEY), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: parts }],
        generationConfig: { responseModalities: ['image', 'text'], responseMimeType: 'text/plain' }
      })
    });

    var data = await response.json();
    if (data.error) {
      var msg = data.error.message || (typeof data.error === 'string' ? data.error : JSON.stringify(data.error));
      throw new Error(msg);
    }
    if (!response.ok) throw new Error(data.message || 'API 오류 (' + response.status + ')');

    if (data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts) {
      for (var i = 0; i < data.candidates[0].content.parts.length; i++) {
        var part = data.candidates[0].content.parts[i];
        if (part.inlineData && part.inlineData.mimeType && part.inlineData.mimeType.indexOf('image/') === 0) {
          return 'data:image/png;base64,' + part.inlineData.data;
        }
      }
    }
    throw new Error('No image in response');
  }

  async function callIDMVTON(personBlob, garmentBlob) {
    // Legacy HuggingFace path; Try-On now uses Gemini (nano banana) in generateVirtualTryOn
    console.log('Virtual Try-On: IDM-VTON fallback not used');
    return stylingData.facePhoto;
  }

  function downloadImage(dataUrl, filename) {
    if (!dataUrl || !filename) return;
    filename = filename.replace(/[^\w.\-가-힣]/g, '_') || 'download.png';

    function doDownload(href, name) {
      var a = document.createElement('a');
      a.href = href;
      a.download = name;
      a.rel = 'noopener';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }

    try {
      if (dataUrl.startsWith('data:')) {
        var m = dataUrl.match(/^data:([^;]+);base64,(.+)$/);
        if (m) {
          var binary = atob(m[2]);
          var bytes = new Uint8Array(binary.length);
          for (var i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
          var blob = new Blob([bytes], { type: m[1].indexOf('image/') === 0 ? m[1] : 'image/png' });
          var url = URL.createObjectURL(blob);
          doDownload(url, filename);
          setTimeout(function () { URL.revokeObjectURL(url); }, 3000);
          return;
        }
      }
      doDownload(dataUrl, filename);
    } catch (e) {
      doDownload(dataUrl, filename);
    }
  }

  // AI Analysis
  async function startAIAnalysis() {
    const loadingStatus = document.getElementById('loading-status');
    const loadingBar = document.getElementById('loading-bar');

    const statuses = [
      '데이터 수집 중...',
      '체형 분석 중...',
      '퍼스널 컬러 분석 중...',
      '스타일 매칭 중...',
      '추천 생성 중...'
    ];

    for (let i = 0; i < statuses.length; i++) {
      if (loadingStatus) loadingStatus.textContent = statuses[i];
      if (loadingBar) loadingBar.style.width = `${(i + 1) * 20}%`;
      await sleep(600);
    }

    try {
      const result = await getAIStylingRecommendation();
      displayAnalysisResult(result);
    } catch (error) {
      console.error('AI Analysis Error:', error);
      displayAnalysisResult(getDefaultResult());
    }
  }

  function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async function getAIStylingRecommendation() {
    var prompt = `당신은 전문 패션 스타일리스트입니다. 다음 사용자 정보를 바탕으로 맞춤형 스타일링 분석 결과를 JSON 형식으로만 제공해주세요. 다른 설명 없이 JSON만 출력하세요.

사용자 정보:
- 성별: ${stylingData.gender || '미선택'}
- 연령대: ${stylingData.age || '미선택'}
- 체형: ${stylingData.body || '미선택'}
- 선호 스타일: ${stylingData.styles.join(', ') || '미선택'}
- 피부톤: ${stylingData.skinTone || '미선택'}
- 언더톤: ${stylingData.undertone || '미선택'}

다음 JSON 형식으로 정확히 응답해주세요:
{
  "personalColor": {
    "season": "봄웜/여름쿨/가을웜/겨울쿨 중 하나",
    "description": "퍼스널 컬러에 대한 설명",
    "palette": ["#색상코드1", "#색상코드2", "#색상코드3", "#색상코드4", "#색상코드5"]
  },
  "recommendedStyle": {
    "mainStyle": "메인 추천 스타일",
    "subStyles": ["서브 스타일1", "서브 스타일2"],
    "description": "스타일 설명"
  },
  "outfitRecommendations": ["코디 추천 1", "코디 추천 2", "코디 추천 3"],
  "stylingTips": ["스타일링 팁 1", "스타일링 팁 2", "스타일링 팁 3"]
}`;

    var url = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=' + encodeURIComponent(GEMINI_API_KEY);
    var res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { maxOutputTokens: 1000, temperature: 0.7 }
      })
    });
    var data = await res.json().catch(function() { return {}; });
    if (!res.ok) {
      var errMsg = (data.error && data.error.message) ? data.error.message : ('HTTP ' + res.status);
      throw new Error('Gemini: ' + errMsg);
    }
    var text = data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts && data.candidates[0].content.parts[0] && data.candidates[0].content.parts[0].text;
    if (!text) throw new Error('Gemini: no text in response');

    var jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    throw new Error('Invalid JSON response');
  }

  function getDefaultResult() {
    return {
      personalColor: {
        season: "가을웜",
        description: "따뜻하고 깊이 있는 컬러가 잘 어울리는 타입입니다.",
        palette: ["#8B4513", "#D2691E", "#F5DEB3", "#556B2F", "#2F4F4F"]
      },
      recommendedStyle: {
        mainStyle: "미니멀 시크",
        subStyles: ["캐주얼", "클래식"],
        description: "깔끔한 라인과 절제된 디테일이 돋보이는 스타일입니다."
      },
      outfitRecommendations: [
        "베이지 트렌치코트 + 화이트 셔츠 + 슬랙스",
        "카멜 니트 + 데님 팬츠 + 로퍼",
        "올리브 재킷 + 크림 티셔츠 + 치노 팬츠"
      ],
      stylingTips: [
        "골드 액세서리로 포인트를 주세요",
        "어스톤 계열의 컬러를 베이스로 활용하세요",
        "레이어드 스타일링으로 깊이감을 연출하세요"
      ]
    };
  }

  function displayAnalysisResult(result) {
    const loadingEl = document.getElementById('analysis-loading');
    const resultEl = document.getElementById('analysis-result');

    if (loadingEl) loadingEl.style.display = 'none';
    if (resultEl) resultEl.style.display = 'block';

    const seasonClass = result.personalColor.season.includes('봄') ? 'spring' :
                        result.personalColor.season.includes('여름') ? 'summer' :
                        result.personalColor.season.includes('가을') ? 'autumn' : 'winter';

    var primaryKey = getPrimary7Color(result.personalColor.season);
    var music = COLOR_MUSIC[primaryKey] || COLOR_MUSIC.blue;

    const personalColorEl = document.getElementById('personal-color-result');
    if (personalColorEl) {
      personalColorEl.innerHTML = `
        <div class="color-type">
          <span class="color-season ${seasonClass}">${result.personalColor.season}</span>
        </div>
        <p class="personal-color-desc">${result.personalColor.description}</p>
        <div class="recommended-palette">
          ${result.personalColor.palette.map(color => `
            <div class="palette-color" style="background: ${color}" title="${color}"></div>
          `).join('')}
        </div>
      `;
    }

    const moodMusicEl = document.getElementById('mood-music-result');
    if (moodMusicEl) {
      moodMusicEl.style.display = 'block';
      moodMusicEl.innerHTML = `
        <div class="mood-music-zone">
          <div class="mood-music-rainbow"></div>
          <span class="mood-music-badge">SPECIAL</span>
          <h3 class="mood-music-headline">나만의 무드 & 음악</h3>
          <p class="mood-music-tagline">당신만을 위한 특별한 공간</p>
          <div class="mood-music-color-pill">${music.name} 계열</div>
          <p class="mood-music-desc">${music.description}</p>
          <div class="mood-music-actions">
            <a href="${music.directLink}" target="_blank" rel="noopener noreferrer" class="mood-music-btn mood-music-btn-primary">
              <span class="mood-music-btn-icon">♪</span>
              이 무드의 대표 곡 들어보기
            </a>
            <a href="${music.searchLink}" target="_blank" rel="noopener noreferrer" class="mood-music-btn mood-music-btn-secondary">
              <span class="mood-music-btn-icon">▶</span>
              유튜브에서 더 찾아보기
            </a>
          </div>
        </div>
      `;
    }

    const styleResultEl = document.getElementById('style-result');
    if (styleResultEl) {
      styleResultEl.innerHTML = `
        <div class="style-tag">✨ ${result.recommendedStyle.mainStyle}</div>
        <div style="display: flex; gap: 8px; flex-wrap: wrap; margin-top: 8px;">
          ${result.recommendedStyle.subStyles.map(s => `
            <span style="background: var(--bg-tertiary); padding: 6px 12px; border-radius: 8px; font-size: 0.85rem;">${s}</span>
          `).join('')}
        </div>
        <p class="style-description" style="margin-top: 12px;">${result.recommendedStyle.description}</p>
      `;
    }

    const recommendationEl = document.getElementById('recommendation-result');
    if (recommendationEl) {
      recommendationEl.innerHTML = `<ul>${result.outfitRecommendations.map(r => `<li>${r}</li>`).join('')}</ul>`;
    }

    const tipsEl = document.getElementById('tips-result');
    if (tipsEl) {
      tipsEl.innerHTML = `<ul>${result.stylingTips.map(t => `<li>${t}</li>`).join('')}</ul>`;
    }
  }

  // Close on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (lookbookModal) lookbookModal.classList.remove('active');
      if (infoModal) infoModal.classList.remove('active');
      if (stylingModal) stylingModal.classList.remove('active');
      document.body.style.overflow = '';
    }
  });

  // ========================================
  // AI Chat Widget
  // ========================================
  const SYSTEM_PROMPT_BASE = `당신은 SIMS Fashion AI의 전문 AI 스타일리스트입니다. 패션, 스타일링, 코디네이션에 대한 깊은 전문 지식을 갖추고 있습니다.

## 핵심 역할
- 사용자의 개인 스타일을 분석하고 맞춤형 패션 조언 제공
- 퍼스널 컬러, 체형별 스타일링, 트렌드 정보 안내
- 상황별(데이트, 출근, 캐주얼 등) 코디 추천

## 응답 스타일
- 친근하고 전문적인 톤 유지
- 구체적이고 실용적인 조언 제공
- 이모지를 적절히 활용하여 친근감 표현
- 답변은 간결하면서도 핵심을 담아 2-3문단 이내로

사용자의 질문에 맞춰 세련되고 도움이 되는 패션 조언을 제공해주세요.`;

  function getChatUserContext() {
    var prefs = getTastePreferences();
    var lines = ['## [필수] 사용자 취향 데이터 (이 섹션을 반드시 참고하여 답변하세요)'];
    var hasData = false;
    if (prefs.likedStyles && prefs.likedStyles.length > 0) {
      var styleNames = prefs.likedStyles.map(function (s) {
        var map = { minimal: '미니멀', casual: '캐주얼', street: '스트릿', romantic: '로맨틱', classic: '클래식', sporty: '스포티' };
        return map[s] || s;
      }).join(', ');
      lines.push('- 저장된 선호 스타일: ' + styleNames);
      lines.push('- 사용자가 "내 취향 말해줘", "저의 취향을 이야기 해줘" 등으로 물으면 반드시 먼저 "저장된 취향은 [위 스타일]이에요."라고 말한 뒤, 그에 맞는 조언을 이어가세요. "취향을 말해주세요"라고 되물어보지 마세요.');
      hasData = true;
    }
    if (prefs.savedOutfits && prefs.savedOutfits.length > 0) {
      lines.push('- 저장한 코디 수: ' + prefs.savedOutfits.length + '건');
      hasData = true;
    }
    if (!hasData) {
      lines.push('- 현재 저장된 취향 없음 (아직 "이 코디 마음에 들어요"로 저장한 코디가 없음).');
      lines.push('- 사용자가 "내 취향 말해줘", "저의 취향을 이야기 해줘" 등으로 물으면 반드시 이렇게만 답하세요: "아직 저장된 취향이 없어요. 상단에서 AI 스타일링을 진행하시고, 마음에 드는 코디가 나오면 \'이 코디 마음에 들어요\'를 눌러 저장해보세요. 저장하시면 다음부터 그 취향을 기반으로 맞춤 대화를 드릴게요!" 취향을 말해달라고 되물어보지 마세요.');
    }
    return '\n\n' + lines.join('\n');
  }

  let chatHistory = [];
  let isTyping = false;

  // Gemini 2.5 Flash 무료 티어: 10 RPM, 250 RPD (일일 요청 수). 한도 초과 시 자동 차단.
  var CHAT_DAILY_LIMIT = 250;
  var CHAT_QUOTA_KEY = 'sims_chat_quota';

  function getChatQuota() {
    try {
      var raw = localStorage.getItem(CHAT_QUOTA_KEY);
      if (!raw) return { count: 0 };
      var obj = JSON.parse(raw);
      var today = new Date().toDateString();
      if (obj.date !== today) return { count: 0 };
      return { count: Number(obj.count) || 0 };
    } catch (e) { return { count: 0 }; }
  }

  function setChatQuota(count) {
    try {
      localStorage.setItem(CHAT_QUOTA_KEY, JSON.stringify({
        date: new Date().toDateString(),
        count: count
      }));
    } catch (e) {}
  }

  const chatWidget = document.getElementById('chat-widget');
  const chatToggle = document.getElementById('chat-toggle');
  const chatMessages = document.getElementById('chat-messages');
  const chatInput = document.getElementById('chat-input');
  const chatSend = document.getElementById('chat-send');
  const chatMinimize = document.getElementById('chat-minimize');
  const quickBtns = document.querySelectorAll('.quick-btn');

  // Toggle chat widget
  if (chatToggle && chatWidget) {
    chatToggle.addEventListener('click', () => {
      chatWidget.classList.toggle('active');
      if (chatWidget.classList.contains('active') && chatInput) {
        chatInput.focus();
      }
    });
  }

  if (chatMinimize && chatWidget) {
    chatMinimize.addEventListener('click', () => {
      chatWidget.classList.remove('active');
    });
  }

  // Quick question buttons
  quickBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const question = btn.dataset.question;
      if (chatInput && question) {
        chatInput.value = question;
        sendMessage();
      }
    });
  });

  // Auto-resize textarea
  if (chatInput) {
    chatInput.addEventListener('input', () => {
      chatInput.style.height = 'auto';
      chatInput.style.height = Math.min(chatInput.scrollHeight, 120) + 'px';
    });

    chatInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
      }
    });
  }

  if (chatSend) {
    chatSend.addEventListener('click', sendMessage);
    if (getChatQuota().count >= CHAT_DAILY_LIMIT) chatSend.disabled = true;
  }

  async function sendMessage() {
    if (!chatInput || !chatMessages) return;

    const message = chatInput.value.trim();
    if (!message || isTyping) return;

    const welcomeScreen = chatMessages.querySelector('.chat-welcome');
    if (welcomeScreen) {
      welcomeScreen.style.display = 'none';
    }

    addMessage('user', message);
    chatInput.value = '';
    chatInput.style.height = 'auto';

    chatHistory.push({ role: 'user', content: message });

    if (!GEMINI_API_KEY) {
      addMessage('assistant', 'API 키가 설정되지 않았습니다. 프로젝트 루트에 .env 파일에 GEMINI_API_KEY 를 입력한 뒤, 터미널에서 <code>node scripts/build-config.js</code> 를 실행하고 페이지를 새로고침해주세요.');
      isTyping = false;
      if (chatSend) chatSend.disabled = false;
      return;
    }

    var quota = getChatQuota();
    if (quota.count >= CHAT_DAILY_LIMIT) {
      addMessage('assistant', '오늘의 채팅 한도(' + CHAT_DAILY_LIMIT + '회)에 도달했습니다. 내일 다시 이용해 주세요. ☀️');
      if (chatSend) chatSend.disabled = true;
      return;
    }

    setChatQuota(quota.count + 1);

    showTypingIndicator();
    isTyping = true;
    if (chatSend) chatSend.disabled = true;

    try {
      var response = await callGeminiChat(message);
      hideTypingIndicator();
      addMessage('assistant', response);
      chatHistory.push({ role: 'assistant', content: response });
    } catch (error) {
      hideTypingIndicator();
      var errMsg = (error && error.message) ? error.message : String(error);
      var isQuotaError = errMsg === 'QUOTA_LIMIT' || /429|RESOURCE_EXHAUSTED|quota|rate limit/i.test(errMsg);
      if (isQuotaError) {
        setChatQuota(CHAT_DAILY_LIMIT);
        addMessage('assistant', '오늘의 채팅 한도(' + CHAT_DAILY_LIMIT + '회)에 도달했습니다. 내일 다시 이용해 주세요. ☀️');
        if (chatSend) chatSend.disabled = true;
      } else {
        if (errMsg.length > 200) errMsg = errMsg.slice(0, 200) + '…';
        addMessage('assistant', '죄송합니다. 오류가 발생했습니다. 🙏<br><br><small>원인: ' + escapeHtml(errMsg) + '</small>');
      }
      console.error('Chat API Error:', error);
    }

    isTyping = false;
    if (chatSend && getChatQuota().count < CHAT_DAILY_LIMIT) chatSend.disabled = false;
  }

  async function callGeminiChat(userMessage) {
    const contents = [];
    for (const msg of chatHistory.slice(-10)) {
      contents.push({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }]
      });
    }
    var geminiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';
    var systemText = SYSTEM_PROMPT_BASE + getChatUserContext();
    const res = await fetch(geminiUrl + '?key=' + encodeURIComponent(GEMINI_API_KEY), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: systemText }] },
        contents: contents,
        generationConfig: { maxOutputTokens: 500, temperature: 0.8 }
      })
    });
    const data = await res.json().catch(function() { return {}; });
    if (!res.ok) {
      var errMsg = (data.error && data.error.message) ? data.error.message : ('HTTP ' + res.status);
      if (res.status === 429 || (data.error && (data.error.code === 429 || data.error.status === 'RESOURCE_EXHAUSTED'))) {
        throw new Error('QUOTA_LIMIT');
      }
      throw new Error('Gemini: ' + errMsg);
    }
    var text = data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts && data.candidates[0].content.parts[0] && data.candidates[0].content.parts[0].text;
    if (!text) {
      if (data.candidates && data.candidates[0] && data.candidates[0].finishReason) {
        throw new Error('Gemini: finishReason ' + data.candidates[0].finishReason);
      }
      throw new Error('Gemini: no text in response');
    }
    return text;
  }

  function addMessage(role, content) {
    if (!chatMessages) return;

    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${role}`;

    const time = new Date().toLocaleTimeString('ko-KR', {
      hour: '2-digit',
      minute: '2-digit'
    });

    messageDiv.innerHTML = `
      <div class="message-avatar">${role === 'assistant' ? 'AI' : 'ME'}</div>
      <div class="message-content">
        <div class="message-bubble">${formatMessage(content)}</div>
        <span class="message-time">${time}</span>
      </div>
    `;

    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  function escapeHtml(str) {
    var div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  function formatMessage(content) {
    return content
      .replace(/\n/g, '<br>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>');
  }

  function showTypingIndicator() {
    if (!chatMessages) return;

    const typingDiv = document.createElement('div');
    typingDiv.className = 'typing-indicator';
    typingDiv.id = 'typing-indicator';
    typingDiv.innerHTML = `
      <div class="message-avatar">AI</div>
      <div class="typing-dots">
        <span></span>
        <span></span>
        <span></span>
      </div>
    `;
    chatMessages.appendChild(typingDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  function hideTypingIndicator() {
    const typingIndicator = document.getElementById('typing-indicator');
    if (typingIndicator) {
      typingIndicator.remove();
    }
  }

  console.log('SIMS Fashion AI loaded successfully!');
})();
