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
            setReciterMsg('تمت إضافة القارئ.')
            loadCustomReciters()
        } catch (err) {
            setReciterMsg('فشلت إضافة القارئ: ' + err.message)
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
            setSurahMsg('تمت إضافة السورة.')
            loadAllSurahs()
        } catch (err) {
            setSurahMsg('فشلت إضافة السورة: ' + err.message)
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
            ? `حذف "${reciter.name}" وجميع السور المضافة له (${surahs.length})؟ لا يمكن التراجع عن هذا.`
            : `حذف "${reciter.name}"؟ لا يمكن التراجع عن هذا.`
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
        if (!confirm(`حذف السورة "${surah.surahName}"؟ لا يمكن التراجع عن هذا.`)) return
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
                    <Link to="/admin" className="back-link">&rarr; رجوع إلى الإدارة</Link>
                    <h1>إدارة السور كاملة</h1>
                </div>
                <button className="logout-btn" onClick={handleLogout}>تسجيل الخروج</button>
            </div>

            <div className="admin-panels">
                <form className="admin-panel" onSubmit={handleAddReciter}>
                    <h2>إضافة قارئ جديد</h2>
                    <p className="admin-hint">لقارئ غير موجود بالفعل من الواجهة البرمجية.</p>
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

                <form className="admin-panel" onSubmit={handleAddSurah}>
                    <h2>إضافة سورة</h2>
                    <p className="admin-hint">تعمل للقراء الموجودين بالفعل في التطبيق (من الواجهة البرمجية) أو من أضفتهم أعلاه.</p>

                    <select
                        value={surahSource}
                        onChange={(e) => { setSurahSource(e.target.value); setSurahReciterId('') }}
                    >
                        <option value="api">قارئ موجود (بالفعل في التطبيق)</option>
                        <option value="custom">قارئ أضفته بنفسي</option>
                    </select>

                    <select
                        value={surahReciterId}
                        onChange={(e) => setSurahReciterId(e.target.value)}
                        required
                    >
                        <option value="">اختر قارئًا...</option>
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
                        placeholder="اسم السورة (مثال: الكهف)"
                        value={surahName}
                        onChange={(e) => setSurahName(e.target.value)}
                        required
                    />
                    <input
                        type="url"
                        placeholder="رابط الملف الصوتي"
                        value={surahAudioUrl}
                        onChange={(e) => setSurahAudioUrl(e.target.value)}
                        required
                    />
                    <button type="submit" disabled={surahSaving}>
                        {surahSaving ? 'جارِ الإضافة...' : 'إضافة السورة'}
                    </button>
                    {surahSource === 'custom' && customReciters.length === 0 && (
                        <p className="admin-msg">أضف قارئًا أعلاه أولاً.</p>
                    )}
                    {surahMsg && <p className="admin-msg">{surahMsg}</p>}
                </form>
            </div>

            <div className="admin-manage">
                <h2>إدارة القراء والسور</h2>
                <p className="admin-hint">
                    يُعرض هنا القراء الذين لديهم سور أضافها المشرف، بالإضافة إلى القراء الذين أضفتهم بالكامل بنفسك.
                    القراء المسحوبون من الواجهة البرمجية بدون سور مضافة من المشرف غير مدرجين هنا — عددهم كبير جدًا لإدارتهم فرديًا.
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
                                            onClick={() => setExpandedReciterKey(isExpanded ? null : key)}
                                        >
                                            {isExpanded ? '▾' : '▸'} {reciter.name}
                                            <span className="manage-clip-count">
                                                {' '}({surahs.length} سورة
                                                {reciter.source === 'api' ? ' مضافة' : ''})
                                            </span>
                                        </button>
                                        <div className="manage-btn-row">
                                            {reciter.source === 'custom' && (
                                                <>
                                                    <button className="edit-btn" onClick={() => startEditReciter(reciter)}>تعديل</button>
                                                    <button className="delete-btn" onClick={() => handleDeleteReciter(reciter)}>حذف</button>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {isExpanded && (
                                    <div className="manage-clips">
                                        {surahs.length === 0 ? (
                                            <p className="admin-msg">لم تتم إضافة أي سور لهذا القارئ بعد.</p>
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
                                                                    placeholder="اسم السورة"
                                                                />
                                                                <input
                                                                    type="url"
                                                                    value={editSurahAudioUrl}
                                                                    onChange={(e) => setEditSurahAudioUrl(e.target.value)}
                                                                    placeholder="رابط الملف الصوتي"
                                                                />
                                                                <div className="manage-btn-row">
                                                                    <button className="save-btn" onClick={() => saveEditSurah(surah.id)}>حفظ</button>
                                                                    <button className="cancel-btn" onClick={cancelEditSurah}>إلغاء</button>
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <>
                                                                <span className="manage-clip-title">{surah.surahName}</span>
                                                                <div className="manage-btn-row">
                                                                    <button className="edit-btn" onClick={() => startEditSurah(surah)}>تعديل</button>
                                                                    <button className="delete-btn" onClick={() => handleDeleteSurah(surah)}>حذف</button>
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
