import urllib.request
import zipfile
import os
import shutil

url = 'https://files.catbox.moe/yhlrpz.zip'
output = '/workspace/catbox-download.zip'

print("Downloading from catbox.moe...")
try:
    urllib.request.urlretrieve(url, output)
    print(f"Downloaded to {output}")

    # Check it's a valid zip
    with zipfile.ZipFile(output, 'r') as zf:
        print(f"Valid ZIP with {len(zf.namelist())} files")
        zf.extractall('/workspace/prysm-test')
        print("Extracted to /workspace/prysm-test")

except Exception as e:
    print(f"Error: {e}")
