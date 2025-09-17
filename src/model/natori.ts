// natori.ts
// File ini berisi semua data konfigurasi khusus untuk model Natori.

import type { ModelConfig } from './model-config';

export const natoriConfig: ModelConfig = {
  // 1. Path ke file model definition
  path: 'live2d/natori/runtime/natori_pro_t06.model3.json',

  // 2. Konfigurasi layout untuk Natori
  layout: {
    xFrac: 0.25,
    anchorX: 0.5,
    anchorY: 0.25,
    targetWidthFrac: 0.9,
    targetHeightFrac: 2.3,
    startMotionPref: ['Tap', 'FlickUp@Head', 'Idle'],
  },

  // 3. Peta grup gerakan (motion groups) untuk Natori
  motionGroups: {
    talk: 'Tap',
    cheer: 'FlickUp@Head',
    mouthcover: 'FlickDown@Body',
    disagree: 'Flick@Body',
    surprised: 'Tap@Head',
    laugh: 'FlickUp@Head',
  },
  
  // Natori tidak memiliki interaksi 'hit' khusus di kode asli.
};