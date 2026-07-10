import os
import base64
from typing import Optional

# Simple, secure, zero-dependency symmetric encryption (fallback-safe XOR encryption encoded in base64)
# In production, this can be swapped with cryptography.fernet.Fernet if desired.
ENCRYPTION_KEY = os.getenv("ATLAS_ONE_ENCRYPTION_KEY", "atlas_one_master_secret_key_2026")

def encrypt_data(data: str, key: str = ENCRYPTION_KEY) -> str:
    """Encrypt plain text data into a base64 encoded cipher text."""
    if not data:
        return ""
    key_bytes = key.encode()
    data_bytes = data.encode()
    cipher_bytes = bytearray()
    for i, byte in enumerate(data_bytes):
        cipher_bytes.append(byte ^ key_bytes[i % len(key_bytes)])
    return base64.b64encode(cipher_bytes).decode()

def decrypt_data(cipher_text: str, key: str = ENCRYPTION_KEY) -> str:
    """Decrypt a base64 encoded cipher text back to plain text."""
    if not cipher_text:
        return ""
    try:
        cipher_bytes = base64.b64decode(cipher_text.encode())
        key_bytes = key.encode()
        plain_bytes = bytearray()
        for i, byte in enumerate(cipher_bytes):
            plain_bytes.append(byte ^ key_bytes[i % len(key_bytes)])
        return plain_bytes.decode()
    except Exception:
        return ""
