// hiyori.ts
// File ini berisi semua data konfigurasi khusus untuk model Hiyori.

import type { ModelConfig } from './model-config';

export const hiyoriConfig: ModelConfig = {
  // 1. Path ke file model definition
  path: 'live2d/hiyori/runtime/hiyori_pro_t11.model3.json',

  // 2. Konfigurasi layout untuk Hiyori
  layout: {
    xFrac: 0.25,
    anchorX: 0.5,
    anchorY: 0.3,
    targetWidthFrac: 0.9,
    targetHeightFrac: 1.9,
    startMotionPref: ['Tap', 'Tap@Body', 'Flick', 'FlickUp', 'Idle'],
  },

  // 3. Peta grup gerakan (motion groups).
  // Berbeda dengan Shizuku, di sini kita hanya mendefinisikan nama grup gerakannya.
  // Logika utama di index.ts nanti akan menggunakan `buildMotionList` untuk
  // secara otomatis membuat daftar lengkap `[['Tap@Body', 0], ['Tap@Body', 1], ...]`
  // berdasarkan nama grup ini.
  motionGroups: {
    talk: 'Tap@Body',
    cheer: 'FlickUp',
    mouthcover: 'Tap',
    disagree: 'Flick',
    surprised: 'Tap@Body',
    laugh: 'FlickUp',
  },

  // 4. Logika interaksi khusus (hit handler).
  // Berdasarkan kode asli, Hiyori tidak memiliki event listener 'hit' khusus
  // seperti Shizuku. Jadi, kita tidak perlu mendefinisikan properti `hitHandler` di sini.
  // Properti ini bersifat opsional di `ModelConfig`.
};