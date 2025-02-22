// Mobile Menu Toggle
document.addEventListener('DOMContentLoaded', function () {
  const menuToggle = document.querySelector('.mobile-menu-toggle');
  const mobileMenu = document.querySelector('.mobile-menu');

  if (menuToggle && mobileMenu) {
    menuToggle.addEventListener('click', function () {
      menuToggle.classList.toggle('active');
      mobileMenu.classList.toggle('active');
      document.body.style.overflow = mobileMenu.classList.contains('active') ? 'hidden' : '';
    });
  }

  // Close menu when clicking a link
  const mobileMenuLinks = document.querySelectorAll('.mobile-menu__nav-link');
  mobileMenuLinks.forEach((link) => {
    link.addEventListener('click', () => {
      menuToggle.classList.remove('active');
      mobileMenu.classList.remove('active');
      document.body.style.overflow = '';
    });
  });

  // Falling Flowers Animation
  let flowerInterval;
  let activeFlowers = 0;
  const maxFlowers = 4;
  const flowers = ['🌷', '🌸', '🌹', '🌻'];

  function createFlower() {
    if (activeFlowers >= maxFlowers) return;

    const flower = document.createElement('div');
    flower.className = 'falling-flower';
    flower.textContent = flowers[Math.floor(Math.random() * flowers.length)];

    // Random position and rotation
    const startX = Math.random() * (window.innerWidth - 20); // Account for flower size
    const rotation = Math.random() * 360;
    flower.style.left = `${startX}px`;

    // Random duration between 10-15 seconds (slower fall)
    const duration = 20000 + Math.random() * 5000;
    flower.style.animation = `fall ${duration}ms linear forwards`;

    document.body.appendChild(flower);
    activeFlowers++;

    // Remove flower after animation
    setTimeout(() => {
      if (document.body.contains(flower)) {
        document.body.removeChild(flower);
        activeFlowers--;
      }
    }, duration);
  }

  function startFlowerAnimation() {
    // Create initial flowers
    for (let i = 0; i < maxFlowers; i++) {
      setTimeout(() => createFlower(), i * 1000);
    }

    // Create new flowers periodically
    flowerInterval = setInterval(createFlower, 4000 + Math.random() * 2000);
  }

  function stopFlowerAnimation() {
    if (flowerInterval) {
      clearInterval(flowerInterval);
    }
    // Remove all existing flowers
    const flowers = document.querySelectorAll('.falling-flower');
    flowers.forEach((flower) => {
      if (document.body.contains(flower)) {
        document.body.removeChild(flower);
      }
    });
    activeFlowers = 0;
  }

  // Start flower animation immediately
  startFlowerAnimation();
});
