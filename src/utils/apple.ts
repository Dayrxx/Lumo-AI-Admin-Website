import { SignJWT, importPKCS8 } from 'jose'

export async function getAppleToken() {
  const issuerId = process.env.APPLE_ISSUER_ID
  const keyId = process.env.APPLE_KEY_ID
  let privateKey = process.env.APPLE_PRIVATE_KEY

  if (!issuerId || !keyId || !privateKey) {
    return null
  }

  // Handle newlines in environment variables
  if (privateKey.includes('\\n')) {
    privateKey = privateKey.replace(/\\n/g, '\n')
  }
  // Remove quotes if they exist
  if (privateKey.startsWith('"') && privateKey.endsWith('"')) {
    privateKey = privateKey.slice(1, -1)
  }

  try {
    const privateKeyObj = await importPKCS8(privateKey, 'ES256')

    const token = await new SignJWT({})
      .setProtectedHeader({ alg: 'ES256', kid: keyId, typ: 'JWT' })
      .setIssuer(issuerId)
      .setIssuedAt()
      .setExpirationTime('20m')
      .setAudience('appstoreconnect-v1')
      .sign(privateKeyObj)

    return token
  } catch (error) {
    console.error('Error generating Apple token:', error)
    return null
  }
}

export async function getAppleApps() {
  const token = await getAppleToken()
  if (!token) return null

  try {
    const response = await fetch('https://api.appstoreconnect.apple.com/v1/apps?filter[bundleId]=ai.lumo.productscanner', {
      headers: {
        'Authorization': `Bearer ${token}`
      },
      next: { revalidate: 3600 }
    })

    if (!response.ok) return null

    const data = await response.json()
    return data.data
  } catch (error) {
    console.error('Error fetching Apple apps:', error)
    return null
  }
}

export async function getAppleAppMetrics(appId: string) {
  const token = await getAppleToken()
  if (!token) return null

  try {
    // Note: To get real metrics like downloads, sessions, crashes, we need to use the Analytics API
    // The App Store Connect API requires specific endpoints and parameters for metrics
    // For now, we'll fetch basic app info and app store versions as a starting point
    const response = await fetch(`https://api.appstoreconnect.apple.com/v1/apps/${appId}?include=appStoreVersions,appInfos`, {
      headers: {
        'Authorization': `Bearer ${token}`
      },
      next: { revalidate: 3600 }
    })

    if (!response.ok) return null

    const data = await response.json()
    return data
  } catch (error) {
    console.error('Error fetching Apple metrics:', error)
    return null
  }
}
