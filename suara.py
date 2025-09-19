import requests
import time
import os

# --------------------------
# Pengaturan
# --------------------------
TEXT = "さて、私の名前はアキラです"   # teks yang dibacakan
OUTPUT_FOLDER = "akira_speakers"
os.makedirs(OUTPUT_FOLDER, exist_ok=True)

failed_speakers = []

# --------------------------
# Loop semua speaker 21-40
# --------------------------
for speaker_id in range(21, 22):
    filename = f"akira_speaker_{speaker_id}.mp3"
    file_path = os.path.join(OUTPUT_FOLDER, filename)

    print(f"🎙️ Generating audio for speaker {speaker_id} ...")

    success = False
    retries = 3
    while not success and retries > 0:
        try:
            api_url = f"https://api.tts.quest/v3/voicevox/synthesis?text={TEXT}&speaker={speaker_id}"
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
            print(f"❌ Error generating audio for speaker {speaker_id}: {e}")
            retries = 0
            failed_speakers.append(speaker_id)

    # Delay minimal 5 detik antar request (biar aman dari rate limit)
    time.sleep(5)

print("\n🎉 Selesai semua speaker!")
if failed_speakers:
    print("❌ Speaker gagal di-generate:")
    for s in failed_speakers:
        print(" -", s)
