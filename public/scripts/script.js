document.addEventListener('DOMContentLoaded', () => {
    // === Flag Dev Mode ===
    const DEV_MODE = false; // ubah ke true untuk development

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
    const backgroundMusic = new Audio('./assets/musik-latar.mp3');

    // Fungsi Animasi Awal
    const textToType = "NihonGo!";
    let charIndex = 0;
    function startTypingAnimation() {
        if (!splashTextElement) return;
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
        if (bgWave) bgWave.classList.add('animate');
        setTimeout(() => { if (bgOrnament) bgOrnament.classList.add('animate'); }, 400);
        setTimeout(() => { if (centerContent) centerContent.classList.add('animate'); }, 900);
        setTimeout(() => { if (aboutContent) aboutContent.classList.add('animate'); }, 900);
        setTimeout(() => { if (topRightLogo) topRightLogo.classList.add('visible'); }, 1200);
    }

    function hideSplashScreen() {
        if (!splashScreen) return;
        splashScreen.classList.add('hidden');
        document.body.style.overflow = 'auto';
        splashScreen.addEventListener('transitionend', () => {
            splashScreen.remove();
            animateMainContent();
        }, { once: true });
    }

    const showLevelSelect = () => {
        if (levelSelectScreen) {
            levelSelectScreen.classList.remove('exiting');
            levelSelectScreen.classList.add('visible');
        }
    };
    
    const showMainMenu = () => {
        if (levelSelectScreen) {
            levelSelectScreen.classList.add('exiting');
            levelSelectScreen.classList.remove('visible');
            const handleTransitionEnd = () => {
                levelSelectScreen.classList.remove('exiting');
                levelSelectScreen.removeEventListener('transitionend', handleTransitionEnd);
            };
            levelSelectScreen.addEventListener('transitionend', handleTransitionEnd);
        }
    };

    // --- LOGIKA UTAMA ---
    // Cek apakah pengguna baru kembali dari halaman lain
    const isReturning = sessionStorage.getItem('isReturning') === 'true';

    if (isReturning) {
        // --- Alur Saat Kembali ke Halaman ---
        // 1. Hapus flag agar refresh berfungsi normal
        sessionStorage.removeItem('isReturning');

        // 2. Hapus overlay dan splash screen secara langsung
        if (startOverlay) startOverlay.remove();
        if (splashScreen) splashScreen.remove();
        
        // 3. Tampilkan konten utama dan langsung buka pemilihan level
        document.body.style.overflow = 'auto';
        if (bgWave) bgWave.classList.add('animate');
        if (bgOrnament) bgOrnament.classList.add('animate');
        if (centerContent) centerContent.classList.add('animate');
        if (aboutContent) aboutContent.classList.add('animate');
        if (topRightLogo) topRightLogo.classList.add('visible');
        showLevelSelect();

    } else {
        // --- Alur Normal (Kunjungan Pertama atau Refresh) ---
        if (startInteractiveArea && startOverlay) {
            startInteractiveArea.addEventListener('click', () => {
                startOverlay.classList.add('hidden');
                
                // PERUBAHAN 1: Musik hanya jalan jika DEV_MODE false
                if (!DEV_MODE) {
                    backgroundMusic.play().catch(e => console.error("Autoplay music failed:", e));
                }

                if (DEV_MODE) {
                    hideSplashScreen();
                } else {
                    setTimeout(() => {
                        if (splashLogo) splashLogo.classList.add('animate');
                        setTimeout(startTypingAnimation, 2500);
                    }, 1000);
                }
            }, { once: true });
        }
    }

    // --- Event Listeners yang selalu aktif ---
    if (startButton) startButton.addEventListener('click', showLevelSelect);
    if (backToMainButton) backToMainButton.addEventListener('click', showMainMenu);

    // === Model Selection Modal Logic ===
    const modelButton = document.getElementById('model-button');
    const modelModal = document.getElementById('model-modal');
    const modelCancel = document.getElementById('model-cancel');
    const modelContinue = document.getElementById('model-continue');
    const modelOptions = modelModal ? modelModal.querySelectorAll('.model-option') : [];

    const modelLabelMap = { hiyori: 'Hiyori', shizuku: 'Shizuku', natori: 'Natori', haru: 'Haru', chitose: 'Chitose' };
    let selectedModel = localStorage.getItem('model') || 'hiyori';

    if (modelModal) {
        modelModal.classList.add('hidden');
    }

    const updateModelButtonLabel = () => {
        if (!modelButton) return;
        const label = selectedModel ? (modelLabelMap[selectedModel] || selectedModel) : 'Pilih Model';
        modelButton.textContent = label;
        modelButton.style.cursor = 'pointer';
    };
    updateModelButtonLabel();

    const highlightSelection = () => {
        if (!modelOptions) return;
        modelOptions.forEach(btn => {
            if (selectedModel && btn.dataset.model === selectedModel) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
    };

    if (modelButton && modelModal) {
        modelButton.addEventListener('click', () => {
            modelModal.classList.remove('hidden');
            highlightSelection();
        });
    }

    if (modelCancel && modelModal) {
        modelCancel.addEventListener('click', () => {
            modelModal.classList.add('hidden');
        });
    }

    if (modelOptions) {
        modelOptions.forEach(btn => {
            btn.addEventListener('click', () => {
                if (btn.dataset.model) {
                    selectedModel = btn.dataset.model;
                    highlightSelection();
                }
            });
        });
    }

    if (modelContinue && modelModal) {
        modelContinue.addEventListener('click', () => {
            if (!selectedModel) selectedModel = 'hiyori';
            localStorage.setItem('model', selectedModel);
            updateModelButtonLabel();
            modelModal.classList.add('hidden');
            
            // PERUBAHAN 2: Set flag sebelum pindah halaman
            sessionStorage.setItem('isReturning', 'true');

            setTimeout(() => {
                window.location.href = '/chat.html';
            }, 200);
        });
    }

    highlightSelection();
});