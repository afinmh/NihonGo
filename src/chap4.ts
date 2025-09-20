import { Application } from '@pixi/app';
import { Renderer } from '@pixi/core';
import { Ticker, TickerPlugin } from '@pixi/ticker';
import { InteractionManager } from '@pixi/interaction';
import { Live2DModel, MotionPreloadStrategy } from 'pixi-live2d-display';
import type { ModelConfig } from './model/model-config';
import { haruConfig } from './model/haru';

// Register PIXI plugins
// @ts-ignore
Live2DModel.registerTicker(Ticker);
Application.registerPlugin(TickerPlugin);
Renderer.registerPlugin('interaction', InteractionManager);

const canvas = document.getElementById('canvas') as HTMLCanvasElement;
const app = new Application({ backgroundAlpha: 0, view: canvas });

console.log('[Chapter4] Initializing Live2D scene (Haru)...');

let currentAudio: HTMLAudioElement | null = null;

function ensureLayoutDefaults(cfg: ModelConfig) {
    const layout = cfg.layout || {};
    return {
        xFrac: layout.xFrac ?? 0.22,
        yFrac: layout.yFrac ?? 0.15,
        anchorX: layout.anchorX ?? 0.5,
        anchorY: layout.anchorY ?? 0.1,
        targetWidthFrac: layout.targetWidthFrac ?? 0.6,
        targetHeightFrac: layout.targetHeightFrac ?? 2.5,
    };
}

// ... (fungsi-fungsi lain tetap sama)
function stopAllMotionsImmediately(m: Live2DModel) {
    try {
        // @ts-ignore
        m.internalModel.motionManager.stopAllMotions();
    } catch {}
}

function stopCurrentAudio() {
    if (currentAudio) {
        try {
            currentAudio.onended = null;
            currentAudio.pause();
            currentAudio.currentTime = 0;
        } catch {}
        currentAudio = null;
    }
}

function startAudioWithMotion(m: Live2DModel, motionGroup: string, motionIndex: number, src: string) {
    stopCurrentAudio();
    stopAllMotionsImmediately(m);
    try { m.motion(motionGroup, motionIndex); } catch {}
    const audio = new Audio(src);
    currentAudio = audio;
    audio.play().catch(err => console.warn('Audio gagal diputar:', err));
    audio.onended = () => {
        currentAudio = null;
        stopAllMotionsImmediately(m);
    };
}

function bindGlobalAudioHelpers(motionGroups: Record<string, string> | undefined) {
    const talk = motionGroups?.talk || 'Tap';
    const alt = motionGroups?.disagree || 'FlickLeft';
    const happy = motionGroups?.cheer || 'Shake';

    function playAudioWithMotion(m: Live2DModel, src: string) {
        startAudioWithMotion(m, talk, 0, src);
    }
    function playAudio2(m: Live2DModel, src: string) {
        startAudioWithMotion(m, alt, 0, src);
    }
    function playAudioHappy(m: Live2DModel, src: string) {
        startAudioWithMotion(m, happy, 0, src);
    }

    // expose ke global
    // @ts-ignore
    (window as any).playAudioWithMotion = playAudioWithMotion;
    // @ts-ignore
    (window as any).playAudio2 = playAudio2;
    // @ts-ignore
    (window as any).playAudioHappy = playAudioHappy;
}


async function init() {
    const cfg = haruConfig; // gunakan Haru untuk Chapter 4
    let model: Live2DModel;

    try {
        model = await Live2DModel.from(cfg.path, {
            autoInteract: false,
            motionPreload: MotionPreloadStrategy.IDLE,
        });
        app.stage.addChild(model);
        console.log('[Chapter4] Haru model loaded and added to stage.');
        // @ts-ignore
        (window as any).live2dModel = model;
    } catch (err) {
        console.error('[Chapter4] Failed to load Haru model:', err);
        return;
    } finally {
        try {
            const loaderEl = document.getElementById('loader');
            if (loaderEl) loaderEl.style.display = 'none';
            const overlay = document.getElementById('ready-overlay');
            if (overlay && (window as any).live2dModel) overlay.style.display = 'flex';
        } catch {}
    }

    // DIUBAH: Siapkan dua versi layout
    const desktopLayout = ensureLayoutDefaults(cfg);

    // BARU: Definisikan layout khusus untuk mobile
    const mobileLayout = {
        xFrac: 0.5,             // Pusatkan model di tengah
        yFrac: 0.5,
        anchorX: 0.5,
        anchorY: 0.6,
        targetWidthFrac: 1.1,   // Model mengisi 90% lebar layar
        targetHeightFrac: 1,  // Model mengisi 80% tinggi layar
    };

    // ================= FIT & RESIZE =================
    const BASE_SIZE = { width: model.width, height: model.height };

    function fitModel() {
        const w = window.innerWidth;
        const h = window.innerHeight;

        // DIUBAH: Pilih layout yang sesuai berdasarkan lebar layar
        const isMobile = w <= 768; // Anda bisa sesuaikan breakpoint ini
        const layout = isMobile ? mobileLayout : desktopLayout;

        canvas.width = w;
        canvas.height = h;
        app.renderer.screen.width = w;
        app.renderer.screen.height = h;

        const scaleX = (w * (layout.targetWidthFrac ?? 0.5)) / BASE_SIZE.width;
        const scaleY = (h * (layout.targetHeightFrac ?? 0.9)) / BASE_SIZE.height;
        const scale = Math.min(scaleX, scaleY);

        model.scale.set(scale);
        model.anchor.set(layout.anchorX ?? 0.5, layout.anchorY ?? 0);
        model.x = w * (layout.xFrac ?? 0.5);
        model.y = h * (layout.yFrac ?? 0.5);
    }
    fitModel();
    setTimeout(() => fitModel(), 250);
    window.addEventListener('resize', fitModel);

    // ================= INTERAKSI =================
    let mousestate = false;
    canvas.addEventListener('pointerdown', (event) => {
        model.tap((event as PointerEvent).clientX, (event as PointerEvent).clientY);
    });
    canvas.addEventListener('pointerenter', () => (mousestate = true));
    canvas.addEventListener('pointerleave', () => {
        // @ts-ignore
        model.internalModel.focusController.focus(0, 0);
        mousestate = false;
    });
    canvas.addEventListener('pointermove', ({ clientX, clientY }) => {
        if (mousestate) model.focus(clientX, clientY);
    });

    // ================= HIT AREA (optional) =================
    if (cfg.hitHandler) {
        model.on('hit', () => cfg.hitHandler!(model));
    }

    // ================= AUDIO HELPERS =================
    bindGlobalAudioHelpers(cfg.motionGroups);

    return { app, model };
}

// =================== INIT ===================
init().then((res) => {
    if (!res) return;
    // @ts-ignore
    (window as any).live2dModel = res.model;
});

export default { app };