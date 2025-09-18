import json
import requests
import time
import os

# --------------------------
# Load JSON kata-kata
# --------------------------
with open("perkenalan.json", "r", encoding="utf-8") as f:
    data = json.load(f)

# Folder untuk menyimpan audio
output_folder = "perkenalan"
os.makedirs(output_folder, exist_ok=True)

SPEAKER_ID = 24  # VOICEVOX speaker

failed_words = []

# --------------------------
# Loop semua kata
# --------------------------
for group in data["perkenalan_chika"]:
    group_name = group.get("group", "unknown")
    print(f"Processing group: {group_name}")

    for word in group["words"]:
        japan = word["japan"]
        reading = word["reading"]
        meaning = word.get("meaning", "")
        audio_path = word.get("audio", "")

        # Nama file dari JSON (ambil basename)
        if audio_path:
            filename = os.path.basename(audio_path)
        else:
            filename = f"{reading}.mp3"

        file_path = os.path.join(output_folder, filename)

        print(f"Generating audio for: {japan} ({reading}) - {meaning}")

        success = False
        retries = 3
        while not success and retries > 0:
            try:
                api_url = f"https://api.tts.quest/v3/voicevox/synthesis?text={japan}&speaker={SPEAKER_ID}"
                res = requests.get(api_url)
                res.raise_for_status()
                tts_data = res.json()
                mp3_url = tts_data.get("mp3DownloadUrl")
                if not mp3_url:
                    raise ValueError("MP3 URL tidak tersedia")
                
                # Download file MP3
                with requests.get(mp3_url, stream=True) as r:
                    r.raise_for_status()
                    with open(file_path, "wb") as f:
                        for chunk in r.iter_content(chunk_size=8192):
                            f.write(chunk)

                print(f"✅ Audio saved: {file_path}")
                success = True

            except requests.exceptions.HTTPError as e:
                print(f"⚠️ HTTP Error: {e} - retrying in 5s...")
                retries -= 1
                time.sleep(5)
            except Exception as e:
                print(f"❌ Error generating audio for {japan}: {e}")
                retries = 0
                failed_words.append(japan)

        # Delay minimal 5 detik antar kata
        time.sleep(5)

print("\n🎉 Selesai semua kata!")
if failed_words:
    print("❌ Kata-kata gagal di-generate:")
    for w in failed_words:
        print(" -", w)
