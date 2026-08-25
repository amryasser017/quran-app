import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { signOut } from 'firebase/auth'
import {
    collection, addDoc, getDocs, deleteDoc, updateDoc, doc,
    orderBy, query, serverTimestamp
} from 'firebase/firestore'
import { auth, db } from '../firebase'
import { getReciters } from '../api'
import './Admin.css'

function AdminFullSowar() {
    const navigate = useNavigate()

    const [apiReciters, setApiReciters] = useState([])
    const [customReciters, setCustomReciters] = useState([])
    const [allSurahs, setAllSurahs] = useState([])

    const [reciterName, setReciterName] = useState('')
    const [reciterImageUrl, setReciterImageUrl] = useState('')
    const [reciterSaving, setReciterSaving] = useState(false)
    const [reciterMsg, setReciterMsg] = useState('')

    const [surahSource, setSurahSource] = useState('api')
    const [surahReciterId, setSurahReciterId] = useState('')
    const [surahName, setSurahName] = useState('')
    const [surahAudioUrl, setSurahAudioUrl] = useState('')
    const [surahSaving, setSurahSaving] = useState(false)
    const [surahMsg, setSurahMsg] = useState('')

    const [expandedReciterKey, setExpandedReciterKey] = useState(null)
    const [editingReciterId, setEditingReciterId] = useState(null)
    const [editReciterName, setEditReciterName] = useState('')
    const [editReciterImageUrl, setEditReciterImageUrl] = useState('')
    const [editingSurahId, setEditingSurahId] = useState(null)
    const [editSurahName, setEditSurahName] = useState('')
    const [editSurahAudioUrl, setEditSurahAudioUrl] = useState('')

    async function loadApiReciters() {
        const data = await getReciters()
        setApiReciters(data)
    }

    async function loadCustomReciters() {
        const q = query(collection(db, 'fullSowarReciters'), orderBy('name'))
        const snapshot = await getDocs(q)
        setCustomReciters(snapshot.docs.map(d => ({ id: d.id, ...d.data() })))
    }

    async function loadAllSurahs() {
        const snapshot = await getDocs(collection(db, 'fullSowarSurahs'))
        setAllSurahs(snapshot.docs.map(d => ({ id: d.id, ...d.data() })))
    }

    useEffect(() => {
        loadApiReciters()
        loadCustomReciters()
        loadAllSurahs()
    }, [])

    function reciterKey(source, id) {
        return `${source}-${id}`
    }

    function surahsForReciter(source, id) {
        return allSurahs.filter(s => s.reciterSource === source && s.reciterId === String(id))
    }

    const combinedReciters = [
        ...apiReciters.map(r => ({ source: 'api', id: String(r.id), name: r.name })),
        ...customReciters.map(r => ({ source: 'custom', id: r.id, name: r.name, imageUrl: r.imageUrl }))
    ]

    async function handleAddReciter(e) {
        e.preventDefault()
        if (!reciterName.trim()) return
        setReciterSaving(true)
        setReciterMsg('')
        try {
            await addDoc(collection(db, 'fullSowarReciters'), {
                name: reciterName.trim(),
                imageUrl: reciterImageUrl.trim(),
                createdAt: serverTimestamp()
            })
            setReciterName('')
            setReciterImageUrl('')
            setReciterMsg('Reciter added.')
            loadCustomReciters()
        } catch (err) {
            setReciterMsg('Failed to add reciter: ' + err.message)
        }
        setReciterSaving(false)
    }

    async function handleAddSurah(e) {
        e.preventDefault()
        if (!surahReciterId || !surahName.trim() || !surahAudioUrl.trim()) return
        setSurahSaving(true)
        setSurahMsg('')
        try {
            await addDoc(collection(db, 'fullSowarSurahs'), {
                reciterId: String(surahReciterId),
                reciterSource: surahSource,
                surahName: surahName.trim(),
                audioUrl: surahAudioUrl.trim(),
                createdAt: serverTimestamp()
            })
            setSurahName('')
            setSurahAudioUrl('')
            setSurahMsg('Surah added.')
            loadAllSurahs()
        } catch (err) {
            setSurahMsg('Failed to add surah: ' + err.message)
        }
        setSurahSaving(false)
    }

    function startEditReciter(reciter) {
        setEditingReciterId(reciter.id)
        setEditReciterName(reciter.name)
        setEditReciterImageUrl(reciter.imageUrl || '')
    }

    function cancelEditReciter() {
        setEditingReciterId(null)
    }

    async function saveEditReciter(reciterId) {
        if (!editReciterName.trim()) return
        await updateDoc(doc(db, 'fullSowarReciters', reciterId), {
            name: editReciterName.trim(),
            imageUrl: editReciterImageUrl.trim()
        })
        setEditingReciterId(null)
        loadCustomReciters()
    }

    async function handleDeleteReciter(reciter) {
        const surahs = surahsForReciter('custom', reciter.id)
        const confirmMsg = surahs.length > 0
            ? `Delete "${reciter.name}" and all ${surahs.length} surah(s) added for them? This cannot be undone.`
            : `Delete "${reciter.name}"? This cannot be undone.`
        if (!confirm(confirmMsg)) return

        for (const surah of surahs) {
            await deleteDoc(doc(db, 'fullSowarSurahs', surah.id))
        }
        await deleteDoc(doc(db, 'fullSowarReciters', reciter.id))

        loadCustomReciters()
        loadAllSurahs()
    }

    function startEditSurah(surah) {
        setEditingSurahId(surah.id)
        setEditSurahName(surah.surahName)
        setEditSurahAudioUrl(surah.audioUrl)
    }

    function cancelEditSurah() {
        setEditingSurahId(null)
    }

    async function saveEditSurah(surahId) {
        if (!editSurahName.trim() || !editSurahAudioUrl.trim()) return
        await updateDoc(doc(db, 'fullSowarSurahs', surahId), {
            surahName: editSurahName.trim(),
            audioUrl: editSurahAudioUrl.trim()
        })
        setEditingSurahId(null)
        loadAllSurahs()
    }

    async function handleDeleteSurah(surah) {
        if (!confirm(`Delete the surah "${surah.surahName}"? This cannot be undone.`)) return
        await deleteDoc(doc(db, 'fullSowarSurahs', surah.id))
        loadAllSurahs()
    }

    async function handleLogout() {
        await signOut(auth)
        navigate('/admin/login')
    }

    return (
        <section className="admin-dashboard">
            <div className="admin-top">
                <div>
                    <Link to="/admin" className="back-link">&larr; Back to Admin</Link>
                    <h1>Control Full Sowar</h1>
                </div>
                <button className="logout-btn" onClick={handleLogout}>Log Out</button>
            </div>

            <div className="admin-panels">
                <form className="admin-panel" onSubmit={handleAddReciter}>
                    <h2>Add a New Reciter</h2>
                    <p className="admin-hint">For a reciter not already pulled from the API.</p>
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

                <form className="admin-panel" onSubmit={handleAddSurah}>
                    <h2>Add a Surah</h2>
                    <p className="admin-hint">Works for reciters already in the app (from the API) or ones you added above.</p>

                    <select
                        value={surahSource}
                        onChange={(e) => { setSurahSource(e.target.value); setSurahReciterId('') }}
                    >
                        <option value="api">Existing reciter (already in the app)</option>
                        <option value="custom">My added reciter</option>
                    </select>

                    <select
                        value={surahReciterId}
                        onChange={(e) => setSurahReciterId(e.target.value)}
                        required
                    >
                        <option value="">Select a reciter...</option>
                        {surahSource === 'api'
                            ? apiReciters.map(r => (
                                <option key={r.id} value={r.id}>{r.name}</option>
                            ))
                            : customReciters.map(r => (
                                <option key={r.id} value={r.id}>{r.name}</option>
                            ))
                        }
                    </select>

                    <input
                        type="text"
                        placeholder="Surah name (e.g. Al-Kahf)"
                        value={surahName}
                        onChange={(e) => setSurahName(e.target.value)}
                        required
                    />
                    <input
                        type="url"
                        placeholder="Audio URL"
                        value={surahAudioUrl}
                        onChange={(e) => setSurahAudioUrl(e.target.value)}
                        required
                    />
                    <button type="submit" disabled={surahSaving}>
                        {surahSaving ? 'Adding...' : 'Add Surah'}
                    </button>
                    {surahSource === 'custom' && customReciters.length === 0 && (
                        <p className="admin-msg">Add a reciter above first.</p>
                    )}
                    {surahMsg && <p className="admin-msg">{surahMsg}</p>}
                </form>
            </div>

            <div className="admin-manage">
                <h2>Manage Reciters &amp; Surahs</h2>
                <p className="admin-hint">
                    Showing reciters with admin-added surahs, plus any reciters you've fully added yourself.
                    Reciters pulled from the API with no admin-added surahs aren't listed here — there are too many to manage individually.
                </p>

                {combinedReciters
                    .filter(r => r.source === 'custom' || surahsForReciter(r.source, r.id).length > 0)
                    .map(reciter => {
                        const key = reciterKey(reciter.source, reciter.id)
                        const isExpanded = expandedReciterKey === key
                        const isEditing = reciter.source === 'custom' && editingReciterId === reciter.id
                        const surahs = surahsForReciter(reciter.source, reciter.id)

                        return (
                            <div key={key} className="manage-reciter">
                                {isEditing ? (
                                    <div className="manage-edit-row">
                                        <input
                                            type="text"
                                            value={editReciterName}
                                            onChange={(e) => setEditReciterName(e.target.value)}
                                            placeholder="Name"
                                        />
                                        <input
                                            type="url"
                                            value={editReciterImageUrl}
                                            onChange={(e) => setEditReciterImageUrl(e.target.value)}
                                            placeholder="Image URL"
                                        />
                                        <div className="manage-btn-row">
                                            <button className="save-btn" onClick={() => saveEditReciter(reciter.id)}>Save</button>
                                            <button className="cancel-btn" onClick={cancelEditReciter}>Cancel</button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="manage-row">
                                        <button
                                            className="manage-name-btn"
                                            onClick={() => setExpandedReciterKey(isExpanded ? null : key)}
                                        >
                                            {isExpanded ? '▾' : '▸'} {reciter.name}
                                            <span className="manage-clip-count">
                                                {' '}({surahs.length} surah{surahs.length !== 1 ? 's' : ''}
                                                {reciter.source === 'api' ? ' added' : ''})
                                            </span>
                                        </button>
                                        <div className="manage-btn-row">
                                            {reciter.source === 'custom' && (
                                                <>
                                                    <button className="edit-btn" onClick={() => startEditReciter(reciter)}>Edit</button>
                                                    <button className="delete-btn" onClick={() => handleDeleteReciter(reciter)}>Delete</button>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {isExpanded && (
                                    <div className="manage-clips">
                                        {surahs.length === 0 ? (
                                            <p className="admin-msg">No surahs added for this reciter yet.</p>
                                        ) : (
                                            surahs.map(surah => {
                                                const isSurahEditing = editingSurahId === surah.id
                                                return (
                                                    <div key={surah.id} className="manage-clip-row">
                                                        {isSurahEditing ? (
                                                            <div className="manage-edit-row">
                                                                <input
                                                                    type="text"
                                                                    value={editSurahName}
                                                                    onChange={(e) => setEditSurahName(e.target.value)}
                                                                    placeholder="Surah name"
                                                                />
                                                                <input
                                                                    type="url"
                                                                    value={editSurahAudioUrl}
                                                                    onChange={(e) => setEditSurahAudioUrl(e.target.value)}
                                                                    placeholder="Audio URL"
                                                                />
                                                                <div className="manage-btn-row">
                                                                    <button className="save-btn" onClick={() => saveEditSurah(surah.id)}>Save</button>
                                                                    <button className="cancel-btn" onClick={cancelEditSurah}>Cancel</button>
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <>
                                                                <span className="manage-clip-title">{surah.surahName}</span>
                                                                <div className="manage-btn-row">
                                                                    <button className="edit-btn" onClick={() => startEditSurah(surah)}>Edit</button>
                                                                    <button className="delete-btn" onClick={() => handleDeleteSurah(surah)}>Delete</button>
                                                                </div>
                                                            </>
                                                        )}
                                                    </div>
                                                )
                                            })
                                        )}
                                    </div>
                                )}
                            </div>
                        )
                    })}
            </div>
        </section>
    )
}

export default AdminFullSowar
