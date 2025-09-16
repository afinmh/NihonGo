document.addEventListener('DOMContentLoaded', () => {
    // --- Definisi Variabel Global ---
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
    
    // Variabel untuk Logika Pergantian Section
    const mainContent = document.getElementById('main-content');
    const levelSelectScreen = document.getElementById('level-select-screen');
    const aboutScreen = document.getElementById('about-screen'); // BARU
    const startButton = document.getElementById('start-button');
    const aboutButton = document.getElementById('about-button');

    // Objek Audio
    const backgroundMusic = new Audio('musik-latar.mp3');

    // --- Fungsi-fungsi Animasi Awal ---
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
        setTimeout(() => {
            topRightLogo.classList.add('visible');
        }, 1200);
    }

    function hideSplashScreen() {
        splashScreen.classList.add('hidden');
        document.body.style.overflow = 'auto';
        splashScreen.addEventListener('transitionend', () => {
            splashScreen.remove();
            animateMainContent(); 
        }, { once: true });
    }

    // --- Fungsi-fungsi Logika UI (Pergantian Section) ---
    const showLevelSelect = () => {
        mainContent.classList.add('hidden');
        levelSelectScreen.classList.remove('hidden');
    };

    const showAboutScreen = () => { // BARU
        mainContent.classList.add('hidden');
        aboutScreen.classList.remove('hidden');
    };

    // --- Event Listeners (Titik Awal & Interaksi) ---
    startInteractiveArea.addEventListener('click', () => {
        startOverlay.classList.add('hidden');
        backgroundMusic.play();
        
        setTimeout(() => {
            splashLogo.classList.add('animate');
            setTimeout(startTypingAnimation, 2500); 
        }, 1000);
    }, { once: true });

    startButton.addEventListener('click', showLevelSelect);
    aboutButton.addEventListener('click', showAboutScreen); // DIUBAH
});