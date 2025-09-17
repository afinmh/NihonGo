// Menunggu DOM siap sebelum menjalankan skrip
document.addEventListener('DOMContentLoaded', () => {
    console.log('[Chapter1] chat-chap1.js loaded');
    const form = document.getElementById('form');
    const input = document.getElementById('message');
    const messagesContainer = document.getElementById('messages');

    // Fungsi untuk menambahkan pesan ke kotak chat
    function addMessage(text, className) {
        const messageDiv = document.createElement('div');
        messageDiv.textContent = text;
        messageDiv.className = className;
        messagesContainer.appendChild(messageDiv);
        // Auto-scroll ke pesan terbaru
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    // Fungsi untuk memainkan audio
    function playAudio(src) {
        const audio = new Audio(src);
        audio.play().catch(err => console.warn("Audio gagal diputar:", err));
    }

    // Fungsi untuk mendapatkan balasan dari Shizuku
    function getShizukuReply(userMessage) {
        const message = userMessage.toLowerCase();

        if (message.includes('halo') || message.includes('hai')) {
            return 'Halo juga! Semangat untuk memulai Bab 1.';
        } else if (message.includes('siapa kamu')) {
            return 'Aku Shizuku. Aku akan membantumu memahami materi di bab ini.';
        } else if (message.includes('bab ini tentang apa')) {
            return 'Bab ini adalah tentang perkenalan dasar dalam bahasa Jepang. Kita akan belajar salam dan ungkapan sederhana.';
        } else if (message.includes('konnichiwa')) {
            return 'Konnichiwa! Bagus sekali, kamu sudah mulai menggunakan bahasa Jepang.';
        } else if (message.includes('terima kasih')) {
            return 'Douいたしまして (Dou itashimashite). Sama-sama!';
        } else {
            return 'Maaf, aku belum mengerti pertanyaan itu. Coba tanyakan hal lain seputar perkenalan.';
        }
    }

    // Event listener untuk form pengiriman pesan
    form.addEventListener('submit', (event) => {
        event.preventDefault(); // Mencegah halaman reload

        const userMessage = input.value.trim();
        if (userMessage === '') return; // Jangan kirim pesan kosong

        // Tampilkan pesan pengguna
        addMessage(userMessage, 'user');

        // Kosongkan input field
        input.value = '';

        // Tampilkan balasan Shizuku dengan sedikit jeda
        setTimeout(() => {
            const shizukuReply = getShizukuReply(userMessage);
            addMessage(shizukuReply, 'reply');
        }, 600);
    });

    // ======================
    // Salam otomatis saat halaman dibuka
    // ======================
function sendGreeting() {
    setTimeout(() => {
        const hour = new Date().getHours();
        let greeting = '';
        let audioFile = '';

        if (hour >= 5 && hour < 11) {
            greeting = 'Selamat pagi!';
            audioFile = '/audio/chapter1/pagi.mp3';
        } else if (hour >= 11 && hour < 15) {
            greeting = 'Selamat siang!';
            audioFile = '/audio/chapter1/siang.mp3';
        } else if (hour >= 15 && hour < 19) {
            greeting = 'Selamat sore!';
            audioFile = '/audio/chapter1/sore.mp3';
        } else {
            greeting = 'Selamat malam!';
            audioFile = '/audio/chapter1/malam.mp3';
        }

        // tampilkan greeting
        addMessage(greeting, 'reply');

        // play audio + motion bicara
        if (window.live2dModel) {
            window.playAudioWithMotion(window.live2dModel, audioFile);
        }

        // lanjutkan perkenalan setelah 2 detik lagi
        setTimeout(() => {
            addMessage('Nama saya Chika.', 'reply');
            if (window.live2dModel) {
                window.playAudioWithMotion(window.live2dModel, '/audio/chapter1/intro.mp3');
            }

            // setelah 1 detik lagi -> Yoroshiku
            setTimeout(() => {
                addMessage('Senang berkenalan denganmu!', 'reply');
                if (window.live2dModel) {
                    window.playAudioWithMotion(window.live2dModel, '/audio/chapter1/post-intro.mp3');
                }
            }, 2500);

        }, 2000);
    }, 1000); // delay awal sebelum greeting pertama
}


// Tampilkan salam saat tombol Oke ditekan
const okeBtn = document.getElementById('btn-oke');
if (okeBtn) {
    okeBtn.addEventListener('click', () => {
        const overlay = document.getElementById('ready-overlay');
        if (overlay) overlay.style.display = 'none';
        sendGreeting();
    });
}
});
