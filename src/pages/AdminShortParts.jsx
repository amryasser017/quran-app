import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { signOut } from 'firebase/auth'
import {
    collection, addDoc, getDocs, deleteDoc, updateDoc, doc,
    orderBy, query, serverTimestamp
} from 'firebase/firestore'
import { auth, db } from '../firebase'
import './Admin.css'

function AdminShortParts() {
    const navigate = useNavigate()

    const [reciters, setReciters] = useState([])
    const [allClips, setAllClips] = useState([])

    const [reciterName, setReciterName] = useState('')
    const [reciterImageUrl, setReciterImageUrl] = useState('')
    const [reciterSaving, setReciterSaving] = useState(false)
    const [reciterMsg, setReciterMsg] = useState('')

    const [clipReciterId, setClipReciterId] = useState('')
    const [clipTitle, setClipTitle] = useState('')
    const [clipAudioUrl, setClipAudioUrl] = useState('')
    const [clipSaving, setClipSaving] = useState(false)
    const [clipMsg, setClipMsg] = useState('')

    const [expandedReciterId, setExpandedReciterId] = useState(null)
    const [editingReciterId, setEditingReciterId] = useState(null)
    const [editReciterName, setEditReciterName] = useState('')
    const [editReciterImageUrl, setEditReciterImageUrl] = useState('')
    const [editingClipId, setEditingClipId] = useState(null)
    const [editClipTitle, setEditClipTitle] = useState('')
    const [editClipAudioUrl, setEditClipAudioUrl] = useState('')

    async function loadReciters() {
        const q = query(collection(db, 'shortClipReciters'), orderBy('name'))
        const snapshot = await getDocs(q)
        setReciters(snapshot.docs.map(d => ({ id: d.id, ...d.data() })))
    }

    async function loadAllClips() {
        const snapshot = await getDocs(collection(db, 'clips'))
        setAllClips(snapshot.docs.map(d => ({ id: d.id, ...d.data() })))
    }

    useEffect(() => {
        loadReciters()
        loadAllClips()
    }, [])

    function clipsForReciter(reciterId) {
        return allClips.filter(c => c.reciterId === reciterId)
    }

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
            loadAllClips()
        } catch (err) {
            setClipMsg('Failed to add clip: ' + err.message)
        }
        setClipSaving(false)
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
        await updateDoc(doc(db, 'shortClipReciters', reciterId), {
            name: editReciterName.trim(),
            imageUrl: editReciterImageUrl.trim()
        })
        setEditingReciterId(null)
        loadReciters()
    }

    async function handleDeleteReciter(reciter) {
        const clipCount = clipsForReciter(reciter.id).length
        const confirmMsg = clipCount > 0
            ? `Delete "${reciter.name}" and all ${clipCount} of their clip(s)? This cannot be undone.`
            : `Delete "${reciter.name}"? This cannot be undone.`
        if (!confirm(confirmMsg)) return

        const clipsToDelete = clipsForReciter(reciter.id)
        for (const clip of clipsToDelete) {
            await deleteDoc(doc(db, 'clips', clip.id))
        }
        await deleteDoc(doc(db, 'shortClipReciters', reciter.id))

        loadReciters()
        loadAllClips()
    }

    function startEditClip(clip) {
        setEditingClipId(clip.id)
        setEditClipTitle(clip.title)
        setEditClipAudioUrl(clip.audioUrl)
    }

    function cancelEditClip() {
        setEditingClipId(null)
    }

    async function saveEditClip(clipId) {
        if (!editClipTitle.trim() || !editClipAudioUrl.trim()) return
        await updateDoc(doc(db, 'clips', clipId), {
            title: editClipTitle.trim(),
            audioUrl: editClipAudioUrl.trim()
        })
        setEditingClipId(null)
        loadAllClips()
    }

    async function handleDeleteClip(clip) {
        if (!confirm(`Delete the clip "${clip.title}"? This cannot be undone.`)) return
        await deleteDoc(doc(db, 'clips', clip.id))
        loadAllClips()
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
                    <h1>Control Short Parts</h1>
                </div>
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

            <div className="admin-manage">
                <h2>Manage Reciters &amp; Clips</h2>

                {reciters.length === 0 ? (
                    <p className="admin-msg">No reciters yet.</p>
                ) : (
                    reciters.map(reciter => {
                        const isEditing = editingReciterId === reciter.id
                        const isExpanded = expandedReciterId === reciter.id
                        const clips = clipsForReciter(reciter.id)

                        return (
                            <div key={reciter.id} className="manage-reciter">
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
                                            onClick={() => setExpandedReciterId(isExpanded ? null : reciter.id)}
                                        >
                                            {isExpanded ? '▾' : '▸'} {reciter.name}
                                            <span className="manage-clip-count"> ({clips.length} clip{clips.length !== 1 ? 's' : ''})</span>
                                        </button>
                                        <div className="manage-btn-row">
                                            <button className="edit-btn" onClick={() => startEditReciter(reciter)}>Edit</button>
                                            <button className="delete-btn" onClick={() => handleDeleteReciter(reciter)}>Delete</button>
                                        </div>
                                    </div>
                                )}

                                {isExpanded && (
                                    <div className="manage-clips">
                                        {clips.length === 0 ? (
                                            <p className="admin-msg">No clips for this reciter yet.</p>
                                        ) : (
                                            clips.map(clip => {
                                                const isClipEditing = editingClipId === clip.id
                                                return (
                                                    <div key={clip.id} className="manage-clip-row">
                                                        {isClipEditing ? (
                                                            <div className="manage-edit-row">
                                                                <input
                                                                    type="text"
                                                                    value={editClipTitle}
                                                                    onChange={(e) => setEditClipTitle(e.target.value)}
                                                                    placeholder="Title"
                                                                />
                                                                <input
                                                                    type="url"
                                                                    value={editClipAudioUrl}
                                                                    onChange={(e) => setEditClipAudioUrl(e.target.value)}
                                                                    placeholder="Audio URL"
                                                                />
                                                                <div className="manage-btn-row">
                                                                    <button className="save-btn" onClick={() => saveEditClip(clip.id)}>Save</button>
                                                                    <button className="cancel-btn" onClick={cancelEditClip}>Cancel</button>
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <>
                                                                <span className="manage-clip-title">{clip.title}</span>
                                                                <div className="manage-btn-row">
                                                                    <button className="edit-btn" onClick={() => startEditClip(clip)}>Edit</button>
                                                                    <button className="delete-btn" onClick={() => handleDeleteClip(clip)}>Delete</button>
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
                    })
                )}
            </div>
        </section>
    )
}

export default AdminShortParts
