import { SignJWT, jwtVerify } from 'jose';


export const hashPassword = async (password: string): Promise<string> => {
  const encoder = new TextEncoder();
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveBits', 'deriveKey']
  );
  const key = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt,
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    256
  );

  // Return base64 encoded salt:hash
  const saltBase64 = btoa(String.fromCharCode(...salt));
  const hashBase64 = btoa(String.fromCharCode(...new Uint8Array(key)));
  return `${saltBase64}:${hashBase64}`;
};

export const verifyPassword = async (password: string, storedHash: string): Promise<boolean> => {
  const [saltBase64, originalHashBase64] = storedHash.split(':');
  const salt = new Uint8Array(atob(saltBase64).split('').map(c => c.charCodeAt(0)));
  const encoder = new TextEncoder();
  
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveBits', 'deriveKey']
  );
  
  const key = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt,
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    256
  );
  
  const currentHashBase64 = btoa(String.fromCharCode(...new Uint8Array(key)));
  return currentHashBase64 === originalHashBase64;
};

export const signToken = async (payload: any, secret: string) => {
  const key = new TextEncoder().encode(secret);
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(key);
};

export const verifyToken = async (token: string, secret: string) => {
  const key = new TextEncoder().encode(secret);
  try {
    const { payload } = await jwtVerify(token, key);
    return payload;
  } catch (e) {
    return null;
  }
};
