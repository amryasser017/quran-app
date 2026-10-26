import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { signOut } from 'firebase/auth'
import {
    collection, addDoc, getDocs, deleteDoc, updateDoc, doc,
    orderBy, query, serverTimestamp
} from 'firebase/firestore'
import { auth, db } from '../firebase'
import { uploadAudioFile } from '../utils/uploadAudio'
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
    const [clipAudioFile, setClipAudioFile] = useState(null)
    const [clipSaving, setClipSaving] = useState(false)
    const [clipProgress, setClipProgress] = useState(0)
    const [clipMsg, setClipMsg] = useState('')

    const [expandedReciterId, setExpandedReciterId] = useState(null)
    const [editingReciterId, setEditingReciterId] = useState(null)
    const [editReciterName, setEditReciterName] = useState('')
    const [editReciterImageUrl, setEditReciterImageUrl] = useState('')
    const [editingClipId, setEditingClipId] = useState(null)
    const [editClipTitle, setEditClipTitle] = useState('')
    const [editClipAudioFile, setEditClipAudioFile] = useState(null)
    const [editClipSaving, setEditClipSaving] = useState(false)
    const [editClipProgress, setEditClipProgress] = useState(0)

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
            setReciterMsg('تمت إضافة القارئ.')
            loadReciters()
        } catch (err) {
            setReciterMsg('فشلت إضافة القارئ: ' + err.message)
        }
        setReciterSaving(false)
    }

    async function handleAddClip(e) {
        e.preventDefault()
        if (!clipReciterId || !clipTitle.trim() || !clipAudioFile) return
        setClipSaving(true)
        setClipProgress(0)
        setClipMsg('')
        try {
            const audioUrl = await uploadAudioFile(clipAudioFile, 'short-clips', setClipProgress)
            await addDoc(collection(db, 'clips'), {
                reciterId: clipReciterId,
                title: clipTitle.trim(),
                audioUrl,
                createdAt: serverTimestamp()
            })
            setClipTitle('')
            setClipAudioFile(null)
            setClipMsg('تمت إضافة المقطع.')
            loadAllClips()
        } catch (err) {
            setClipMsg('فشل رفع المقطع: ' + err.message)
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
            ? `حذف "${reciter.name}" وجميع مقاطعه (${clipCount})؟ لا يمكن التراجع عن هذا.`
            : `حذف "${reciter.name}"؟ لا يمكن التراجع عن هذا.`
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
        setEditClipAudioFile(null)
        setEditClipProgress(0)
    }

    function cancelEditClip() {
        setEditingClipId(null)
    }

    async function saveEditClip(clipId) {
        if (!editClipTitle.trim()) return
        setEditClipSaving(true)
        try {
            const updates = { title: editClipTitle.trim() }
            if (editClipAudioFile) {
                updates.audioUrl = await uploadAudioFile(editClipAudioFile, 'short-clips', setEditClipProgress)
            }
            await updateDoc(doc(db, 'clips', clipId), updates)
            setEditingClipId(null)
            loadAllClips()
        } catch (err) {
            alert('فشل حفظ التعديل: ' + err.message)
        }
        setEditClipSaving(false)
    }

    async function handleDeleteClip(clip) {
        if (!confirm(`حذف المقطع "${clip.title}"؟ لا يمكن التراجع عن هذا.`)) return
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
                    <Link to="/admin" className="back-link">&rarr; رجوع إلى الإدارة</Link>
                    <h1>إدارة المقاطع المختارة</h1>
                </div>
                <button className="logout-btn" onClick={handleLogout}>تسجيل الخروج</button>
            </div>

            <div className="admin-panels">
                <form className="admin-panel" onSubmit={handleAddReciter}>
                    <h2>إضافة قارئ للمقاطع المختارة</h2>
                    <input
                        type="text"
                        placeholder="اسم القارئ"
                        value={reciterName}
                        onChange={(e) => setReciterName(e.target.value)}
                        required
                    />
                    <input
                        type="url"
                        placeholder="رابط الصورة (اختياري — اتركه فارغًا لصورة بحرف)"
                        value={reciterImageUrl}
                        onChange={(e) => setReciterImageUrl(e.target.value)}
                    />
                    <button type="submit" disabled={reciterSaving}>
                        {reciterSaving ? 'جارِ الإضافة...' : 'إضافة القارئ'}
                    </button>
                    {reciterMsg && <p className="admin-msg">{reciterMsg}</p>}
                </form>

                <form className="admin-panel" onSubmit={handleAddClip}>
                    <h2>إضافة مقطع</h2>
                    <select
                        value={clipReciterId}
                        onChange={(e) => setClipReciterId(e.target.value)}
                        required
                    >
                        <option value="">اختر قارئًا...</option>
                        {reciters.map(r => (
                            <option key={r.id} value={r.id}>{r.name}</option>
                        ))}
                    </select>
                    <input
                        type="text"
                        placeholder="العنوان (مثال: الأحزاب، آية 35)"
                        value={clipTitle}
                        onChange={(e) => setClipTitle(e.target.value)}
                        required
                    />
                    <input
                        type="file"
                        accept="audio/*,video/quicktime,video/mp4,.mov,.mp4,.m4a"
                        onChange={(e) => setClipAudioFile(e.target.files[0] || null)}
                        required
                    />
                    {clipAudioFile && (
                        <p className="admin-hint" style={{ marginTop: -4 }}>{clipAudioFile.name}</p>
                    )}
                    <button type="submit" disabled={clipSaving || reciters.length === 0}>
                        {clipSaving ? `جارِ الرفع... ${clipProgress}%` : 'إضافة المقطع'}
                    </button>
                    {reciters.length === 0 && (
                        <p className="admin-msg">أضف قارئًا أولاً قبل إضافة المقاطع.</p>
                    )}
                    {clipMsg && <p className="admin-msg">{clipMsg}</p>}
                </form>
            </div>

            <div className="admin-manage">
                <h2>إدارة القراء والمقاطع</h2>

                {reciters.length === 0 ? (
                    <p className="admin-msg">لا يوجد قراء بعد.</p>
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
                                            placeholder="الاسم"
                                        />
                                        <input
                                            type="url"
                                            value={editReciterImageUrl}
                                            onChange={(e) => setEditReciterImageUrl(e.target.value)}
                                            placeholder="رابط الصورة"
                                        />
                                        <div className="manage-btn-row">
                                            <button className="save-btn" onClick={() => saveEditReciter(reciter.id)}>حفظ</button>
                                            <button className="cancel-btn" onClick={cancelEditReciter}>إلغاء</button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="manage-row">
                                        <button
                                            className="manage-name-btn"
                                            onClick={() => setExpandedReciterId(isExpanded ? null : reciter.id)}
                                        >
                                            {isExpanded ? '▾' : '▸'} {reciter.name}
                                            <span className="manage-clip-count"> ({clips.length} مقطع)</span>
                                        </button>
                                        <div className="manage-btn-row">
                                            <button className="edit-btn" onClick={() => startEditReciter(reciter)}>تعديل</button>
                                            <button className="delete-btn" onClick={() => handleDeleteReciter(reciter)}>حذف</button>
                                        </div>
                                    </div>
                                )}

                                {isExpanded && (
                                    <div className="manage-clips">
                                        {clips.length === 0 ? (
                                            <p className="admin-msg">لا توجد مقاطع لهذا القارئ بعد.</p>
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
                                                                    placeholder="العنوان"
                                                                />
                                                                <p className="admin-hint">اترك الملف فاضي للاحتفاظ بالملف الحالي، أو اختر ملفًا جديدًا لاستبداله.</p>
                                                                <input
                                                                    type="file"
                                                                    accept="audio/*,video/quicktime,video/mp4,.mov,.mp4,.m4a"
                                                                    onChange={(e) => setEditClipAudioFile(e.target.files[0] || null)}
                                                                />
                                                                <div className="manage-btn-row">
                                                                    <button className="save-btn" onClick={() => saveEditClip(clip.id)} disabled={editClipSaving}>
                                                                        {editClipSaving ? `جارِ الحفظ... ${editClipAudioFile ? editClipProgress + '%' : ''}` : 'حفظ'}
                                                                    </button>
                                                                    <button className="cancel-btn" onClick={cancelEditClip} disabled={editClipSaving}>إلغاء</button>
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <>
                                                                <span className="manage-clip-title">{clip.title}</span>
                                                                <div className="manage-btn-row">
                                                                    <button className="edit-btn" onClick={() => startEditClip(clip)}>تعديل</button>
                                                                    <button className="delete-btn" onClick={() => handleDeleteClip(clip)}>حذف</button>
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
