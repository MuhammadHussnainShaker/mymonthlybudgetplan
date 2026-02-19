import admin from 'firebase-admin'

let firebaseApp = null

export const initializeFirebase = () => {
  if (firebaseApp) {
    return firebaseApp
  }

  try {
    firebaseApp = admin.initializeApp({
      credential: admin.credential.cert(
        process.env.FIREBASE_SERVICE_ACCOUNT_PATH,
      ),
    })
    console.log('Firebase Admin SDK initialized successfully')
    return firebaseApp
  } catch (error) {
    console.error('Failed to initialize Firebase Admin SDK:', error.message)
    return null
  }
}

export const getAuth = () => {
  if (!firebaseApp) {
    throw new Error('Firebase is not initialized')
  }
  return admin.auth()
}

export default admin
