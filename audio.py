import json
import requests
import time
import os

# --------------------------
# Load JSON kata-kata
# --------------------------
with open("public/scripts/chapter5/rekan.json", "r", encoding="utf-8") as f:
    data = json.load(f)

# Folder untuk menyimpan audio
output_folder = "rekan"
os.makedirs(output_folder, exist_ok=True)

SPEAKER_ID = 13 # VOICEVOX speaker
POLL_INTERVAL = 3 # Detik untuk menunggu antar polling
MAX_POLLS = 10    # Maksimum percobaan polling sebelum menyerah

failed_words = []

# --------------------------
# Loop semua kata
# --------------------------
for group in data["rekan_kerja"]:
    group_name = group.get("group", "unknown")
    print(f"\nProcessing group: {group_name}")

    for example in group["words"]:
        japan = example["japan"]
        reading = example["reading"]
        meaning = example.get("meaning", "")
        audio_path = example.get("audio", "")

        if audio_path:
            filename = os.path.basename(audio_path)
        else:
            filename = f"{reading}.mp3"

        file_path = os.path.join(output_folder, filename)

        if os.path.exists(file_path):
            print(f"⏩ Skipping, already exists: {filename}")
            continue

        print(f"Generating audio for: {japan} ({reading}) - {meaning}")

        success = False
        retries = 3
        while not success and retries > 0:
            try:
                api_url = f"https://api.tts.quest/v3/voicevox/synthesis?text={japan}&speaker={SPEAKER_ID}"
                res = requests.get(api_url)
                res.raise_for_status()
                tts_data = res.json()

                polls = 0
                while tts_data.get("isProcessing", False) and polls < MAX_POLLS:
                    print(f"⏳ Audio is processing, checking again in {POLL_INTERVAL}s...")
                    time.sleep(POLL_INTERVAL)
                    
                    res = requests.get(api_url)
                    res.raise_for_status()
                    tts_data = res.json()
                    polls += 1

                if tts_data.get("isProcessing", False):
                    raise TimeoutError("Audio generation timed out after maximum polls.")

                # --- PERUBAHAN KUNCI ADA DI SINI ---
                print("✅ Processing finished. Waiting 2s for file to be ready on server...")
                time.sleep(2) # Jeda tambahan 2 detik untuk memastikan file siap diunduh
                # --- AKHIR PERUBAHAN ---
                
                mp3_url = tts_data.get("mp3DownloadUrl")
                if not mp3_url:
                    raise ValueError("MP3 URL tidak tersedia setelah pemrosesan selesai")
                
                with requests.get(mp3_url, stream=True) as r:
                    r.raise_for_status()
                    with open(file_path, "wb") as f:
                        for chunk in r.iter_content(chunk_size=8192):
                            f.write(chunk)

                print(f"✅ Audio saved: {file_path}")
                success = True

            except requests.exceptions.HTTPError as e:
                # Hanya retry jika error 5xx (server error) atau 404 (file not found)
                if e.response.status_code >= 500 or e.response.status_code == 404:
                    print(f"⚠️ HTTP Error: {e} - retrying in 5s...")
                    retries -= 1
                    time.sleep(5)
                else: # Untuk error client lain (400, 403, dll), langsung gagal
                    raise e
            except Exception as e:
                print(f"❌ Error generating audio for {japan}: {e}")
                retries = 0
                failed_words.append(japan)
        
        time.sleep(1) 

print("\n🎉 Selesai semua kata!")
if failed_words:
    print("❌ Kata-kata gagal di-generate:")
    for w in failed_words:
        print(f" - {w}")