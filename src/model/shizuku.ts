// shizuku.ts
// File ini berisi semua data konfigurasi dan logika khusus untuk model Shizuku.

import type { ModelConfig } from './model-config';

// Kita definisikan semua konfigurasi untuk Shizuku dalam satu objek.
export const shizukuConfig: ModelConfig = {
  // 1. Path ke file model definition (.model.json atau .model3.json)
  path: 'live2d/shizuku/shizuku.model.json',

  // 2. Konfigurasi layout: posisi, ukuran, dan jangkar (anchor)
  layout: {
    xFrac: 0.20,
    anchorX: 0.40,
    anchorY: 0.32,
    targetWidthFrac: 0.5,
    targetHeightFrac: 1,
    startMotionPref: ['tap_body', 'flick_head', 'shake', 'idle'],
  },

  // 3. Peta gerakan (motions) yang spesifik untuk Shizuku.
  // Ini adalah definisi manual gerakan-gerakannya.
  motions: {
    // Properti ini diisi array kosong jika tidak ada gerakan spesifik
    // agar struktur datanya konsisten.
    talk: [['tap_body', 0], ['tap_body', 2], ['pinch_out', 0], ['flick_head', 1]],
    cheer: [['tap_body', 1]],
    mouthcover: [['pinch_in', 0], ['pinch_in', 1], ['pinch_in', 2]],
    disagree: [['pinch_out', 1], ['pinch_out', 2]],
    surprised: [['shake', 0], ['shake', 2]],
    laugh: [['shake', 1]],
  },

  // 4. Logika interaksi khusus yang hanya berlaku untuk Shizuku.
  // Dalam kasus ini, saat area 'head' disentuh, mainkan animasi 'shake'.
  hitHandler: (model) => {
    model.on('hit', (hitAreas) => {
      if (hitAreas.includes('head')) {
        model.motion('shake', 1);
      }
    });
  },
};