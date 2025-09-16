document.addEventListener('DOMContentLoaded', () => {
    // --- Definisi Variabel ---
    const startOverlay = document.getElementById('start-overlay');
    const startInteractiveArea = document.getElementById('start-interactive-area');
    const splashScreen = document.getElementById('splash-screen');
    const splashTextElement = document.getElementById('splash-text');
    const splashLogo = document.querySelector('.splash-logo');
    const bgWave = document.querySelector('.bg-wave');
    const bgOrnament = document.querySelector('.bg-ornament');
    const centerContent = document.querySelector('.center-start');
    const topRightLogo = document.getElementById('top-right-logo');

    // Buat objek audio untuk musik latar
    const backgroundMusic = new Audio('musik-latar.mp3');

    const textToType = "NihonGo!";
    let charIndex = 0;

    // --- Fungsi-fungsi Animasi ---
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
                // Jeda diatur agar total splash screen 8 detik
                setTimeout(hideSplashScreen, 2100); 
            }
        }
        type();
    }
    
    function animateMainContent() {
        bgWave.classList.add('animate');
        setTimeout(() => { bgOrnament.classList.add('animate'); }, 400);
        setTimeout(() => { centerContent.classList.add('animate'); }, 900);
        setTimeout(() => {
            topRightLogo.classList.add('visible');
        }, 1200); // Jeda agar muncul setelah elemen lain
    }

    function hideSplashScreen() {
        splashScreen.classList.add('hidden');
        document.body.style.overflow = 'auto';
        splashScreen.addEventListener('transitionend', () => {
            splashScreen.remove();
            animateMainContent(); 
        }, { once: true });
    }

    // --- Logika Utama: Menunggu Klik Awal ---
    startInteractiveArea.addEventListener('click', () => {
        // Sembunyikan overlay
        startOverlay.classList.add('hidden');

        // Putar musik
        backgroundMusic.play();
        
        // Jalankan seluruh urutan animasi setelah overlay diklik
        setTimeout(() => {
            splashLogo.classList.add('animate');
            setTimeout(startTypingAnimation, 2500); 
        }, 1000);
    });
});