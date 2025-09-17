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

function getModelId() {
  const qp = new URLSearchParams(location.search);
  return (
    qp.get('model') ||
    localStorage.getItem('model') ||
    'shizuku'
  );
}

function getModelPath(id: string) {
  const map: Record<string, string> = {
    hiyori: 'live2d/hiyori/runtime/hiyori_pro_t11.model3.json',
    shizuku: 'live2d/shizuku/shizuku.model.json',
    natori: 'live2d/natori/runtime/natori_pro_t06.model3.json',
    // DITAMBAHKAN: Path untuk model baru
    haru: 'live2d/haru/runtime/haru.model3.json',
    chitose: 'live2d/chitose/runtime/chitose.model3.json',
  };
  return map[id] || map['shizuku'];
}

async function loadModelDefinition(url: string) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch model definition ${url}`);
  return res.json();
}

const modelId = getModelId();
const modelUrl = getModelPath(modelId);
const modelDef = await loadModelDefinition(modelUrl);
try { localStorage.setItem('model', modelId); } catch { }

const model = await Live2DModel.from(modelUrl, {
  autoInteract: false,
  motionPreload: MotionPreloadStrategy.IDLE
});

app.stage.addChild(model);

type LayoutCfg = {
  xFrac?: number;
  yFrac?: number;
  anchorX?: number;
  anchorY?: number;
  targetWidthFrac?: number;
  targetHeightFrac?: number;
  startMotionPref?: string[];
};

// ====================================================================
// == EDIT DI SINI UNTUK MENGUBAH POSISI DAN UKURAN MODEL ==
// ====================================================================
const LAYOUTS: Record<string, LayoutCfg> = {
  hiyori: {
    xFrac: 0.25,
    anchorX: 0.5,
    anchorY: 0.3,           // Dinaikkan agar lebih ke bawah
    targetWidthFrac: 0.9,   // Dinaikkan agar lebih besar
    targetHeightFrac: 1.9,  // Dinaikkan agar lebih besar
    startMotionPref: ['Tap', 'Tap@Body', 'Flick', 'FlickUp', 'Idle']
  },
  shizuku: {
    xFrac: 0.20,
    anchorX: 0.40,
    anchorY: 0.32,
    targetWidthFrac: 0.5,
    targetHeightFrac: 1,
    startMotionPref: ['tap_body', 'flick_head', 'shake', 'idle']
  },
  // DITAMBAHKAN: Layout awal untuk Natori, bisa Anda sesuaikan
  natori: {
    xFrac: 0.25,
    anchorX: 0.5,
    anchorY: 0.25,    
    targetWidthFrac: 0.9,
    targetHeightFrac: 2.3,
    startMotionPref: ['Tap', 'FlickUp@Head', 'Idle']
  },
  // DITAMBAHKAN: Layout untuk model baru
  haru: {
    xFrac: 0.22,
    yFrac: 0.15,
    anchorX: 0.5,
    anchorY: 0.1,
    targetWidthFrac: 0.65,
    targetHeightFrac: 2.5,
    startMotionPref: ['Tap', 'Flick', 'Shake', 'Idle']
  },
  chitose: {
    xFrac: 0.30,
    yFrac: 0.15,
    anchorX: 0.6,
    anchorY: 0.1,
    targetWidthFrac: 0.6,
    targetHeightFrac: 2,
    startMotionPref: ['Tap', 'Flick', 'Idle']
  }
};
// ====================================================================

const layout = LAYOUTS[modelId] || LAYOUTS.shizuku;

let mousestate = false;
canvas.addEventListener('pointerdown', (event) => model.tap(event.clientX, event.clientY));
canvas.addEventListener('pointerenter', () => (mousestate = true));
canvas.addEventListener('pointerleave', () => {
  model.internalModel.focusController.focus(0, 0);
  mousestate = false;
});
canvas.addEventListener('pointermove', ({ clientX, clientY }) => {
  if (mousestate) model.focus(clientX, clientY);
});

if (modelId === 'shizuku') {
    model.on('hit', (hitAreas) => {
        if (hitAreas.includes('head')) {
            model.motion('shake', 1);
        }
    });
}

// DIUBAH: Parser ekspresi dibuat lebih robust untuk menangani format yang berbeda
const expressions = (modelDef.expressions || modelDef.FileReferences?.Expressions || [])
    .map((exp: { name?: string, Name?: string }) => {
        const rawName = exp.Name || exp.name || '';
        return rawName.replace('.exp3.json', '');
    })
    .filter((name: string) => name); // Hapus nama kosong jika ada

const availableMotions: Record<string, number> = (() => {
  const motions = (modelDef?.FileReferences?.Motions) || (modelDef?.motions) || {};
  const out: Record<string, number> = {};
  for (const key of Object.keys(motions)) {
    out[key] = Array.isArray(motions[key]) ? motions[key].length : 0;
  }
  return out;
})();

function buildMotionList(group: string): Array<[string, number]> {
  const count = availableMotions[group] || 0;
  if (!count) return [];
  const list: Array<[string, number]> = [];
  for (let i = 0; i < count; i++) list.push([group, i]);
  return list;
}

const motions: { [key: string]: Array<[string, number]> } = (() => {
    const defaultMotions = {
        talk: [], cheer: [], mouthcover: [], disagree: [], surprised: [], laugh: []
    };
    if (modelId === 'shizuku') {
        return { ...defaultMotions, talk: [['tap_body', 0], ['tap_body', 2], ['pinch_out', 0], ['flick_head', 1]], cheer: [['tap_body', 1]], mouthcover: [['pinch_in', 0], ['pinch_in', 1], ['pinch_in', 2]], disagree: [['pinch_out', 1], ['pinch_out', 2]], surprised: [['shake', 0], ['shake', 2]], laugh: [['shake', 1]] };
    } else if (modelId === 'hiyori') {
        return { ...defaultMotions, talk: buildMotionList('Tap@Body'), cheer: buildMotionList('FlickUp'), mouthcover: buildMotionList('Tap'), disagree: buildMotionList('Flick'), surprised: buildMotionList('Tap@Body'), laugh: buildMotionList('FlickUp') };
    } else if (modelId === 'natori') {
        return { ...defaultMotions, talk: buildMotionList('Tap'), cheer: buildMotionList('FlickUp@Head'), mouthcover: buildMotionList('FlickDown@Body'), disagree: buildMotionList('Flick@Body'), surprised: buildMotionList('Tap@Head'), laugh: buildMotionList('FlickUp@Head') };
    } 
    // DITAMBAHKAN: Logika interaksi untuk model baru
    else if (modelId === 'haru') {
        return { ...defaultMotions, talk: buildMotionList('Tap'), cheer: buildMotionList('Shake'), mouthcover: buildMotionList('FlickRight'), disagree: buildMotionList('FlickLeft'), surprised: buildMotionList('Flick'), laugh: buildMotionList('Shake') };
    } else if (modelId === 'chitose') {
        return { ...defaultMotions, talk: buildMotionList('Tap'), cheer: buildMotionList('Flick'), mouthcover: buildMotionList('Tap'), disagree: buildMotionList('Flick'), surprised: buildMotionList('Tap'), laugh: buildMotionList('Flick') };
    }
    return defaultMotions;
})();


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
    model.y = h * (layout.yFrac ?? 0.5);
}

fitModel();
setTimeout(() => fitModel(), 250);
window.addEventListener('resize', fitModel);

let isPlayingSpecialMotion = false;
const livelyMotions: Array<[string, number]> = [];
for (const group in availableMotions) {
  if (group.toLowerCase() !== 'idle') {
    const count = availableMotions[group] || 0;
    for (let i = 0; i < count; i++) { livelyMotions.push([group, i]); }
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

export default { app, expressions, model, motions };