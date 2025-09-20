import requests
import time
import os

# --------------------------
# Kata yang ingin di-generate
# --------------------------
word_japan = "こんにちは、私の名前はハナです。よろしくお願いします。"  # Ganti dengan kata/kalimat yang diinginkan
speaker_id = 4    # VOICEVOX speaker
output_folder = "rekan"
os.makedirs(output_folder, exist_ok=True)
filename = f"{word_japan}.mp3"
file_path = os.path.join(output_folder, filename)

# --------------------------
# Pengaturan retry & polling
# --------------------------
POLL_INTERVAL = 3
MAX_POLLS = 10
retries = 3
failed_words = []

# --------------------------
# Generate TTS dengan error handling
# --------------------------
while retries > 0:
    try:
        api_url = f"https://api.tts.quest/v3/voicevox/synthesis?text={word_japan}&speaker={speaker_id}"
        res = requests.get(api_url)
        res.raise_for_status()
        tts_data = res.json()

        # Polling sampai selesai
        polls = 0
        while tts_data.get("isProcessing", False) and polls < MAX_POLLS:
            print(f"⏳ Audio processing... checking again in {POLL_INTERVAL}s")
            time.sleep(POLL_INTERVAL)
            res = requests.get(api_url)
            res.raise_for_status()
            tts_data = res.json()
            polls += 1

        if tts_data.get("isProcessing", False):
            raise TimeoutError("Audio generation timed out after maximum polls.")

        # Tunggu sebentar sebelum download
        print("✅ Processing finished. Waiting 2s for file to be ready...")
        time.sleep(2)

        mp3_url = tts_data.get("mp3DownloadUrl")
        if not mp3_url:
            raise ValueError("MP3 URL tidak tersedia setelah pemrosesan selesai")

        # Download file
        with requests.get(mp3_url, stream=True) as r:
            r.raise_for_status()
            with open(file_path, "wb") as f:
                for chunk in r.iter_content(chunk_size=8192):
                    f.write(chunk)

        print(f"✅ Audio saved: {file_path}")
        break  # keluar loop jika sukses

    except requests.exceptions.HTTPError as e:
        # Retry hanya untuk server error (5xx) atau 404
        if e.response.status_code >= 500 or e.response.status_code == 404:
            print(f"⚠️ HTTP Error: {e} - retrying in 5s...")
            retries -= 1
            time.sleep(5)
        else:
            print(f"❌ HTTP Error (fatal): {e}")
            failed_words.append(word_japan)
            break
    except Exception as e:
        print(f"❌ Error generating audio for {word_japan}: {e}")
        retries -= 1
        time.sleep(5)
        if retries == 0:
            failed_words.append(word_japan)

if failed_words:
    print("\n❌ Failed to generate audio for:")
    for w in failed_words:
        print(f" - {w}")
