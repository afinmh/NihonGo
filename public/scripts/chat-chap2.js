document.addEventListener('DOMContentLoaded', () => {
    const messagesContainer = document.getElementById('messages');
    const readyOverlay = document.getElementById('ready-overlay');
    const formEl = document.getElementById('form');
    const inputEl = document.getElementById('message');

    // Fungsi hapus semua chat
    function clearChat() {
        messagesContainer.innerHTML = '';
    }

    // Fungsi menambahkan pesan
    function addMessage(text, className) {
        const div = document.createElement('div');
        div.className = className;
        div.textContent = text;
        messagesContainer.appendChild(div);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    // Fungsi mainkan audio + Live2D motion
    function playAudio(src) {
        if (window.live2dModel) {
            window.playAudioWithMotion(window.live2dModel, src);
        } else {
            const audio = new Audio(src);
            audio.play();
        }
    }


    function playAudio2(src) {
    if (window.live2dModel && window.playAudio2) {
        window.playAudio2(window.live2dModel, src);
    } else {
        // fallback audio biasa jika Live2D belum siap
        if (!window.currentAudio || window.currentAudio.paused) {
            window.currentAudio = new Audio(src);
            window.currentAudio.play().catch(err => console.warn("Audio gagal diputar:", err));
            window.currentAudio.onended = () => { window.currentAudio = null; };
        }
    }
}

// Mainkan audio + motion tap_body_01
function playAudioHappy(src) {
    if (window.live2dModel && window.playAudioHappy) {
        window.playAudioHappy(window.live2dModel, src);
    } else {
        // fallback audio biasa jika Live2D belum siap
        if (!window.currentAudio || window.currentAudio.paused) {
            window.currentAudio = new Audio(src);
            window.currentAudio.play().catch(err => console.warn("Audio gagal diputar:", err));
            window.currentAudio.onended = () => { window.currentAudio = null; };
        }
    }
}

    // Tampilkan pilihan Ya/Tidak
    function showReadyButtons() {
        const container = document.createElement('div');
        container.id = 'ready-buttons';

        const yesBtn = document.createElement('button');
        yesBtn.textContent = 'Ya';
        yesBtn.className = 'btn-choice';
        yesBtn.addEventListener('click', () => startChapter1());

        const noBtn = document.createElement('button');
        noBtn.textContent = 'Tidak';
        noBtn.className = 'btn-choice';
        noBtn.addEventListener('click', () => {
            addMessage('Tidak apa-apa, bisa mulai nanti ya!', 'reply');
            if (readyOverlay) readyOverlay.style.display = 'none';
        });

        container.appendChild(yesBtn);
        container.appendChild(noBtn);
        messagesContainer.appendChild(container);
    }

    // Fungsi untuk menampilkan materi pilihan
    const materiList = [
        {id:1, title:'Kata Umum', audio:'/audio/chapter1/materi1.mp3'},
        {id:2, title:'Kata Tanya & Ganti', audio:'/audio/chapter1/materi2.mp3'},
        {id:3, title:'Kata Sifat / Emosi', audio:'/audio/chapter1/materi3.mp3'},
        {id:4, title:'Kata Kerja Dasar', audio:'/audio/chapter1/materi4.mp3'},
        {id:5, title:'Perkenalan', audio:'/audio/chapter1/materi5.mp3'},
    ];

    let progress = 0; 
    const materiProgress = [0, 0, 0, 0, 0]; 
    const materi1Played = new Set(); 
    const materi2Played = new Set(); 
    const materi3Played = new Set(); 
    const materi4Played = new Set(); 
    const testsPassed = [false, false, false, false, false]; // status tes lulus per materi
    let testState = null; // state ujian materi (jika aktif)

    // Load saved state from localStorage
    try {
        const saved = JSON.parse(localStorage.getItem('chap1Progress') || 'null');
        if (saved && typeof saved === 'object') {
            if (Array.isArray(saved.materiProgress) && saved.materiProgress.length === 5) {
                for (let i = 0; i < 5; i++) materiProgress[i] = Math.max(0, Math.min(1, Number(saved.materiProgress[i]) || 0));
            }
            if (typeof saved.progress === 'number') progress = Math.max(progress, saved.progress);
            if (Array.isArray(saved.materi1Played)) saved.materi1Played.forEach(k => materi1Played.add(k));
            if (Array.isArray(saved.materi2Played)) saved.materi2Played.forEach(k => materi2Played.add(k));
            if (Array.isArray(saved.materi3Played)) saved.materi3Played.forEach(k => materi3Played.add(k));
            if (Array.isArray(saved.materi4Played)) saved.materi4Played.forEach(k => materi4Played.add(k));
            if (Array.isArray(saved.testsPassed) && saved.testsPassed.length === 5) {
                for (let i = 0; i < 5; i++) testsPassed[i] = !!saved.testsPassed[i];
            }
        }
    } catch {}

    function saveState() {
        const payload = {
            materiProgress,
            progress,
            materi1Played: Array.from(materi1Played),
            materi2Played: Array.from(materi2Played),
            materi3Played: Array.from(materi3Played),
            materi4Played: Array.from(materi4Played),
            testsPassed,
        };
        try { localStorage.setItem('chap1Progress', JSON.stringify(payload)); } catch {}
    }

    function formatPercent(v) { return Math.round(v * 100); }
    function computeOverall() {
        // masing-masing materi bobot 20%
        const sum = materiProgress.reduce((a, b) => a + b, 0);
        return (sum / materiProgress.length);
    }
    function mapAudioPath(src) {
        let out = src || '';
        // dasar.json gunakan /audio/kata-umum/, padahal file ada di /audio/chapter1/dasar/
        if (out.startsWith('/audio/kata-umum/')) out = out.replace('/audio/kata-umum/', '/audio/chapter1/dasar/');
        // tanya-ganti -> folder tanya_ganti
        if (out.startsWith('/audio/tanya-ganti/')) out = out.replace('/audio/tanya-ganti/', '/audio/chapter1/tanya_ganti/');
        // sifat-emosi -> folder emosi
        if (out.startsWith('/audio/sifat-emosi/')) out = out.replace('/audio/sifat-emosi/', '/audio/chapter1/emosi/');
        // kata-kerja -> folder kerja
        if (out.startsWith('/audio/kata-kerja/')) out = out.replace('/audio/kata-kerja/', '/audio/chapter1/kerja/');
        // filename normalizations
        out = out.replace('hottosuru.mp3', 'hotto suru.mp3');
        out = out.replace('benkyousuru.mp3', 'benkyou suru.mp3');
        return out;
    }

    async function startKataDasar() {
        clearChat();
        // Pastikan input chat tetap disembunyikan
        if (formEl) formEl.style.display = 'none';

        // Ambil data kata dasar
        let data;
        try {
            const res = await fetch('/scripts/chapter1/dasar.json');
            data = await res.json();
        } catch (e) {
            addMessage('Gagal memuat data kata dasar.', 'reply');
            return;
        }

        const groups = (data && data.kata_umum) ? data.kata_umum : [];

        // Header panel + tombol back
        const header = document.createElement('div');
        header.className = 'panel-header';
        header.innerHTML = '<div><h3>Kata Dasar: Kata Umum</h3><p>Tekan sebuah kata untuk mendengarkan audio.</p></div>';
        const backBtn = document.createElement('button');
        backBtn.className = 'btn-back';
        backBtn.textContent = '← Kembali';
        backBtn.addEventListener('click', () => {
            clearChat();
            addMessage('Pilih materi:', 'reply');
            showMateriButtons();
            renderOverallProgress();
        });
        header.appendChild(backBtn);
        messagesContainer.appendChild(header);

        // Progress materi 1
        const totalWords = groups.reduce((acc, g) => acc + (g.words?.length || 0), 0);
        const progressRow = document.createElement('div');
        progressRow.className = 'progress-row';
        const progressWrap = document.createElement('div');
        progressWrap.className = 'progress-wrap';
        const progressBar = document.createElement('div');
        progressBar.className = 'progress-bar';
        const progressText = document.createElement('div');
        progressText.className = 'progress-text';
        const testBtn = document.createElement('button');
        testBtn.className = 'btn-test';
        testBtn.textContent = 'Tes';
        testBtn.disabled = true;
    testBtn.addEventListener('click', () => startMateriTest(groups, 0));
        function updateMateri1Progress() {
            const pct = materi1Played.size / Math.max(1, totalWords);
            materiProgress[0] = pct;
            progressBar.style.width = `${formatPercent(pct)}%`;
            progressText.textContent = `${materi1Played.size}/${totalWords} (${formatPercent(pct)}%)`;
            // saat 100%, bar jadi kuning; jika sudah lulus tes, jadi hijau
            progressBar.classList.remove('ready');
            progressBar.classList.remove('passed');
            if (pct >= 1) {
                if (testsPassed[0]) {
                    progressBar.classList.add('passed');
                } else {
                    progressBar.classList.add('ready');
                }
                testBtn.disabled = false;
            } else {
                testBtn.disabled = true;
            }
            saveState();
        }
        updateMateri1Progress();
        progressWrap.appendChild(progressBar);
        progressRow.appendChild(progressWrap);
        progressRow.appendChild(testBtn);
        messagesContainer.appendChild(progressRow);
        messagesContainer.appendChild(progressText);

        // Render group + kata
        groups.forEach(group => {
            const section = document.createElement('section');
            section.className = 'word-group';
            const title = document.createElement('h4');
            title.textContent = group.group || 'Tanpa Nama';
            section.appendChild(title);

            const grid = document.createElement('div');
            grid.className = 'word-grid';

            (group.words || []).forEach(w => {
                const btn = document.createElement('button');
                btn.className = 'btn-word';
                btn.innerHTML = `<span class="jp">${w.japan}</span><span class="rd">${w.reading}</span><span class="mn">${w.meaning}</span>`;

                const key = `${w.japan}|${w.reading}`;
                if (materi1Played.has(key)) btn.classList.add('played');

                btn.addEventListener('click', () => {
                    // mainkan audio
                    const audioSrc = mapAudioPath(w.audio || '');
                    playAudio(audioSrc);
                    // progress
                    if (!materi1Played.has(key)) {
                        materi1Played.add(key);
                        btn.classList.add('played');
                        updateMateri1Progress();
                        // Jangan tampilkan progress keseluruhan di view materi
                        // refresh materi menu gating jika sudah penuh
                        if (materiProgress[0] >= 1) {
                            // no immediate rerender here; back shows updated state
                        }
                    }
                });

                grid.appendChild(btn);
            });

            section.appendChild(grid);
            messagesContainer.appendChild(section);
        });

        // Auto-scroll ke bawah
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    function shuffle(arr) {
        const a = arr.slice();
        for (let i = a.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [a[i], a[j]] = [a[j], a[i]];
        }
        return a;
    }

    function normalizeAnswer(s) {
        return String(s || '')
            .toLowerCase()
            .trim()
            .replace(/[.!?…]+$/g, '')
            .replace(/[\-’'‐‑–—]/g, ' ')
            .replace(/\s+/g, ' ');
    }

    function parseMeaningOptions(raw) {
        const parts = String(raw || '')
            .split(/\s*\/\s*|\s+atau\s+/i)
            .map(p => p.trim())
            .filter(Boolean);
        if (parts.length === 0) return [''];
        return parts;
    }

    function startMateriTest(groups, materiIndex) {
        if (!groups || !Array.isArray(groups)) return;
        const words = [];
        groups.forEach(g => (g.words || []).forEach(w => words.push(w)));
        if (words.length === 0) return;

        const shuffled = shuffle(words);
        const qMeaning = shuffled.slice(0, Math.min(5, shuffled.length)).map(w => {
            const optsRaw = parseMeaningOptions(w.meaning);
            const optsNorm = optsRaw.map(o => normalizeAnswer(o));
            return {
                type: 'meaning',
                // gunakan reading/romaji
                prompt: `Apa arti "${w.reading}"?`,
                answersId: optsNorm,
                answersRaw: optsRaw,
                readingRaw: w.reading,
                w
            };
        });
        const remaining = shuffle(words.filter(w => !qMeaning.find(q => q.w === w)));
        const qJP = remaining.slice(0, Math.min(5, remaining.length)).map(w => ({
            type: 'jp',
            prompt: `Apa bahasa Jepang untuk "${w.meaning}"? (jawab dengan reading/romaji)`,
            answerRd: normalizeAnswer(w.reading),
            readingRaw: w.reading,
            w
        }));
        const questions = shuffle(qMeaning.concat(qJP));
        const total = questions.length;

        testState = {
            questions,
            total,
            index: 0,
            correct: 0,
            materiIndex,
        };

        clearChat();
        addMessage('Tes dimulai. Jawab 10 soal. Nilai kelulusan 80.', 'reply');
        if (formEl) {
            formEl.style.display = 'flex';
        }
        if (inputEl) {
            inputEl.value = '';
            inputEl.placeholder = 'Ketik jawabanmu di sini...';
            inputEl.focus();
        }
        askNextQuestion();
    }

    function askNextQuestion() {
        if (!testState) return;
        if (testState.index >= testState.total) {
            finishTest();
            return;
        }
        const q = testState.questions[testState.index];
        addMessage(`Soal ${testState.index + 1}/${testState.total}: ${q.prompt}`, 'reply');
    }

    function finishTest() {
    if (!testState) return;
        const percent = Math.round((testState.correct / testState.total) * 100);
        addMessage(`Selesai! Nilai kamu: ${percent}`, 'reply');
        // Sembunyikan input lagi saat kembali ke menu
        if (formEl) formEl.style.display = 'none';

        if (percent >= 80) {
            // Lulus: unlock materi berikutnya
            const mi = Math.max(0, Math.min(4, Number(testState.materiIndex)));
            testsPassed[mi] = true;
            progress = Math.max(progress, mi + 1);
            saveState();
            setTimeout(() => {
                addMessage('Selamat! (Omedetou)', 'reply');
                playAudio('/audio/chapter1/dasar/omedetou.mp3');
                setTimeout(() => {
                    addMessage('Kamu berhasil menyelesaikan satu materi.', 'reply');
                    setTimeout(() => {
                        addMessage('Ayo teruskan!', 'reply');
                        if (percent === 100) {
                            addMessage('Hebat! (Sugoi)', 'reply');
                        }
                        // Kembali ke menu materi
                        clearChat();
                        addMessage('Pilih materi:', 'reply');
                        showMateriButtons();
                    }, 1200);
                }, 1200);
            }, 800);
        } else {
            setTimeout(() => {
                addMessage('Belum lulus. Coba lagi ya!', 'reply');
                // Kembali ke menu materi
                setTimeout(() => {
                    clearChat();
                    addMessage('Pilih materi:', 'reply');
                    showMateriButtons();
                }, 1000);
            }, 800);
        }

        testState = null;
    }

    function renderOverallProgress() {
        // Hapus elemen lama
        const old = document.getElementById('overall-progress');
        if (old) old.remove();
        const wrap = document.createElement('div');
        wrap.id = 'overall-progress';
        wrap.className = 'overall-progress';
        const pct = computeOverall();
        wrap.innerHTML = `<div class="overall-title">Progress Keseluruhan</div>
            <div class="overall-bar"><div class="overall-fill" style="width:${formatPercent(pct)}%"></div></div>
            <div class="overall-text">${formatPercent(pct)}%</div>`;
        messagesContainer.appendChild(wrap);

        // If all materi 100%, add a congratulatory chat-like message once
        const allComplete = materiProgress.every(p => Math.round(p * 100) >= 100);
        const already = document.getElementById('all-done-note');
        if (allComplete && !already) {
            const note = document.createElement('div');
            note.id = 'all-done-note';
            note.className = 'reply';
            note.textContent = 'Hebat sekali!. Semua sudah selesai!, Ayo semangat lagi di sesi berikutnya!';
            messagesContainer.appendChild(note);
            // Putar audio selesai saat semua materi tuntas
            try {
                if (typeof playAudioHappy === 'function') {
                    playAudioHappy('/audio/chapter1/finish.mp3');
                } else {
                    playAudio('/audio/chapter1/finish.mp3');
                }
            } catch {}
        }
    }

    function showMateriButtons() {
        const container = document.createElement('div');
        container.id = 'materi-buttons';

        materiList.forEach((m, index) => {
            const btn = document.createElement('button');
            btn.className = 'btn-materi';
            const pct = Math.max(0, Math.min(1, Number(materiProgress[index]) || 0));
            const pctText = `${formatPercent(pct)}%`;
            const barState = pct >= 1 ? (testsPassed[index] ? 'green' : 'yellow') : 'blue';
            btn.innerHTML = `
                <div class="materi-title">${m.id}. ${m.title}</div>
                <div class="materi-progress-wrap">
                    <div class="materi-progress-bar ${barState}" style="width:${formatPercent(pct)}%"></div>
                </div>
                <div class="materi-progress-text">${pctText}</div>
            `;
            // hanya aktif jika progres sudah sampai materi sebelumnya
            if (index > progress) btn.disabled = true;

            btn.addEventListener('click', () => {
                if (index === 0) return startKataDasar();
                if (index === 1) return startKataTanyaGanti();
                if (index === 2) return startKataSifatEmosi();
                if (index === 3) return startKataKerjaDasar();
                if (index === 4 && window.startPerkenalanMateri) return window.startPerkenalanMateri();
                playAudio(m.audio);
                addMessage(`Mulai materi: ${m.title}`, 'reply');
            });

            container.appendChild(btn);
        });

        // hapus button lama jika ada
        const old = document.getElementById('materi-buttons');
        if (old) old.remove();

        messagesContainer.appendChild(container);
        // Tampilkan progress keseluruhan tepat di bawahnya
        renderOverallProgress();
    }

    // Expose minimal hooks for perkenalan.js
    window.showMateriMenu = function() {
        clearChat();
        addMessage('Pilih materi:', 'reply');
        showMateriButtons();
        renderOverallProgress();
    };
    window.reloadChap1State = function() {
        try {
            const saved = JSON.parse(localStorage.getItem('chap1Progress') || 'null');
            if (saved && typeof saved === 'object') {
                if (Array.isArray(saved.materiProgress) && saved.materiProgress.length === 5) {
                    for (let i = 0; i < 5; i++) materiProgress[i] = Math.max(0, Math.min(1, Number(saved.materiProgress[i]) || 0));
                }
                if (typeof saved.progress === 'number') progress = Math.max(0, Math.min(5, Number(saved.progress)));
                if (Array.isArray(saved.testsPassed) && saved.testsPassed.length === 5) {
                    for (let i = 0; i < 5; i++) testsPassed[i] = !!saved.testsPassed[i];
                }
            }
        } catch {}
    };

    // Form submission handler for test answers
    if (formEl) {
        formEl.addEventListener('submit', (e) => {
            e.preventDefault();
            if (!testState) return; // ignore if not in test
            const val = inputEl ? inputEl.value : '';
            const answer = normalizeAnswer(val);
            if (!val.trim()) return;
            // tampilkan jawaban user
            addMessage(val, 'user');
            if (inputEl) inputEl.value = '';

            const q = testState.questions[testState.index];
            let correct = false;
            if (q.type === 'meaning') {
                // benar jika cocok salah satu opsi arti
                correct = Array.isArray(q.answersId) && q.answersId.includes(answer);
            } else {
                // jp: hanya terima reading/romaji
                correct = (answer === q.answerRd);
            }

            if (correct) {
                testState.correct += 1;
                addMessage('Benar!', 'reply');
                playAudioHappy('/audio/chapter1/benar.mp3');
            } else {
                const rightText = q.type === 'meaning'
                    ? (Array.isArray(q.answersRaw) && q.answersRaw.length ? q.answersRaw.join(' / ') : (q.readingRaw || ''))
                    : (q.readingRaw || (q.w && q.w.reading) || '');
                addMessage(`Salah. Jawaban: ${rightText}`, 'reply');
                playAudio('/audio/chapter1/dasar/chigaimasu.mp3');
            }

            testState.index += 1;
            setTimeout(() => askNextQuestion(), 500);
        });
    }

    // Fungsi mulai Chapter 1
function startChapter1() {
    clearChat();
    if (readyOverlay) readyOverlay.style.display = 'none';

    addMessage('Oke, kenalin aku Chika!', 'reply');
    playAudioHappy('/audio/chapter1/intro.mp3');

    // jeda 2 detik
    setTimeout(() => {
        addMessage('Senang berkenalan denganmu!', 'reply');
        playAudio('/audio/chapter1/post-intro.mp3');

        // jeda 2 detik
        setTimeout(() => {
            addMessage('Chika bakal nemenin kamu belajar bahasa Jepang.', 'reply');
            playAudio2('/audio/chapter1/learn.mp3');

            // jeda 1.5 detik
            setTimeout(() => {
                addMessage('Jadi, Ayo kita mulai!', 'reply');
                playAudioHappy('/audio/chapter1/lets-start.mp3');
                // tampilkan button materi
                setTimeout(() => {
                    showMateriButtons();
                }, 1000);

            }, 3200);

        }, 2500);

    }, 3000);
}

// Generic materi renderer
async function startMateriCommon({ materiIndex, title, jsonUrl, rootKey, playedSet }) {
    clearChat();
    if (formEl) formEl.style.display = 'none';

    let data;
    try {
        const res = await fetch(jsonUrl);
        data = await res.json();
    } catch (e) {
        addMessage('Gagal memuat data materi.', 'reply');
        return;
    }

    const groups = (data && data[rootKey]) ? data[rootKey] : [];

    const header = document.createElement('div');
    header.className = 'panel-header';
    header.innerHTML = `<div><h3>${title}</h3><p>Tekan sebuah kata untuk mendengarkan audio.</p></div>`;
    const backBtn = document.createElement('button');
    backBtn.className = 'btn-back';
    backBtn.textContent = '← Kembali';
    backBtn.addEventListener('click', () => {
        clearChat();
        addMessage('Pilih materi:', 'reply');
        showMateriButtons();
        renderOverallProgress();
    });
    header.appendChild(backBtn);
    messagesContainer.appendChild(header);

    const totalWords = groups.reduce((acc, g) => acc + (g.words?.length || 0), 0);
    const progressRow = document.createElement('div');
    progressRow.className = 'progress-row';
    const progressWrap = document.createElement('div');
    progressWrap.className = 'progress-wrap';
    const progressBar = document.createElement('div');
    progressBar.className = 'progress-bar';
    const progressText = document.createElement('div');
    progressText.className = 'progress-text';
    const testBtn = document.createElement('button');
    testBtn.className = 'btn-test';
    testBtn.textContent = 'Tes';
    testBtn.disabled = true;
    testBtn.addEventListener('click', () => startMateriTest(groups, materiIndex));

    function updateMateriProgress() {
        const pct = playedSet.size / Math.max(1, totalWords);
        materiProgress[materiIndex] = pct;
        progressBar.style.width = `${formatPercent(pct)}%`;
        progressText.textContent = `${playedSet.size}/${totalWords} (${formatPercent(pct)}%)`;
        progressBar.classList.remove('ready');
        progressBar.classList.remove('passed');
        if (pct >= 1) {
            if (testsPassed[materiIndex]) {
                progressBar.classList.add('passed');
            } else {
                progressBar.classList.add('ready');
            }
            testBtn.disabled = false;
        } else {
            testBtn.disabled = true;
        }
        saveState();
    }
    updateMateriProgress();
    progressWrap.appendChild(progressBar);
    progressRow.appendChild(progressWrap);
    progressRow.appendChild(testBtn);
    messagesContainer.appendChild(progressRow);
    messagesContainer.appendChild(progressText);

    groups.forEach(group => {
        const section = document.createElement('section');
        section.className = 'word-group';
        const titleEl = document.createElement('h4');
        titleEl.textContent = group.group || 'Tanpa Nama';
        section.appendChild(titleEl);
        const grid = document.createElement('div');
        grid.className = 'word-grid';
        (group.words || []).forEach(w => {
            const btn = document.createElement('button');
            btn.className = 'btn-word';
            btn.innerHTML = `<span class="jp">${w.japan}</span><span class="rd">${w.reading}</span><span class="mn">${w.meaning}</span>`;
            const key = `${w.japan}|${w.reading}`;
            if (playedSet.has(key)) btn.classList.add('played');
            btn.addEventListener('click', () => {
                const audioSrc = mapAudioPath(w.audio || '');
                playAudio(audioSrc);
                if (!playedSet.has(key)) {
                    playedSet.add(key);
                    btn.classList.add('played');
                    updateMateriProgress();
                }
            });
            grid.appendChild(btn);
        });
        section.appendChild(grid);
        messagesContainer.appendChild(section);
    });

    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function startKataTanyaGanti() {
    return startMateriCommon({
        materiIndex: 1,
        title: 'Kata Dasar: Tanya & Ganti',
        jsonUrl: '/scripts/chapter1/tanya-ganti.json',
        rootKey: 'tanya_ganti',
        playedSet: materi2Played,
    });
}

function startKataSifatEmosi() {
    return startMateriCommon({
        materiIndex: 2,
        title: 'Kata Dasar: Sifat / Emosi',
        jsonUrl: '/scripts/chapter1/emosi.json',
        rootKey: 'sifat_emosi',
        playedSet: materi3Played,
    });
}

function startKataKerjaDasar() {
    return startMateriCommon({
        materiIndex: 3,
        title: 'Kata Dasar: Kata Kerja',
        jsonUrl: '/scripts/chapter1/kerja.json',
        rootKey: 'kata_kerja',
        playedSet: materi4Played,
    });
}

    // Fungsi salam otomatis sesuai waktu
    function sendGreeting() {
        const hour = new Date().getHours();
        let greetingAudio = '';
        let greetingText = '';

        if (hour >=5 && hour <11) { greetingText='Selamat pagi!'; greetingAudio='/audio/chapter1/pagi.mp3'; }
        else if (hour >=11 && hour <15) { greetingText='Selamat siang!'; greetingAudio='/audio/chapter1/siang.mp3'; }
        else if (hour >=15 && hour <18) { greetingText='Selamat sore!'; greetingAudio='/audio/chapter1/siang.mp3'; }
        else { greetingText='Selamat malam!'; greetingAudio='/audio/chapter1/malam.mp3'; }

        addMessage(greetingText, 'reply');
        playAudio(greetingAudio);

        setTimeout(() => {
            addMessage('Di Chapter 1 kita akan belajar dasar-dasar bahasa Jepang. Kamu siap?', 'reply');
            playAudio2('/audio/chapter1/ready.mp3');
            showReadyButtons();
        }, 2500);
    }

    // Tombol Oke overlay
    const okeBtn = document.getElementById('btn-oke');
    if (okeBtn) {
        okeBtn.addEventListener('click', () => {
            if (readyOverlay) readyOverlay.style.display = 'none';
            sendGreeting();
        });
    }

    // Tombol Back ke index -> langsung ke Level Select
    const backToIndex = document.getElementById('back-to-index');
    if (backToIndex) {
        backToIndex.addEventListener('click', () => {
            try { sessionStorage.setItem('isReturning', 'true'); } catch {}
            window.location.href = '/index.html';
        });
    }

    // Tombol Reset progres
    const resetBtn = document.getElementById('reset-progress');
    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            const yakin = confirm('Yakin reset semua progres Chapter 1?');
            if (!yakin) return;
            try { localStorage.removeItem('chap1Progress'); } catch {}
            try { localStorage.removeItem('chap1_materi5_played'); } catch {}
            // reset in-memory
            for (let i = 0; i < 5; i++) materiProgress[i] = 0;
            progress = 0;
            materi1Played.clear();
            materi2Played.clear();
            materi3Played.clear();
            materi4Played.clear();
            for (let i = 0; i < 5; i++) testsPassed[i] = false;
            saveState();
            // Kembali ke menu materi
            clearChat();
            addMessage('Progres direset.', 'reply');
            addMessage('Pilih materi:', 'reply');
            showMateriButtons();
        });
    }
});
