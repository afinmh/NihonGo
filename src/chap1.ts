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
    } catch (err) {
        console.error('[Chapter1] Failed to load model:', err);
        return;
    } finally {
        try {
            const loaderEl = document.getElementById('loader');
            if (loaderEl) loaderEl.style.display = 'none';
        } catch {}
    }

    // ============ FIT & RESIZE ============
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

        // posisi Y di tengah layar
        model.y = h * 0.5;
    }
    fitModel();
    setTimeout(() => fitModel(), 250);
    window.addEventListener('resize', fitModel);

    // ============ INTERAKSI ============
    canvas.addEventListener('pointerdown', (event) => model.tap(event.clientX, event.clientY));
    canvas.addEventListener('pointerenter', () => (mousestate = true));
    canvas.addEventListener('pointerleave', () => {
        model.internalModel.focusController.focus(0, 0);
        mousestate = false;
    });
    canvas.addEventListener('pointermove', ({ clientX, clientY }) => {
        if (mousestate) model.focus(clientX, clientY);
    });

    model.on('hit', (hitAreas) => {
        if (hitAreas.includes('head')) {
            // motion default
            model.motion('shake', 1);

            // === NEW: play audio touch ===
            const audio = new Audio('/audio/chapter1/touch.mp3');
            audio.play().catch(err => console.warn("Audio gagal diputar:", err));
        }
    });

    // ============ EXPRESSIONS ============
    const expressions = (modelDef.expressions || modelDef.FileReferences?.Expressions || [])
        .map((exp: { name?: string, Name?: string }) => {
            const rawName = exp.Name || exp.name || '';
            return rawName.replace('.exp3.json', '');
        })
        .filter((name: string) => name);

    // ============ MOTIONS ============
    const availableMotions: Record<string, number> = (() => {
        const motions = (modelDef?.FileReferences?.Motions) || (modelDef?.motions) || {};
        const out: Record<string, number> = {};
        for (const key of Object.keys(motions)) {
            out[key] = Array.isArray(motions[key]) ? motions[key].length : 0;
        }
        return out;
    })();

    const motions = {
        talk: [['tap_body', 0], ['tap_body', 2], ['pinch_out', 0], ['flick_head', 1]],
        cheer: [['tap_body', 1]],
        mouthcover: [['pinch_in', 0], ['pinch_in', 1], ['pinch_in', 2]],
        disagree: [['pinch_out', 1], ['pinch_out', 2]],
        surprised: [['shake', 0], ['shake', 2]],
        laugh: [['shake', 1]]
    };

    // ============ RANDOM MOTIONS ============
    let isPlayingSpecialMotion = false;
    const livelyMotions: Array<[string, number]> = [];
    for (const group in availableMotions) {
        if (group.toLowerCase() !== 'idle') {
            const count = availableMotions[group] || 0;
            for (let i = 0; i < count; i++) {
                livelyMotions.push([group, i]);
            }
        }
    }
    model.on('motionStart', (group) => {
        if (group.toLowerCase() !== 'idle') { isPlayingSpecialMotion = true; }
    });
    model.on('motionFinish', () => { isPlayingSpecialMotion = false; });

    function playRandomMotion() {
        if (isPlayingSpecialMotion || livelyMotions.length === 0) { return; }
        const randomIndex = Math.floor(Math.random() * livelyMotions.length);
        const [group, index] = livelyMotions[randomIndex];
        if (group) { model.motion(group, index); }
    }
    setInterval(playRandomMotion, 5000 + Math.random() * 4000);

    // kalau butuh ekspor keluar
    return { app, expressions, model, motions };
}

// mulai
init().then((res) => {
    if (!res) return; // kalau gagal load, keluar
    const { model } = res;

    // simpan ke global biar bisa diakses dari chat-chap1.js
    // @ts-ignore
    window.live2dModel = model;
});

function playAudioWithMotion(model: Live2DModel, src: string) {
    const audio = new Audio(src);

    // Mainkan motion bicara (misalnya flick_head index ke-1)
    model.motion("flick_head", 1);

    // Mainkan audio
    audio.play().catch(err => console.warn("Audio gagal diputar:", err));
}

// === Tambahkan ini ===
// @ts-ignore
window.playAudioWithMotion = playAudioWithMotion;

export default { app };
