import { app } from './app.js'
import connectDB from './db/index.js'
import { initializeFirebase } from './config/firebase.js'

const port = process.env.PORT || 3000

// Initialize Firebase Admin SDK
initializeFirebase()

connectDB()
  .then(() => {
    app.listen(port, () => {
      console.log(`Express server listening at port: ${port}`)
    })
  })
  .catch((error) =>
    console.log(
      `Following error occured while connecting to the MongoDB: ${error}`,
    ),
  )
