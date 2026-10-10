import { useEffect, useRef, useState } from 'react'
import { onAuthStateChanged, signOut, deleteUser, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth'
import { collection, doc, onSnapshot, query, where, orderBy, addDoc, setDoc, updateDoc, deleteDoc, getDocs, writeBatch } from 'firebase/firestore'
import { auth, db } from '../firebase'

// Firestore : users/{uid}/players/{playerId} et users/{uid}/matches/{matchId} (champ playerId)
// Les photos restent sur l'appareil (pas d'hébergement de fichiers)

// JSON à clés triées : Firestore ne garde pas l'ordre des champs
const stable = v => JSON.stringify(v, (k, val) =>
  val && typeof val === 'object' && !Array.isArray(val)
    ? Object.keys(val).sort().reduce((o, key) => { o[key] = val[key]; return o }, {})
    : val
)
const toRemote = (m, playerId) => {
  const { photo, ...rest } = m
  return JSON.parse(JSON.stringify({ ...rest, playerId }))
}
const byDate = (a, b) => new Date(a.date) - new Date(b.date)

export function useCloud({ history, importHistory, player, updatePlayer }) {
  const [user, setUser] = useState(undefined) // undefined = vérification en cours
  const [players, setPlayers] = useState([])
  const [activePlayerId, setActivePlayerId] = useState(() => localStorage.getItem('basketActivePlayer') || '')
  const remoteRef = useRef(null) // id → JSON du match en ligne ; null tant que la 1re lecture n'est pas faite
  const historyRef = useRef(history)
  historyRef.current = history
  const deletingRef = useRef(false)

  useEffect(() => onAuthStateChanged(auth, setUser), [])

  const activePlayer = players.find(p => p.id === activePlayerId) || players[0]
  const pid = activePlayer?.id

  // Joueurs du compte. 1re connexion : crée le joueur à partir du profil local
  useEffect(() => {
    if (!user) { setPlayers([]); return }
    const col = collection(db, 'users', user.uid, 'players')
    return onSnapshot(query(col, orderBy('createdAt')), snap => {
      if (snap.empty && !snap.metadata.fromCache && !deletingRef.current) {
        addDoc(col, { name: player.name || 'Mon joueur', number: player.number || '', createdAt: Date.now() })
        return
      }
      setPlayers(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    })
  }, [user])

  useEffect(() => { if (pid) localStorage.setItem('basketActivePlayer', pid) }, [pid])

  // Joueur actif → profil local utilisé partout dans l'app
  useEffect(() => {
    if (!activePlayer) return
    if (activePlayer.name !== player.name) updatePlayer('name', activePlayer.name)
    if (activePlayer.number !== player.number) updatePlayer('number', activePlayer.number)
  }, [pid, activePlayer?.name, activePlayer?.number])

  // Nom / numéro modifiés dans Options → joueur en ligne
  useEffect(() => {
    if (!user || !activePlayer) return
    if (activePlayer.name !== player.name || activePlayer.number !== player.number) {
      updateDoc(doc(db, 'users', user.uid, 'players', pid), { name: player.name, number: player.number })
    }
  }, [player.name, player.number])

  // Matchs du joueur actif : en ligne → appareil
  useEffect(() => {
    remoteRef.current = null
    if (!user || !pid) return
    const migratedKey = `basketMigrated_${user.uid}`
    const q = query(collection(db, 'users', user.uid, 'matches'), where('playerId', '==', pid))
    return onSnapshot(q, { includeMetadataChanges: true }, snap => {
      const migrated = localStorage.getItem(migratedKey)
      if (!migrated && snap.metadata.fromCache) return // attendre le serveur avant de proposer l'import
      const remote = snap.docs.map(d => d.data()).sort(byDate)
      let next = remote
      if (!migrated) {
        // 1re connexion sur cet appareil : proposer d'ajouter les matchs déjà enregistrés ici
        localStorage.setItem(migratedKey, '1')
        const ids = new Set(remote.map(m => m.id))
        const localOnly = historyRef.current.filter(m => !ids.has(m.id))
        if (localOnly.length > 0 && confirm(`Ajouter à ton compte les ${localOnly.length} match(s) enregistrés sur cet appareil ?`)) {
          next = [...remote, ...localOnly].sort(byDate)
        }
      }
      remoteRef.current = new Map(remote.map(m => [String(m.id), stable(m)]))
      const photos = new Map(historyRef.current.filter(m => m.photo).map(m => [m.id, m.photo]))
      importHistory(next.map(m => photos.has(m.id) ? { ...m, photo: photos.get(m.id) } : m))
    })
  }, [user, pid])

  // Matchs : appareil → en ligne (ajouts, modifications, suppressions)
  useEffect(() => {
    const remote = remoteRef.current
    if (!remote || !user || !pid) return
    const ids = new Set()
    history.forEach(m => {
      const id = String(m.id)
      const data = toRemote(m, pid)
      ids.add(id)
      if (remote.get(id) !== stable(data)) setDoc(doc(db, 'users', user.uid, 'matches', id), data)
    })
    remote.forEach((_, id) => {
      if (!ids.has(id)) deleteDoc(doc(db, 'users', user.uid, 'matches', id))
    })
  }, [history])

  const addPlayer = async (name, number = '') => {
    const ref = await addDoc(collection(db, 'users', user.uid, 'players'), { name, number, createdAt: Date.now() })
    setActivePlayerId(ref.id)
  }

  // Supprime des documents par lots (limite Firestore : 500 opérations par lot)
  const deleteDocs = async refs => {
    for (let i = 0; i < refs.length; i += 400) {
      const batch = writeBatch(db)
      refs.slice(i, i + 400).forEach(r => batch.delete(r))
      await batch.commit()
    }
  }

  const deletePlayer = async (playerId) => {
    const matches = await getDocs(query(collection(db, 'users', user.uid, 'matches'), where('playerId', '==', playerId)))
    await deleteDocs([...matches.docs.map(d => d.ref), doc(db, 'users', user.uid, 'players', playerId)])
    setActivePlayerId(players.find(p => p.id !== playerId)?.id || '')
  }

  const logout = async () => {
    await signOut(auth)
    importHistory([]) // les matchs du compte ne restent pas sur l'appareil
  }

  // Suppression du compte et de toutes ses données (exigée par Google Play)
  const deleteAccount = async () => {
    const current = auth.currentUser
    const password = prompt('Pour confirmer la suppression, entre ton mot de passe :')
    if (!password) return false
    await reauthenticateWithCredential(current, EmailAuthProvider.credential(current.email, password))
    deletingRef.current = true
    const [playerDocs, matchDocs] = await Promise.all([
      getDocs(collection(db, 'users', current.uid, 'players')),
      getDocs(collection(db, 'users', current.uid, 'matches')),
    ])
    await deleteDocs([...playerDocs.docs, ...matchDocs.docs].map(d => d.ref))
    await deleteUser(current)
    deletingRef.current = false
    importHistory([])
    return true
  }

  return { user, players, activePlayer, setActivePlayerId, addPlayer, deletePlayer, logout, deleteAccount }
}
