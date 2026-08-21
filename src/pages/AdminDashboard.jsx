import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { signOut } from 'firebase/auth'
import { collection, addDoc, getDocs, orderBy, query, serverTimestamp } from 'firebase/firestore'
import { auth, db } from '../firebase'
import './Admin.css'

function AdminDashboard() {
    const navigate = useNavigate()

    const [reciters, setReciters] = useState([])
    const [reciterName, setReciterName] = useState('')
    const [reciterImageUrl, setReciterImageUrl] = useState('')
    const [reciterSaving, setReciterSaving] = useState(false)
    const [reciterMsg, setReciterMsg] = useState('')

    const [clipReciterId, setClipReciterId] = useState('')
    const [clipTitle, setClipTitle] = useState('')
    const [clipAudioUrl, setClipAudioUrl] = useState('')
    const [clipSaving, setClipSaving] = useState(false)
    const [clipMsg, setClipMsg] = useState('')

    async function loadReciters() {
        const q = query(collection(db, 'shortClipReciters'), orderBy('name'))
        const snapshot = await getDocs(q)
        setReciters(snapshot.docs.map(d => ({ id: d.id, ...d.data() })))
    }

    useEffect(() => {
        loadReciters()
    }, [])

    async function handleAddReciter(e) {
        e.preventDefault()
        if (!reciterName.trim()) return
        setReciterSaving(true)
        setReciterMsg('')
        try {
            await addDoc(collection(db, 'shortClipReciters'), {
                name: reciterName.trim(),
                imageUrl: reciterImageUrl.trim(),
                createdAt: serverTimestamp()
            })
            setReciterName('')
            setReciterImageUrl('')
            setReciterMsg('Reciter added.')
            loadReciters()
        } catch (err) {
            setReciterMsg('Failed to add reciter: ' + err.message)
        }
        setReciterSaving(false)
    }

    async function handleAddClip(e) {
        e.preventDefault()
        if (!clipReciterId || !clipTitle.trim() || !clipAudioUrl.trim()) return
        setClipSaving(true)
        setClipMsg('')
        try {
            await addDoc(collection(db, 'clips'), {
                reciterId: clipReciterId,
                title: clipTitle.trim(),
                audioUrl: clipAudioUrl.trim(),
                createdAt: serverTimestamp()
            })
            setClipTitle('')
            setClipAudioUrl('')
            setClipMsg('Clip added.')
        } catch (err) {
            setClipMsg('Failed to add clip: ' + err.message)
        }
        setClipSaving(false)
    }

    async function handleLogout() {
        await signOut(auth)
        navigate('/admin/login')
    }

    return (
        <section className="admin-dashboard">
            <div className="admin-top">
                <h1>Admin</h1>
                <button className="logout-btn" onClick={handleLogout}>Log Out</button>
            </div>

            <div className="admin-panels">
                <form className="admin-panel" onSubmit={handleAddReciter}>
                    <h2>Add Short-Clip Reciter</h2>
                    <input
                        type="text"
                        placeholder="Reciter name"
                        value={reciterName}
                        onChange={(e) => setReciterName(e.target.value)}
                        required
                    />
                    <input
                        type="url"
                        placeholder="Image URL (optional — leave blank for a letter avatar)"
                        value={reciterImageUrl}
                        onChange={(e) => setReciterImageUrl(e.target.value)}
                    />
                    <button type="submit" disabled={reciterSaving}>
                        {reciterSaving ? 'Adding...' : 'Add Reciter'}
                    </button>
                    {reciterMsg && <p className="admin-msg">{reciterMsg}</p>}
                </form>

                <form className="admin-panel" onSubmit={handleAddClip}>
                    <h2>Add Clip</h2>
                    <select
                        value={clipReciterId}
                        onChange={(e) => setClipReciterId(e.target.value)}
                        required
                    >
                        <option value="">Select a reciter...</option>
                        {reciters.map(r => (
                            <option key={r.id} value={r.id}>{r.name}</option>
                        ))}
                    </select>
                    <input
                        type="text"
                        placeholder="Title (e.g. Al-Ahzab, Ayah 35)"
                        value={clipTitle}
                        onChange={(e) => setClipTitle(e.target.value)}
                        required
                    />
                    <input
                        type="url"
                        placeholder="Audio URL"
                        value={clipAudioUrl}
                        onChange={(e) => setClipAudioUrl(e.target.value)}
                        required
                    />
                    <button type="submit" disabled={clipSaving || reciters.length === 0}>
                        {clipSaving ? 'Adding...' : 'Add Clip'}
                    </button>
                    {reciters.length === 0 && (
                        <p className="admin-msg">Add a reciter first before adding clips.</p>
                    )}
                    {clipMsg && <p className="admin-msg">{clipMsg}</p>}
                </form>
            </div>
        </section>
    )
}

export default AdminDashboard
