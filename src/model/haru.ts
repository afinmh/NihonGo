// haru.ts
// File ini berisi semua data konfigurasi khusus untuk model Haru.

import type { ModelConfig } from './model-config';

export const haruConfig: ModelConfig = {
  // 1. Path ke file model definition
  path: 'live2d/haru/runtime/haru.model3.json',

  // 2. Konfigurasi layout untuk Haru
  layout: {
    xFrac: 0.22,
    yFrac: 0.15,
    anchorX: 0.5,
    anchorY: 0.1,
    targetWidthFrac: 0.65,
    targetHeightFrac: 2.5,
    startMotionPref: ['Tap', 'Flick', 'Shake', 'Idle'],
  },

  // 3. Peta grup gerakan (motion groups) untuk Haru
  motionGroups: {
    talk: 'Tap',
    cheer: 'Shake',
    mouthcover: 'FlickRight',
    disagree: 'FlickLeft',
    surprised: 'Flick',
    laugh: 'Shake',
  },

  // Haru tidak memiliki interaksi 'hit' khusus di kode asli.
};