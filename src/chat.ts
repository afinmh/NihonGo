// Chat bootstrap: choose and initialize model based on selected character
// Static import map to keep Vite happy (no dynamic paths)
const modelToLoader: Record<string, () => Promise<any>> = {
  'Chika': () => import('./chap1'),
  'Hana': () => import('./chap2'),
  'Akira': () => import('./chap3'),
  'Rin': () => import('./chap4'),
  'Tatsuya': () => import('./chap5'),
};

function resolveSelectedName(): string {
  // localStorage 'model' stores engine key (shizuku, hiyori, etc.) or name fallback
  const key = localStorage.getItem('model') || 'Chika';
  const labelMap: Record<string, string> = { hiyori: 'Hana', shizuku: 'Chika', natori: 'Tatsuya', haru: 'Rin', chitose: 'Akira' };
  return labelMap[key] || key;
}

(function bootstrap() {
  const selectedName = resolveSelectedName();
  const loader = modelToLoader[selectedName] || modelToLoader['Chika'];
  loader().catch((e) => console.error('Failed to load chapter entry for', selectedName, e));
})();

// Make this file a module for --isolatedModules compatibility
export {};
