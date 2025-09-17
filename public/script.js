document.addEventListener('DOMContentLoaded', () => {
    // === Flag Dev Mode ===
    const DEV_MODE = true; // ubah ke false kalau mau splash jalan normal

    // Definisi Variabel Global
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

    // Fungsi Animasi Awal
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

    // Fungsi untuk memunculkan Level Select
    const showLevelSelect = () => {
      levelSelectScreen.classList.remove('exiting');
      levelSelectScreen.classList.add('visible');
    };

    // Fungsi untuk menyembunyikan Level Select
    const showMainMenu = () => {
      levelSelectScreen.classList.add('exiting');
      levelSelectScreen.classList.remove('visible');

      const handleTransitionEnd = () => {
        levelSelectScreen.classList.remove('exiting');
        levelSelectScreen.removeEventListener('transitionend', handleTransitionEnd);
      };
      
      levelSelectScreen.addEventListener('transitionend', handleTransitionEnd);
    };

    // --- Event Listeners ---
    startInteractiveArea.addEventListener('click', () => {
        startOverlay.classList.add('hidden');
        backgroundMusic.play();

        if (DEV_MODE) {
            // Langsung skip splash screen
            hideSplashScreen();
        } else {
            // Jalan normal dengan animasi
            setTimeout(() => {
                splashLogo.classList.add('animate');
                setTimeout(startTypingAnimation, 2500); 
            }, 1000);
        }
    }, { once: true });

    startButton.addEventListener('click', showLevelSelect);
    backToMainButton.addEventListener('click', showMainMenu);
});
