// chitose.ts
// File ini berisi semua data konfigurasi khusus untuk model Chitose.

import type { ModelConfig } from './model-config';

export const chitoseConfig: ModelConfig = {
  // 1. Path ke file model definition
  path: 'live2d/chitose/runtime/chitose.model3.json',

  // 2. Konfigurasi layout untuk Chitose
  layout: {
    xFrac: 0.30,
    yFrac: 0.15,
    anchorX: 0.6,
    anchorY: 0.1,
    targetWidthFrac: 0.6,
    targetHeightFrac: 2,
    startMotionPref: ['Tap', 'Flick', 'Idle'],
  },

  // 3. Peta grup gerakan (motion groups) untuk Chitose
  motionGroups: {
    talk: 'Tap',
    cheer: 'Flick',
    mouthcover: 'Tap',
    disagree: 'Flick',
    surprised: 'Tap',
    laugh: 'Flick',
  },
  
  // Chitose tidak memiliki interaksi 'hit' khusus di kode asli.
};