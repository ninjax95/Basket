import { initializeApp } from 'firebase/app'
import { initializeAuth, indexedDBLocalPersistence, connectAuthEmulator } from 'firebase/auth'
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager, connectFirestoreEmulator } from 'firebase/firestore'

// Config web Firebase : pas secrète, la sécurité est assurée par les règles Firestore (firestore.rules)
const app = initializeApp({
  apiKey: 'AIzaSyDpZuhzv8Dvnj36Rbr_Sdsx-tw8lG2VGfU',
  authDomain: 'stats-basket-2517f.firebaseapp.com',
  projectId: 'stats-basket-2517f',
  storageBucket: 'stats-basket-2517f.firebasestorage.app',
  messagingSenderId: '316628314644',
  appId: '1:316628314644:web:c19c643bc33acedb445501',
})

// initializeAuth sans résolveur popup/redirect : fonctionne aussi dans la WebView Capacitor
export const auth = initializeAuth(app, { persistence: indexedDBLocalPersistence })
auth.languageCode = 'fr'

// Cache persistant : l'app marche hors-ligne (gymnase), les écritures partent au retour du réseau
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }),
  ignoreUndefinedProperties: true,
})

// Tests locaux : VITE_EMULATORS=1 npm run build → émulateurs Firebase (npx firebase-tools emulators:start)
if (import.meta.env.VITE_EMULATORS) {
  connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true })
  connectFirestoreEmulator(db, '127.0.0.1', 8080)
}
