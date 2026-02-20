import admin from 'firebase-admin'

let firebaseApp = null

export const initializeFirebase = () => {
  if (firebaseApp) {
    return firebaseApp
  }

  try {
    firebaseApp = admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      }),
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
