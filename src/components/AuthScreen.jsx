import { useState } from 'react'
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth'
import { auth } from '../firebase'

const ERRORS = {
  'auth/invalid-email': 'Adresse e-mail invalide.',
  'auth/invalid-credential': 'E-mail ou mot de passe incorrect.',
  'auth/wrong-password': 'E-mail ou mot de passe incorrect.',
  'auth/user-not-found': 'Aucun compte avec cet e-mail.',
  'auth/email-already-in-use': 'Un compte existe déjà avec cet e-mail.',
  'auth/weak-password': 'Mot de passe trop court (6 caractères minimum).',
  'auth/too-many-requests': 'Trop de tentatives, réessaie dans quelques minutes.',
  'auth/network-request-failed': 'Pas de connexion internet.',
}

function AuthScreen() {
  const [mode, setMode] = useState('login') // 'login' | 'signup'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      if (mode === 'signup') await createUserWithEmailAndPassword(auth, email.trim(), password)
      else await signInWithEmailAndPassword(auth, email.trim(), password)
    } catch (err) {
      setError(ERRORS[err.code] || err.message)
    } finally {
      setBusy(false)
    }
  }

  const resetPassword = async () => {
    if (!email.trim()) {
      setError('Entre ton e-mail, puis clique sur « Mot de passe oublié ».')
      return
    }
    try {
      await sendPasswordResetEmail(auth, email.trim())
      setError('')
      alert(`E-mail de réinitialisation envoyé à ${email.trim()} (pense aux spams).`)
    } catch (err) {
      setError(ERRORS[err.code] || err.message)
    }
  }

  return (
    <div className="auth-screen">
      <form className="auth-card" onSubmit={submit}>
        <div className="auth-logo">🏀</div>
        <h1>Stats Basket</h1>
        <p className="auth-sub">{mode === 'signup' ? 'Crée ton compte' : 'Connecte-toi pour retrouver tes stats'}</p>

        <input
          type="email"
          placeholder="E-mail"
          autoComplete="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Mot de passe"
          autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
          value={password}
          onChange={e => setPassword(e.target.value)}
          minLength={6}
          required
        />

        {error && <p className="auth-error">{error}</p>}

        <button type="submit" className="auth-submit" disabled={busy}>
          {busy ? '⏳' : mode === 'signup' ? 'Créer mon compte' : 'Se connecter'}
        </button>

        {mode === 'login' && (
          <button type="button" className="auth-link" onClick={resetPassword}>Mot de passe oublié ?</button>
        )}
        <button type="button" className="auth-link" onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError('') }}>
          {mode === 'login' ? 'Pas encore de compte ? Créer un compte' : 'Déjà un compte ? Se connecter'}
        </button>
      </form>
    </div>
  )
}

export default AuthScreen
