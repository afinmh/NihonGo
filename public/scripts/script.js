document.addEventListener('DOMContentLoaded', () => {
    const DEV_MODE = false; // set true untuk dev

    // --- Elemen DOM ---
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
    const backToMainButton = document.getElementById('back-to-main-button');
    const backgroundMusic = new Audio('./assets/musik-latar.mp3');

    const demoButton = document.getElementById('demo-button');
    const modelButton = document.getElementById('model-button');
    const modelModal = document.getElementById('model-modal');
    const modelCancel = document.getElementById('model-cancel');
    const modelContinue = document.getElementById('model-continue');
    const modelOptions = modelModal ? modelModal.querySelectorAll('.model-option') : [];

    const modelLabelMap = { hiyori: 'Hiyori', shizuku: 'Shizuku', natori: 'Natori', haru: 'Haru', chitose: 'Chitose' };
    let selectedModel = localStorage.getItem('model') || 'hiyori';

    // --- Fungsi Splash ---
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

    // --- Level Select Screen ---
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

    // --- Flow returning ---
    const isReturning = sessionStorage.getItem('isReturning') === 'true';
    if (isReturning) {
        sessionStorage.removeItem('isReturning');

        if (startOverlay) startOverlay.remove();
        if (splashScreen) splashScreen.remove();
        
        document.body.style.overflow = 'auto';
        if (bgWave) bgWave.classList.add('animate');
        if (bgOrnament) bgOrnament.classList.add('animate');
        if (centerContent) centerContent.classList.add('animate');
        if (aboutContent) aboutContent.classList.add('animate');
        if (topRightLogo) topRightLogo.classList.add('visible');
        showLevelSelect();
    } else {
        // --- First visit ---
        if (startInteractiveArea && startOverlay) {
            startInteractiveArea.addEventListener('click', () => {
                startOverlay.classList.add('hidden');

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

    // --- Buttons ---
    if (startButton) startButton.addEventListener('click', showLevelSelect);
    if (backToMainButton) backToMainButton.addEventListener('click', showMainMenu);

    // --- Model Modal ---
    const updateModelButtonLabel = () => {
        if (!modelButton) return;
        const label = selectedModel ? (modelLabelMap[selectedModel] || selectedModel) : 'Pilih Model';
        modelButton.textContent = label;
    };
    updateModelButtonLabel();

    const highlightSelection = () => {
        if (!modelOptions) return;
        modelOptions.forEach(btn => {
            if (btn.dataset.model === selectedModel) btn.classList.add('active');
            else btn.classList.remove('active');
        });
    };

    if (modelButton && modelModal) {
        modelButton.addEventListener('click', () => {
            modelModal.classList.remove('hidden');
            highlightSelection();
        });
    }

    if (modelCancel && modelModal) {
        modelCancel.addEventListener('click', () => modelModal.classList.add('hidden'));
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
            modelModal.classList.add('hidden'); // hanya tutup modal
            updateModelButtonLabel();
        });
    }

    // --- FreeTalk button --- redirect ke chat.html dengan model yg dipilih
    if (demoButton) {
        demoButton.addEventListener('click', () => {
            localStorage.setItem('model', selectedModel);
            sessionStorage.setItem('isReturning', 'true');
            window.location.href = '/chat';
        });
    }
});
