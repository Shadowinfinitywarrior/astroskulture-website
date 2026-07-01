import os
import requests
import time
import hashlib

cloud_name = "c-e82cbded306108d674dd68715f5333"
api_key = "675432471277472"
api_secret = "EqAQ5F_aLmlXUtlhZ33S6FhltEQ"
folder = "cf7a6f7a0c891c72efcc48041e47f299f8"
file_path = "/home/darkdevil404/.gemini/antigravity/brain/9b496ae7-87af-42d7-9294-34f397127ce0/test_design_1782226108423.png"

url = f"https://api.cloudinary.com/v1_1/{cloud_name}/image/upload"

timestamp = str(int(time.time()))

# Parameters to sign (sorted alphabetically)
params_to_sign = f"folder={folder}&timestamp={timestamp}"

# Append API secret to string
string_to_hash = params_to_sign + api_secret

# Generate SHA1 signature
signature = hashlib.sha1(string_to_hash.encode('utf-8')).hexdigest()

files = {
    'file': open(file_path, 'rb')
}

data = {
    'api_key': api_key,
    'timestamp': timestamp,
    'folder': folder,
    'signature': signature
}

print(f"Sending request to: {url}")
try:
    response = requests.post(url, files=files, data=data, timeout=30)
    print(f"Status Code: {response.status_code}")
    print(response.json())
except Exception as e:
    print(f"Error occurred: {e}")
