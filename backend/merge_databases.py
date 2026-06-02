import json

# 1. Load Charley Project Cases
with open('master_forensic_database.json', 'r', encoding='utf-8') as f:
    charley_db = json.load(f)

# 2. Load FBI Cases
with open('fbi_forensic_database.json', 'r', encoding='utf-8') as f:
    fbi_db = json.load(f)

# 3. Combine the lists
mega_database = charley_db + fbi_db

# 4. Save the ultimate database
with open('master_forensic_database.json', 'w', encoding='utf-8') as f:
    json.dump(mega_database, f, indent=4)

print(f"Merge Complete! Total Cases in Engine: {len(mega_database)}")