import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { signOut } from 'firebase/auth'
import {
    collection, addDoc, getDocs, deleteDoc, updateDoc, doc,
    orderBy, query, serverTimestamp
} from 'firebase/firestore'
import { auth, db } from '../firebase'
import './Admin.css'

function AdminPodcasts() {
    const navigate = useNavigate()

    const [folders, setFolders] = useState([])
    const [episodes, setEpisodes] = useState([])

    const [folderName, setFolderName] = useState('')
    const [folderImageUrl, setFolderImageUrl] = useState('')
    const [folderSaving, setFolderSaving] = useState(false)
    const [folderMsg, setFolderMsg] = useState('')

    const [episodeFolderId, setEpisodeFolderId] = useState('')
    const [episodeTitle, setEpisodeTitle] = useState('')
    const [episodeAudioUrl, setEpisodeAudioUrl] = useState('')
    const [episodeSaving, setEpisodeSaving] = useState(false)
    const [episodeMsg, setEpisodeMsg] = useState('')

    const [expandedFolderId, setExpandedFolderId] = useState(null)
    const [editingFolderId, setEditingFolderId] = useState(null)
    const [editFolderName, setEditFolderName] = useState('')
    const [editFolderImageUrl, setEditFolderImageUrl] = useState('')
    const [editingEpisodeId, setEditingEpisodeId] = useState(null)
    const [editEpisodeTitle, setEditEpisodeTitle] = useState('')
    const [editEpisodeAudioUrl, setEditEpisodeAudioUrl] = useState('')

    async function loadFolders() {
        const q = query(collection(db, 'podcastFolders'), orderBy('name'))
        const snapshot = await getDocs(q)
        setFolders(snapshot.docs.map(d => ({ id: d.id, ...d.data() })))
    }

    async function loadEpisodes() {
        const snapshot = await getDocs(collection(db, 'podcastEpisodes'))
        setEpisodes(snapshot.docs.map(d => ({ id: d.id, ...d.data() })))
    }

    useEffect(() => {
        loadFolders()
        loadEpisodes()
    }, [])

    function episodesForFolder(folderId) {
        return episodes.filter(e => e.folderId === folderId)
    }

    async function handleAddFolder(e) {
        e.preventDefault()
        if (!folderName.trim()) return
        setFolderSaving(true)
        setFolderMsg('')
        try {
            await addDoc(collection(db, 'podcastFolders'), {
                name: folderName.trim(),
                imageUrl: folderImageUrl.trim(),
                createdAt: serverTimestamp()
            })
            setFolderName('')
            setFolderImageUrl('')
            setFolderMsg('تمت إضافة الفولدر.')
            loadFolders()
        } catch (err) {
            setFolderMsg('فشلت إضافة الفولدر: ' + err.message)
        }
        setFolderSaving(false)
    }

    async function handleAddEpisode(e) {
        e.preventDefault()
        if (!episodeFolderId || !episodeTitle.trim() || !episodeAudioUrl.trim()) return
        setEpisodeSaving(true)
        setEpisodeMsg('')
        try {
            await addDoc(collection(db, 'podcastEpisodes'), {
                folderId: episodeFolderId,
                title: episodeTitle.trim(),
                audioUrl: episodeAudioUrl.trim(),
                createdAt: serverTimestamp()
            })
            setEpisodeTitle('')
            setEpisodeAudioUrl('')
            setEpisodeMsg('تمت إضافة الحلقة.')
            loadEpisodes()
        } catch (err) {
            setEpisodeMsg('فشلت إضافة الحلقة: ' + err.message)
        }
        setEpisodeSaving(false)
    }

    function startEditFolder(folder) {
        setEditingFolderId(folder.id)
        setEditFolderName(folder.name)
        setEditFolderImageUrl(folder.imageUrl || '')
    }

    function cancelEditFolder() {
        setEditingFolderId(null)
    }

    async function saveEditFolder(folderId) {
        if (!editFolderName.trim()) return
        await updateDoc(doc(db, 'podcastFolders', folderId), {
            name: editFolderName.trim(),
            imageUrl: editFolderImageUrl.trim()
        })
        setEditingFolderId(null)
        loadFolders()
    }

    async function handleDeleteFolder(folder) {
        const folderEpisodes = episodesForFolder(folder.id)
        const confirmMsg = folderEpisodes.length > 0
            ? `حذف "${folder.name}" وجميع الحلقات بداخله (${folderEpisodes.length})؟ لا يمكن التراجع عن هذا.`
            : `حذف "${folder.name}"؟ لا يمكن التراجع عن هذا.`
        if (!confirm(confirmMsg)) return

        for (const episode of folderEpisodes) {
            await deleteDoc(doc(db, 'podcastEpisodes', episode.id))
        }
        await deleteDoc(doc(db, 'podcastFolders', folder.id))

        loadFolders()
        loadEpisodes()
    }

    function startEditEpisode(episode) {
        setEditingEpisodeId(episode.id)
        setEditEpisodeTitle(episode.title)
        setEditEpisodeAudioUrl(episode.audioUrl)
    }

    function cancelEditEpisode() {
        setEditingEpisodeId(null)
    }

    async function saveEditEpisode(episodeId) {
        if (!editEpisodeTitle.trim() || !editEpisodeAudioUrl.trim()) return
        await updateDoc(doc(db, 'podcastEpisodes', episodeId), {
            title: editEpisodeTitle.trim(),
            audioUrl: editEpisodeAudioUrl.trim()
        })
        setEditingEpisodeId(null)
        loadEpisodes()
    }

    async function handleDeleteEpisode(episode) {
        if (!confirm(`حذف الحلقة "${episode.title}"؟ لا يمكن التراجع عن هذا.`)) return
        await deleteDoc(doc(db, 'podcastEpisodes', episode.id))
        loadEpisodes()
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
                    <h1>إدارة البودكاست</h1>
                </div>
                <button className="logout-btn" onClick={handleLogout}>تسجيل الخروج</button>
            </div>

            <div className="admin-panels">
                <form className="admin-panel" onSubmit={handleAddFolder}>
                    <h2>إضافة فولدر جديد</h2>
                    <p className="admin-hint">فولدر بودكاست جديد باسم من اختيارك.</p>
                    <input
                        type="text"
                        placeholder="اسم الفولدر"
                        value={folderName}
                        onChange={(e) => setFolderName(e.target.value)}
                        required
                    />
                    <input
                        type="url"
                        placeholder="رابط الصورة (اختياري — اتركه فارغًا لصورة بحرف)"
                        value={folderImageUrl}
                        onChange={(e) => setFolderImageUrl(e.target.value)}
                    />
                    <button type="submit" disabled={folderSaving}>
                        {folderSaving ? 'جارِ الإضافة...' : 'إضافة الفولدر'}
                    </button>
                    {folderMsg && <p className="admin-msg">{folderMsg}</p>}
                </form>

                <form className="admin-panel" onSubmit={handleAddEpisode}>
                    <h2>إضافة حلقة</h2>
                    <p className="admin-hint">أضف حلقة صوتية داخل أحد الفولدرز الموجودة.</p>

                    <select
                        value={episodeFolderId}
                        onChange={(e) => setEpisodeFolderId(e.target.value)}
                        required
                    >
                        <option value="">اختر فولدرًا...</option>
                        {folders.map(f => (
                            <option key={f.id} value={f.id}>{f.name}</option>
                        ))}
                    </select>

                    <input
                        type="text"
                        placeholder="عنوان الحلقة"
                        value={episodeTitle}
                        onChange={(e) => setEpisodeTitle(e.target.value)}
                        required
                    />
                    <input
                        type="url"
                        placeholder="رابط الملف الصوتي"
                        value={episodeAudioUrl}
                        onChange={(e) => setEpisodeAudioUrl(e.target.value)}
                        required
                    />
                    <button type="submit" disabled={episodeSaving || folders.length === 0}>
                        {episodeSaving ? 'جارِ الإضافة...' : 'إضافة الحلقة'}
                    </button>
                    {folders.length === 0 && (
                        <p className="admin-msg">أضف فولدرًا أعلاه أولاً.</p>
                    )}
                    {episodeMsg && <p className="admin-msg">{episodeMsg}</p>}
                </form>
            </div>

            <div className="admin-manage">
                <h2>إدارة الفولدرز والحلقات</h2>

                {folders.length === 0 && (
                    <p className="admin-msg">لا توجد فولدرز بعد — أضف واحدًا أعلاه.</p>
                )}

                {folders.map(folder => {
                    const isExpanded = expandedFolderId === folder.id
                    const isEditing = editingFolderId === folder.id
                    const folderEpisodes = episodesForFolder(folder.id)

                    return (
                        <div key={folder.id} className="manage-reciter">
                            {isEditing ? (
                                <div className="manage-edit-row">
                                    <input
                                        type="text"
                                        value={editFolderName}
                                        onChange={(e) => setEditFolderName(e.target.value)}
                                        placeholder="الاسم"
                                    />
                                    <input
                                        type="url"
                                        value={editFolderImageUrl}
                                        onChange={(e) => setEditFolderImageUrl(e.target.value)}
                                        placeholder="رابط الصورة"
                                    />
                                    <div className="manage-btn-row">
                                        <button className="save-btn" onClick={() => saveEditFolder(folder.id)}>حفظ</button>
                                        <button className="cancel-btn" onClick={cancelEditFolder}>إلغاء</button>
                                    </div>
                                </div>
                            ) : (
                                <div className="manage-row">
                                    <button
                                        className="manage-name-btn"
                                        onClick={() => setExpandedFolderId(isExpanded ? null : folder.id)}
                                    >
                                        {isExpanded ? '▾' : '▸'} {folder.name}
                                        <span className="manage-clip-count"> ({folderEpisodes.length} حلقة)</span>
                                    </button>
                                    <div className="manage-btn-row">
                                        <button className="edit-btn" onClick={() => startEditFolder(folder)}>تعديل</button>
                                        <button className="delete-btn" onClick={() => handleDeleteFolder(folder)}>حذف</button>
                                    </div>
                                </div>
                            )}

                            {isExpanded && (
                                <div className="manage-clips">
                                    {folderEpisodes.length === 0 ? (
                                        <p className="admin-msg">لم تتم إضافة أي حلقات لهذا الفولدر بعد.</p>
                                    ) : (
                                        folderEpisodes.map(episode => {
                                            const isEpisodeEditing = editingEpisodeId === episode.id
                                            return (
                                                <div key={episode.id} className="manage-clip-row">
                                                    {isEpisodeEditing ? (
                                                        <div className="manage-edit-row">
                                                            <input
                                                                type="text"
                                                                value={editEpisodeTitle}
                                                                onChange={(e) => setEditEpisodeTitle(e.target.value)}
                                                                placeholder="عنوان الحلقة"
                                                            />
                                                            <input
                                                                type="url"
                                                                value={editEpisodeAudioUrl}
                                                                onChange={(e) => setEditEpisodeAudioUrl(e.target.value)}
                                                                placeholder="رابط الملف الصوتي"
                                                            />
                                                            <div className="manage-btn-row">
                                                                <button className="save-btn" onClick={() => saveEditEpisode(episode.id)}>حفظ</button>
                                                                <button className="cancel-btn" onClick={cancelEditEpisode}>إلغاء</button>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <>
                                                            <span className="manage-clip-title">{episode.title}</span>
                                                            <div className="manage-btn-row">
                                                                <button className="edit-btn" onClick={() => startEditEpisode(episode)}>تعديل</button>
                                                                <button className="delete-btn" onClick={() => handleDeleteEpisode(episode)}>حذف</button>
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

export default AdminPodcasts
