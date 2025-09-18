import json
import os

# Path JSON dan folder audio
json_file = 'dasar.json'
audio_folder = 'audio_kata_umum'  # sesuaikan folder tempat audio disimpan

# Load JSON
with open(json_file, 'r', encoding='utf-8') as f:
    data = json.load(f)

total_kata = 0
total_audio_field = 0
total_audio_file = 0
missing_audio_field = []
missing_audio_file = []

# Iterasi per grup
for group in data.get("kata_umum", []):
    words = group.get("words", [])
    total_kata += len(words)
    
    for word in words:
        audio_path = word.get("audio", "").strip()
        if audio_path:
            total_audio_field += 1
            # Ambil nama file saja
            filename = os.path.basename(audio_path)
            full_path = os.path.join(audio_folder, filename)
            if os.path.isfile(full_path):
                total_audio_file += 1
            else:
                missing_audio_file.append(word.get("japan", "Unknown"))
        else:
            missing_audio_field.append(word.get("japan", "Unknown"))

print(f"Total kata: {total_kata}")
print(f"Total audio di field JSON: {total_audio_field}")
print(f"Total audio file benar-benar ada: {total_audio_file}")
print(f"Jumlah kata tanpa audio di field JSON: {len(missing_audio_field)}")
if missing_audio_field:
    print("Kata tanpa audio di JSON:", missing_audio_field)
print(f"Jumlah kata file audio tidak ditemukan: {len(missing_audio_file)}")
if missing_audio_file:
    print("Kata file audio hilang:", missing_audio_file)
