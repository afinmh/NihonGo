(function(){
  const MENU_AUDIO = 'chapter1/ready.mp3';
  const CORRECT_AUDIO = 'chapter1/benar.mp3';
  const TOUCH_AUDIO = 'chapter1/touch.mp3';

  const materiIndex = 4; // 0-based, Perkenalan is the 5th
  const jsonUrl = '/scripts/chapter1/perkenalan.json';
  const rootKey = 'perkenalan_chika';

  let groups = [];
  let playedSet = new Set(JSON.parse(localStorage.getItem('chap1_materi5_played') || '[]'));
  let passed = false;

  function savePlayed() {
    localStorage.setItem('chap1_materi5_played', JSON.stringify(Array.from(playedSet)));
  }

  function normalizeText(s){
    if (!s) return '';
    return s
      .toString()
      .trim()
      .toLowerCase()
      .replace(/[ãàáâäå]/g,'a')
      .replace(/[ẽèéêë]/g,'e')
      .replace(/[ĩìíîï]/g,'i')
      .replace(/[õòóôö]/g,'o')
      .replace(/[ũùúûü]/g,'u')
      .replace(/[‐‑–—―]/g,'-')
      .replace(/[“”]/g,'"')
      .replace(/[’‘]/g,"'")
      .replace(/\s+/g,' ');
  }

  function addMessage(text, type='reply') {
    const msg = document.createElement('div');
    msg.className = `message ${type}`;
    msg.textContent = text;
    document.getElementById('messages').appendChild(msg);
    msg.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }

  function clearChat(){
    const el = document.getElementById('messages');
    if (el) el.innerHTML = '';
  }

  function playAudio(path){
    try {
      const src = path.startsWith('/audio/') ? path : `/audio/${path}`;
      if (window.live2dModel && window.playAudioWithMotion) {
        window.playAudioWithMotion(window.live2dModel, src);
      } else {
        const audio = new Audio(src);
        audio.play();
      }
    } catch {}
  }

  function updateProgressUI() {
    const total = groups.reduce((acc,g)=>acc+g.words.length,0);
    const done = Array.from(playedSet).length;
    const pct = total ? Math.min(1, done/total) : 0;
    try {
      const saved = JSON.parse(localStorage.getItem('chap1Progress')||'{}');
      if (saved && saved.materiProgress && Array.isArray(saved.materiProgress)) {
        saved.materiProgress[materiIndex] = pct;
      } else {
        saved.materiProgress = [0,0,0,0,0];
        saved.materiProgress[materiIndex] = pct;
      }
      localStorage.setItem('chap1Progress', JSON.stringify(saved));
    } catch {}
  }

  function mapAudioPath(filename){
    return `chapter1/perkenalan/${filename}`;
  }

  function renderMateri() {
    clearChat();
    const formEl = document.getElementById('form');
    if (formEl) formEl.style.display = 'none';

    const messages = document.getElementById('messages');

    const header = document.createElement('div');
    header.className = 'panel-header';
    header.innerHTML = `<div><h3>Perkenalan</h3><p>Tekan kalimat untuk mendengarkan audio.</p></div>`;
    const backBtn = document.createElement('button');
    backBtn.className = 'btn-back';
    backBtn.textContent = '← Kembali';
    backBtn.addEventListener('click', ()=>{
      if (window.showMateriMenu) window.showMateriMenu();
      else playAudio(MENU_AUDIO);
    });
    header.appendChild(backBtn);
    messages.appendChild(header);

    const totalWords = groups.reduce((acc,g)=>acc+(g.words?.length||0),0);

    const row = document.createElement('div');
    row.className = 'progress-row';
    const wrap = document.createElement('div');
    wrap.className = 'progress-wrap';
    const bar = document.createElement('div');
    bar.className = 'progress-bar';
    const progressText = document.createElement('div');
    progressText.className = 'progress-text';
    wrap.appendChild(bar);
    const testBtn = document.createElement('button');
    testBtn.className = 'btn-test';
    testBtn.textContent = 'Tes';
    testBtn.disabled = true;
    row.appendChild(wrap);
    row.appendChild(testBtn);
    messages.appendChild(row);
    messages.appendChild(progressText);

    function refreshLessonProgressBar(){
      const done = playedSet.size;
      const pct = Math.round((done/Math.max(1,totalWords))*100);
  bar.style.width = pct+'%';
  // do not show percentage text inside the bar
  bar.textContent = '';
      progressText.textContent = `${done}/${totalWords} (${pct}%)`;
      bar.classList.remove('ready');
      bar.classList.remove('passed');
      if (pct === 100) {
        try {
          const saved = JSON.parse(localStorage.getItem('chap1Progress')||'{}');
          if (saved && saved.testsPassed && saved.testsPassed[4]) bar.classList.add('passed');
          else bar.classList.add('ready');
        } catch { bar.classList.add('ready'); }
        testBtn.disabled = false;
      } else {
        testBtn.disabled = true;
      }
    }

    // grid buttons by group
    groups.forEach((g,gi)=>{
      const section = document.createElement('section');
      section.className = 'word-group';
      const title = document.createElement('h4');
      title.textContent = g.group;
      section.appendChild(title);

      const grid = document.createElement('div');
      grid.className = 'word-grid';
      g.words.forEach((w,wi)=>{
        const key = `${gi}-${wi}`;
        const btn = document.createElement('button');
        btn.className = 'btn-word';
        const rd = displayReading(w.reading || '');
        const mn = w.meaning || '';
        btn.innerHTML = `<span class="jp">${w.japan || ''}</span><span class="rd">${rd}</span><span class="mn">${mn}</span>`;
        if (playedSet.has(key)) btn.classList.add('played');
        btn.addEventListener('click', ()=>{
          playedSet.add(key);
          btn.classList.add('played');
          savePlayed();
          updateProgressUI();
          refreshLessonProgressBar();
          playAudio(mapAudioPath(w.audio));
        });
        grid.appendChild(btn);
      });
      section.appendChild(grid);
      messages.appendChild(section);
    });

    // initialize progress bar color/width and test gating
    refreshLessonProgressBar();

    testBtn.addEventListener('click', ()=>{
      if (!canStartTest()) {
        playAudio(TOUCH_AUDIO);
        return addMessage('Mainkan semua contoh dulu ya.','reply');
      }
      startPerkenalanTest();
    });
  }

  function displayReading(text){
    // Add parentheses around variable parts in reading only
    let t = text || '';
    t = t.replace(/\bchika\b/gi,'(nama)');
    t = t.replace(/\bbandung\b/gi,'(kota)');
    t = t.replace(/\bindonesia\b/gi,'(negara)');
    // hobbies: film/music/book/game/sport
    t = t.replace(/\beiga\b/gi,'(hobi)');
    t = t.replace(/\bongaku\b/gi,'(hobi)');
    t = t.replace(/\bhon\b/gi,'(hobi)');
    t = t.replace(/\bgeemu\b/gi,'(hobi)');
    t = t.replace(/\bsupootsu\b/gi,'(hobi)');
    return t;
  }

  function canStartTest(){
    const total = groups.reduce((acc,g)=>acc+g.words.length,0);
    return playedSet.size >= total; // must play all
  }

  // lesson bar refresh is now embedded in renderMateri()

  function askUserPrompt(text){
    addMessage(text,'reply');
  }

  function getForm(){
    return document.getElementById('form');
  }
  function getInput(){
    return document.getElementById('message');
  }

  function withTempHandler(handler){
    const form = getForm();
    const input = getInput();
    const onSubmit = (e)=>{
      e.preventDefault();
      const val = input.value.trim();
      if (!val) return;
      addMessage(val, 'user');
      input.value = '';
      handler(val);
    };
    form.addEventListener('submit', onSubmit, { once: true });
  }

  function markPassedTest(){
    try {
      const saved = JSON.parse(localStorage.getItem('chap1Progress')||'{}');
      if (!saved.testsPassed) saved.testsPassed = [false,false,false,false,false];
      saved.testsPassed[materiIndex] = true;
      // Also unlock progress gate if using overall progress
      if (typeof saved.progress === 'number') {
        saved.progress = Math.max(saved.progress||0, materiIndex+1);
      } else {
        saved.progress = materiIndex+1;
      }
      localStorage.setItem('chap1Progress', JSON.stringify(saved));
    } catch {}
  }

  function startPerkenalanTest(){
    clearChat();
    addMessage('Tes Perkenalan (4 pertanyaan)','reply');
    let allCorrect = true;
    const formEl = getForm();
    const input = getInput();
    if (formEl) formEl.style.display = 'flex';
    if (input) { input.value=''; input.placeholder='Ketik jawabanmu di sini...'; input.focus(); }

    // Q1: Nama kamu
    askUserPrompt('1) Siapa nama kamu?');
    withTempHandler((ans1)=>{
      const n1 = normalizeText(ans1);
      const ok1 = (n1.includes('watashi no namae wa') && /desu\s*$/.test(n1)) || /わたしのなまえは.*です\s*$/.test(ans1);
  addMessage(ok1 ? 'Benar!' : 'Kurang tepat: gunakan pola "watashi no namae wa ... desu"', 'reply');
      if (ok1) playAudio(CORRECT_AUDIO); else playAudio(TOUCH_AUDIO);
  if (!ok1) allCorrect = false;

      // Q2: Panggilan
      askUserPrompt('2) Apa nama panggilan kamu?');
      withTempHandler((ans2)=>{
        const n2 = normalizeText(ans2);
        const ok2 = n2.endsWith('to yonde kudasai') || /to yonde kudasai\s*$/.test(n2) || /とよんでください\s*$/.test(ans2);
        addMessage(ok2 ? 'Benar!' : 'Kurang tepat: akhiri dengan "to yonde kudasai"', 'reply');
  if (ok2) playAudio(CORRECT_AUDIO); else playAudio(TOUCH_AUDIO);
  if (!ok2) allCorrect = false;

        // Q3: Tinggal di mana (last two words `ni sundeimasu`)
        askUserPrompt('3) Di mana kamu tinggal?');
        withTempHandler((ans3)=>{
          const n3 = normalizeText(ans3);
          const ok3 = /\bni\s+sundeimasu\s*$/.test(n3) || /に\s*すんでいます\s*$/.test(ans3);
          addMessage(ok3 ? 'Benar!' : 'Kurang tepat: akhiri dengan "ni sundeimasu"', 'reply');
          if (ok3) playAudio(CORRECT_AUDIO); else playAudio(TOUCH_AUDIO);
          if (!ok3) allCorrect = false;

          // Q4: Ucapkan salah satu kalimat penutup dari materi
          askUserPrompt('4) Ucapkan salah satu kalimat penutup dari materi');
          withTempHandler((ans4)=>{
            const n4 = normalizeText(ans4);
            const { jp, rd } = collectClosingPhrases();
            const ok4 = rd.some(c=> n4.includes(normalizeText(c))) || jp.some(j=> (ans4||'').includes(j));
            addMessage(ok4 ? 'Baik!' : 'Belum pas: gunakan salah satu kalimat penutup yang diajarkan.', 'reply');
            if (!ok4) allCorrect = false;

            if (allCorrect) {
              addMessage('Kamu lulus tes Perkenalan.','reply');
              playAudio(CORRECT_AUDIO);
              markPassedTest();
              // update lesson bar to green on return
            } else {
              playAudio(TOUCH_AUDIO);
              addMessage('Belum lulus: coba lagi ya.','reply');
            }

            // Sembunyikan input lalu kembali otomatis ke menu materi
            if (formEl) formEl.style.display = 'none';
            setTimeout(() => {
              if (window.reloadChap1State) window.reloadChap1State();
              if (window.showMateriMenu) window.showMateriMenu();
            }, 800);
          });
        });
      });
    });
  }

  function collectClosingPhrases(){
    const jp = [];
    const rd = [];
    groups.forEach(g=>{
      if (/penutup/i.test(g.group)) {
        g.words.forEach(w=>{
          if (w.japan) jp.push(w.japan);
          if (w.reading) rd.push(w.reading);
        });
      }
    });
    return { jp, rd };
  }

  async function loadJson(){
    const res = await fetch(jsonUrl);
    const data = await res.json();
    groups = data[rootKey] || [];
  }

  window.startPerkenalanMateri = async function(){
    try {
      await loadJson();
      renderMateri();
    } catch (e) {
      addMessage('Gagal memuat materi Perkenalan','reply');
    }
  };
})();
