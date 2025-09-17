// ==================
// Hardcode daftar speaker + style VOICEVOX
// ==================
const speakers = [
  "1. 四国めたん (ノーマル)",
  "2. 四国めたん (あまあま)",
  "3. 四国めたん (セクシー)",
  "4. 四国めたん (ツンツン)",
  "5. 四国めたん (ささやき)",
  "6. ずんだもん (ノーマル)",
  "7. ずんだもん (あまあま)",
  "8. ずんだもん (セクシー)",
  "9. ずんだもん (ツンツン)",
  "10. ずんだもん (ささやき)",
  "11. 春日部つむぎ (ノーマル)",
  "12. 雨晴はう (ノーマル)",
  "13. 波音リツ (ノーマル)",
  "14. 玄野武宏 (ノーマル)",
  "15. 玄野武宏 (喜び)",
  "16. 玄野武宏 (ツンギレ)",
  "17. 玄野武宏 (悲しみ)",
  "18. 白上虎太郎 (ふつう)",
  "19. 白上虎太郎 (わーい)",
  "20. 白上虎太郎 (びくびく)",
  "21. 白上虎太郎 (おこ)",
  "22. 白上虎太郎 (びえーん)",
  "23. 青山龍星 (ノーマル)",
  "24. 冥鳴ひまり (ノーマル)",
  "25. 九州そら (ノーマル)",
  "26. 九州そら (あまあま)",
  "27. 九州そら (セクシー)",
  "28. 九州そら (ツンツン)",
  "29. 九州そら (ささやき)",
  "30. モチノ・キョウコ (ノーマル)",
  "31. 剣崎雌雄 (ノーマル)",
  "32. WhiteCUL (ノーマル)",
  "33. WhiteCUL (たのしい)",
  "34. WhiteCUL (かなしい)",
  "35. WhiteCUL (びえーん)",
  "36. 後鬼 (人間ver)",
  "37. 後鬼 (ぬいぐるみver)",
  "38. No.7 (ノーマル)",
  "39. No.7 (アナウンス)",
  "40. No.7 (読み聞かせ)",
  "41. ちび式じい (ノーマル)",
  "42. 櫻歌ミコ (ノーマル)",
  "43. 櫻歌ミコ (第二形態)",
  "44. 櫻歌ミコ (ロリ)",
  "45. 小夜/SAYO (ノーマル)",
  "46. ナースロボ＿タイプＴ (ノーマル)",
  "47. ナースロボ＿タイプＴ (楽々)",
  "48. ナースロボ＿タイプＴ (恐怖)",
  "49. ナースロボ＿タイプＴ (内緒話)",
  "50. †聖騎士 紅桜† (ノーマル)",
  "51. 雀松朱司 (ノーマル)",
  "52. 麒ヶ島宗麟 (ノーマル)",
  "53. 春歌ナナ (ノーマル)",
  "54. 猫使アル (ノーマル)",
  "55. 猫使アル (おちつき)",
  "56. 猫使アル (うきうき)",
  "57. 猫使ビィ (ノーマル)",
  "58. 猫使ビィ (おちつき)",
  "59. 猫使ビィ (人見知り)",
  "60. 中国うさぎ (ノーマル)",
  "61. 栗田まろん (ノーマル)",
];

// ==================
// Load dropdown speaker
// ==================
function loadSpeakers() {
  const select = document.getElementById("voiceSelect") as HTMLSelectElement;
  speakers.forEach((speakerName, index) => {
    const option = document.createElement("option");
    option.value = (index + 1).toString(); // pakai index sebagai speaker ID
    option.textContent = speakerName;
    select.appendChild(option);
  });
}

// ==================
// Generate voice
// ==================
async function generateVoice() {
  const input = document.getElementById("textInput") as HTMLInputElement;
  const select = document.getElementById("voiceSelect") as HTMLSelectElement;
  const player = document.getElementById("player") as HTMLAudioElement;

  const text = input.value.trim();
  const speaker = select.value;

  if (!text) {
    alert("Silakan ketik teks dulu!");
    return;
  }

  try {
    // Hapus audio lama dulu
    player.pause();
    player.src = "";

    // Request ke API
    const res = await fetch(
      `https://api.tts.quest/v3/voicevox/synthesis?text=${encodeURIComponent(
        text
      )}&speaker=${speaker}`
    );

    const data = await res.json();

    if (data.mp3DownloadUrl) {
      player.src = data.mp3DownloadUrl;
      await player.play();
    } else {
      alert("Error: " + data.errorMessage);
    }
  } catch (err) {
    console.error("Request gagal:", err);
  }
}

// ==================
// Init
// ==================
document.getElementById("btn")?.addEventListener("click", generateVoice);
loadSpeakers();
