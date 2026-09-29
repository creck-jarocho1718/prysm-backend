import urllib.request
import urllib.parse
import sys

# Read the file
with open('/workspace/prysm-frontend.zip', 'rb') as f:
    file_data = f.read()

# Try transfer.sh
print("Uploading to transfer.sh...")
req = urllib.request.Request(
    'https://transfer.sh/prysm-frontend.zip',
    data=file_data,
    headers={'Content-Type': 'application/zip'},
    method='POST'
)

try:
    with urllib.request.urlopen(req, timeout=120) as response:
        url = response.read().decode('utf-8')
        print(f"SUCCESS: {url}")
except Exception as e:
    print(f"transfer.sh failed: {e}")
    # Try alternative: file.io
    print("Trying file.io...")
    try:
        import urllib.request
        boundary = '----WebKitFormBoundary7MA4YWxkTrZu0gW'
        body = b'--' + boundary.encode() + b'\r\nContent-Disposition: form-data; name="file"; filename="prysm-frontend.zip"\r\nContent-Type: application/zip\r\n\r\n' + file_data + b'\r\n--' + boundary.encode() + b'--\r\n'
        req2 = urllib.request.Request(
            'https://file.io',
            data=body,
            headers={'Content-Type': f'multipart/form-data; boundary={boundary}'},
            method='POST'
        )
        with urllib.request.urlopen(req2, timeout=120) as response:
            import json
            result = json.loads(response.read().decode('utf-8'))
            if result.get('success'):
                print(f"SUCCESS: {result.get('link')}")
            else:
                print(f"file.io failed: {result}")
    except Exception as e2:
        print(f"file.io failed: {e2}")
        sys.exit(1)
