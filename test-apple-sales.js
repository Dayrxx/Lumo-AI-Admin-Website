import { SignJWT, importPKCS8 } from 'jose';
import * as zlib from 'zlib';

async function generateToken() {
  const issuerId = 'cc31c5a2-48a2-4377-8de5-23e607538b36';
  const keyId = 'FF8M4232TZ';
  const privateKey = `-----BEGIN PRIVATE KEY-----\nMIGTAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBHkwdwIBAQQgz7fghI/OsJg6Vhpm\n8sJMP+7e44Zq/ZU+0qFY7rzkrqegCgYIKoZIzj0DAQehRANCAAQO8BTOdh0czQsV\no1qbbPN78uzdkzC1L7ZWDnMta5yVO0agP5YypwzkpVelolTeOhX4hZiENJgxl8tJ\nXWxXcCWn\n-----END PRIVATE KEY-----`;

  const privateKeyObj = await importPKCS8(privateKey, 'ES256');

  const token = await new SignJWT({})
    .setProtectedHeader({ alg: 'ES256', kid: keyId, typ: 'JWT' })
    .setIssuer(issuerId)
    .setIssuedAt()
    .setExpirationTime('20m')
    .setAudience('appstoreconnect-v1')
    .sign(privateKeyObj);

  return token;
}

async function testAppleSales() {
  try {
    const token = await generateToken();
    
    // Vendor number is needed for sales reports. Let's see if we can get it from the API.
    // Actually, we can't easily get vendor number from API. Let's try without it or check if we can find it.
    // Let's just fetch the user info to see if it has vendor number.
    const userRes = await fetch('https://api.appstoreconnect.apple.com/v1/users', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const userData = await userRes.json();
    console.log('Users:', JSON.stringify(userData, null, 2));
    
  } catch (e) {
    console.error('Error:', e);
  }
}

testAppleSales();