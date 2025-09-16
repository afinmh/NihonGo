document.addEventListener('DOMContentLoaded', () => {
    // Definisi Variabel Global (tetap sama)
    const startOverlay = document.getElementById('start-overlay');
    const startInteractiveArea = document.getElementById('start-interactive-area');
    const splashScreen = document.getElementById('splash-screen');
    const splashTextElement = document.getElementById('splash-text');
    const splashLogo = document.querySelector('.splash-logo');
    const bgWave = document.querySelector('#main-content .bg-wave');
    const bgOrnament = document.querySelector('#main-content .bg-ornament');
    const centerContent = document.querySelector('.center-start');
    const aboutContent = document.querySelector('.about');
    const topRightLogo = document.getElementById('top-right-logo');
    const mainContent = document.getElementById('main-content');
    const levelSelectScreen = document.getElementById('level-select-screen');
    const startButton = document.getElementById('start-button');
    const aboutButton = document.getElementById('about-button');
    const backToMainButton = document.getElementById('back-to-main-button');
    const backgroundMusic = new Audio('musik-latar.mp3');

    // Fungsi Animasi Awal (tetap sama)
    const textToType = "NihonGo!";
    let charIndex = 0;
    function startTypingAnimation() {
        splashTextElement.style.animation = 'blink-caret .75s step-end infinite';
        function type() {
            if (charIndex < textToType.length) {
                splashTextElement.textContent += textToType.charAt(charIndex);
                charIndex++;
                setTimeout(type, 220);
            } else {
                splashTextElement.style.borderRight = 'none';
                splashTextElement.style.animation = 'none';
                setTimeout(hideSplashScreen, 2100); 
            }
        }
        type();
    }
    function animateMainContent() {
        bgWave.classList.add('animate');
        setTimeout(() => { bgOrnament.classList.add('animate'); }, 400);
        setTimeout(() => { centerContent.classList.add('animate'); }, 900);
        setTimeout(() => { aboutContent.classList.add('animate'); }, 900);
        setTimeout(() => { topRightLogo.classList.add('visible'); }, 1200);
    }
    function hideSplashScreen() {
        splashScreen.classList.add('hidden');
        document.body.style.overflow = 'auto';
        splashScreen.addEventListener('transitionend', () => {
            splashScreen.remove();
            animateMainContent(); 
        }, { once: true });
    }

    // --- LOGIKA UTAMA DIPERBARUI TOTAL ---

    // Fungsi untuk memunculkan Level Select
    const showLevelSelect = () => {
      // Hapus class 'exiting' untuk memastikan state bersih sebelum tampil
      levelSelectScreen.classList.remove('exiting');
      // Tambahkan class 'visible' untuk memicu animasi masuk
      levelSelectScreen.classList.add('visible');
    };

    // Fungsi untuk menyembunyikan Level Select
    const showMainMenu = () => {
      // Tambahkan class 'exiting' untuk memicu animasi keluar (jatuh ke bawah)
      levelSelectScreen.classList.add('exiting');
      // Hapus class 'visible'
      levelSelectScreen.classList.remove('visible');

      // Tambahkan event listener untuk mereset state SETELAH animasi keluar selesai
      const handleTransitionEnd = () => {
        // Hapus class 'exiting' agar kembali ke posisi awal (di atas layar)
        levelSelectScreen.classList.remove('exiting');
        // Hapus event listener ini agar tidak berjalan lagi
        levelSelectScreen.removeEventListener('transitionend', handleTransitionEnd);
      };
      
      levelSelectScreen.addEventListener('transitionend', handleTransitionEnd);
    };

    // --- Event Listeners ---
    startInteractiveArea.addEventListener('click', () => {
        startOverlay.classList.add('hidden');
        backgroundMusic.play();
        setTimeout(() => {
            splashLogo.classList.add('animate');
            setTimeout(startTypingAnimation, 2500); 
        }, 1000);
    }, { once: true });

    startButton.addEventListener('click', showLevelSelect);
    backToMainButton.addEventListener('click', showMainMenu);
});