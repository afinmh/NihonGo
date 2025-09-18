import { Application } from '@pixi/app';
import { Renderer } from '@pixi/core';
import { Ticker, TickerPlugin } from '@pixi/ticker';
import { InteractionManager } from '@pixi/interaction';
import { Live2DModel, MotionPreloadStrategy } from 'pixi-live2d-display';

// @ts-ignore
Live2DModel.registerTicker(Ticker);
Application.registerPlugin(TickerPlugin);
Renderer.registerPlugin('interaction', InteractionManager);

const canvas = <HTMLCanvasElement>document.getElementById('canvas');
const app = new Application({
    backgroundAlpha: 0,
    view: canvas,
});

console.log('[Chapter1] Initializing Live2D scene...');

const modelUrl = 'live2d/shizuku/shizuku.model.json';
let currentAudio: HTMLAudioElement | null = null; // track audio yang sedang dimainkan

async function loadModelDefinition(url: string) {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Failed to fetch model definition ${url}`);
    return res.json();
}

const layout = {
    xFrac: 0.20,
    anchorX: 0.40,
    anchorY: 0.32,
    targetWidthFrac: 0.5,
    targetHeightFrac: 1,
};

let mousestate = false;

async function init() {
    let modelDef: any;
    let model: Live2DModel;

    try {
        modelDef = await loadModelDefinition(modelUrl);
        model = await Live2DModel.from(modelUrl, {
            autoInteract: false,
            motionPreload: MotionPreloadStrategy.IDLE
        });
        app.stage.addChild(model);
        console.log('[Chapter1] Model loaded and added to stage.');
        // expose model for other scripts
        // @ts-ignore
        (window as any).live2dModel = model;
    } catch (err) {
        console.error('[Chapter1] Failed to load model:', err);
        return;
    } finally {
        try {
            const loaderEl = document.getElementById('loader');
            if (loaderEl) loaderEl.style.display = 'none';
            const overlay = document.getElementById('ready-overlay');
            if (overlay && (window as any).live2dModel) overlay.style.display = 'flex';
        } catch {}
    }

    // ================= FIT & RESIZE =================
    const BASE_SIZE = { width: model.width, height: model.height };

    function fitModel() {
        const w = window.innerWidth;
        const h = window.innerHeight;
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
        model.y = h * 0.5;
    }
    fitModel();
    setTimeout(() => fitModel(), 250);
    window.addEventListener('resize', fitModel);

    // ================= INTERAKSI =================
    canvas.addEventListener('pointerdown', (event) => {
        model.tap(event.clientX, event.clientY);
    });
    canvas.addEventListener('pointerenter', () => (mousestate = true));
    canvas.addEventListener('pointerleave', () => {
        model.internalModel.focusController.focus(0, 0);
        mousestate = false;
    });
    canvas.addEventListener('pointermove', ({ clientX, clientY }) => {
        if (mousestate) model.focus(clientX, clientY);
    });

    // ================= HIT AREA AUDIO =================
    model.on('hit', (hitAreas) => {
        if (hitAreas.includes('head')) {
            if (currentAudio && !currentAudio.paused) return; // audio sedang dimainkan, ignore

            // jalankan motion shake index 1
            model.motion('shake', 1);
            currentAudio = new Audio('/audio/chapter1/touch.mp3');
            currentAudio.play().catch(err => console.warn("Audio gagal diputar:", err));
            currentAudio.onended = () => { currentAudio = null; };
        }
    });

    // =================== FUNGSI AUDIO KHUSUS (INTERRUPTIBLE) ===================
    function stopAllMotionsImmediately(m: Live2DModel) {
        try {
            // @ts-ignore: access underlying Cubism MotionManager
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
        // interrupt anything running
        stopCurrentAudio();
        stopAllMotionsImmediately(m);

        try { m.motion(motionGroup, motionIndex); } catch {}

        const audio = new Audio(src);
        currentAudio = audio;
        audio.play().catch(err => console.warn('Audio gagal diputar:', err));
        audio.onended = () => {
            currentAudio = null;
            // ensure lingering motion is stopped when audio ends
            stopAllMotionsImmediately(m);
        };
    }

    function playAudioWithMotion(model: Live2DModel, src: string) {
        startAudioWithMotion(model, 'flick_head', 1, src);
    }

    function playAudio2(model: Live2DModel, src: string) {
        startAudioWithMotion(model, 'pinch_out', 2, src);
    }

    function playAudioHappy(model: Live2DModel, src: string) {
        startAudioWithMotion(model, 'tap_body', 1, src);
    }

    // expose ke global
    // @ts-ignore
    window.playAudioWithMotion = playAudioWithMotion;
    // @ts-ignore
    window.playAudio2 = playAudio2;
    // @ts-ignore
    window.playAudioHappy = playAudioHappy;

    // =================== EXPRESSIONS ===================
    const expressions = (modelDef.expressions || modelDef.FileReferences?.Expressions || [])
        .map((exp: { name?: string, Name?: string }) => {
            const rawName = exp.Name || exp.name || '';
            return rawName.replace('.exp3.json', '');
        })
        .filter((name: string) => name);

    const motions = {
        talk: [['tap_body', 0], ['tap_body', 2], ['pinch_out', 0], ['flick_head', 1]],
        cheer: [['tap_body', 1]],
        mouthcover: [['pinch_in', 0], ['pinch_in', 1], ['pinch_in', 2]],
        disagree: [['pinch_out', 1], ['pinch_out', 2]],
        surprised: [['shake', 0], ['shake', 2]],
        laugh: [['shake', 1]]
    };

    return { app, expressions, model, motions };
}

// =================== INIT ===================
init().then((res) => {
    if (!res) return;
    // @ts-ignore
    window.live2dModel = res.model;
});

export default { app };
