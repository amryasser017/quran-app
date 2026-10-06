import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { signOut } from 'firebase/auth'
import {
    collection, addDoc, getDocs, deleteDoc, updateDoc, doc,
    query, orderBy, serverTimestamp
} from 'firebase/firestore'
import { auth, db } from '../firebase'
import azkarSeedData from '../data/azkarSeedData'
import './Admin.css'

function AdminAzkarFolders() {
    const navigate = useNavigate()

    const [folders, setFolders] = useState([])
    const [items, setItems] = useState([])

    const [folderName, setFolderName] = useState('')
    const [folderSaving, setFolderSaving] = useState(false)
    const [folderMsg, setFolderMsg] = useState('')

    const [itemFolderId, setItemFolderId] = useState('')
    const [itemText, setItemText] = useState('')
    const [itemCount, setItemCount] = useState('')
    const [itemNarrator, setItemNarrator] = useState('')
    const [itemAyahRef, setItemAyahRef] = useState('')
    const [itemSaving, setItemSaving] = useState(false)
    const [itemMsg, setItemMsg] = useState('')

    const [seeding, setSeeding] = useState(false)
    const [seedMsg, setSeedMsg] = useState('')

    const [expandedFolderId, setExpandedFolderId] = useState(null)
    const [editingFolderId, setEditingFolderId] = useState(null)
    const [editFolderName, setEditFolderName] = useState('')

    const [editingItemId, setEditingItemId] = useState(null)
    const [editItemText, setEditItemText] = useState('')
    const [editItemCount, setEditItemCount] = useState('')
    const [editItemNarrator, setEditItemNarrator] = useState('')
    const [editItemAyahRef, setEditItemAyahRef] = useState('')

    async function loadFolders() {
        const q = query(collection(db, 'azkarFolders'), orderBy('name'))
        const snapshot = await getDocs(q)
        setFolders(snapshot.docs.map(d => ({ id: d.id, ...d.data() })))
    }

    async function loadItems() {
        const snapshot = await getDocs(collection(db, 'azkarItems'))
        setItems(snapshot.docs.map(d => ({ id: d.id, ...d.data() })))
    }

    useEffect(() => {
        loadFolders()
        loadItems()
    }, [])

    function itemsForFolder(folderId) {
        return items.filter(it => it.folderId === folderId)
    }

    async function handleAddFolder(e) {
        e.preventDefault()
        if (!folderName.trim()) return
        setFolderSaving(true)
        setFolderMsg('')
        try {
            await addDoc(collection(db, 'azkarFolders'), {
                name: folderName.trim(),
                createdAt: serverTimestamp()
            })
            setFolderName('')
            setFolderMsg('تمت إضافة الفولدر.')
            loadFolders()
        } catch (err) {
            setFolderMsg('فشلت إضافة الفولدر: ' + err.message)
        }
        setFolderSaving(false)
    }

    async function handleAddItem(e) {
        e.preventDefault()
        if (!itemFolderId || !itemText.trim()) return
        setItemSaving(true)
        setItemMsg('')
        try {
            await addDoc(collection(db, 'azkarItems'), {
                folderId: itemFolderId,
                text: itemText.trim(),
                count: itemCount.trim() ? Number(itemCount) : null,
                narrator: itemNarrator.trim(),
                ayahRef: itemAyahRef.trim(),
                createdAt: serverTimestamp()
            })
            setItemText('')
            setItemCount('')
            setItemNarrator('')
            setItemAyahRef('')
            setItemMsg('تمت إضافة الذكر.')
            loadItems()
        } catch (err) {
            setItemMsg('فشلت إضافة الذكر: ' + err.message)
        }
        setItemSaving(false)
    }

    async function handleSeed() {
        if (!confirm('استيراد المحتوى الأساسي (9 فولدرز وكل الأذكار بداخلها)؟ لن يتم تكرار فولدر له نفس الاسم بالفعل.')) return
        setSeeding(true)
        setSeedMsg('')
        try {
            const existingNames = new Set(folders.map(f => f.name))
            let addedFolders = 0
            let addedItems = 0

            for (const folderSeed of azkarSeedData) {
                if (existingNames.has(folderSeed.name)) continue

                const folderRef = await addDoc(collection(db, 'azkarFolders'), {
                    name: folderSeed.name,
                    createdAt: serverTimestamp()
                })
                addedFolders++

                for (const itemSeed of folderSeed.items) {
                    await addDoc(collection(db, 'azkarItems'), {
                        folderId: folderRef.id,
                        text: itemSeed.text,
                        count: itemSeed.count || null,
                        narrator: itemSeed.narrator || '',
                        ayahRef: itemSeed.ayahRef || '',
                        createdAt: serverTimestamp()
                    })
                    addedItems++
                }
            }

            setSeedMsg(addedFolders > 0
                ? `تم استيراد ${addedFolders} فولدر و${addedItems} ذكر.`
                : 'كل الفولدرز الأساسية موجودة بالفعل.')
            loadFolders()
            loadItems()
        } catch (err) {
            setSeedMsg('فشل الاستيراد: ' + err.message)
        }
        setSeeding(false)
    }

    function startEditFolder(folder) {
        setEditingFolderId(folder.id)
        setEditFolderName(folder.name)
    }

    function cancelEditFolder() {
        setEditingFolderId(null)
    }

    async function saveEditFolder(folderId) {
        if (!editFolderName.trim()) return
        await updateDoc(doc(db, 'azkarFolders', folderId), {
            name: editFolderName.trim()
        })
        setEditingFolderId(null)
        loadFolders()
    }

    async function handleDeleteFolder(folder) {
        const folderItems = itemsForFolder(folder.id)
        const confirmMsg = folderItems.length > 0
            ? `حذف "${folder.name}" وجميع الأذكار بداخله (${folderItems.length})؟ لا يمكن التراجع عن هذا.`
            : `حذف "${folder.name}"؟ لا يمكن التراجع عن هذا.`
        if (!confirm(confirmMsg)) return

        for (const item of folderItems) {
            await deleteDoc(doc(db, 'azkarItems', item.id))
        }
        await deleteDoc(doc(db, 'azkarFolders', folder.id))

        loadFolders()
        loadItems()
    }

    function startEditItem(item) {
        setEditingItemId(item.id)
        setEditItemText(item.text)
        setEditItemCount(item.count != null ? String(item.count) : '')
        setEditItemNarrator(item.narrator || '')
        setEditItemAyahRef(item.ayahRef || '')
    }

    function cancelEditItem() {
        setEditingItemId(null)
    }

    async function saveEditItem(itemId) {
        if (!editItemText.trim()) return
        await updateDoc(doc(db, 'azkarItems', itemId), {
            text: editItemText.trim(),
            count: editItemCount.trim() ? Number(editItemCount) : null,
            narrator: editItemNarrator.trim(),
            ayahRef: editItemAyahRef.trim()
        })
        setEditingItemId(null)
        loadItems()
    }

    async function handleDeleteItem(item) {
        if (!confirm('حذف هذا الذكر؟ لا يمكن التراجع عن هذا.')) return
        await deleteDoc(doc(db, 'azkarItems', item.id))
        loadItems()
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
                    <h1>إدارة الأذكار</h1>
                </div>
                <button className="logout-btn" onClick={handleLogout}>تسجيل الخروج</button>
            </div>

            <div className="admin-panels">
                <form className="admin-panel" onSubmit={handleAddFolder}>
                    <h2>إضافة فولدر جديد</h2>
                    <p className="admin-hint">فئة جديدة من الأذكار، باسم من اختيارك.</p>
                    <input
                        type="text"
                        placeholder="اسم الفولدر (مثال: أذكار السفر)"
                        value={folderName}
                        onChange={(e) => setFolderName(e.target.value)}
                        required
                    />
                    <button type="submit" disabled={folderSaving}>
                        {folderSaving ? 'جارِ الإضافة...' : 'إضافة الفولدر'}
                    </button>
                    {folderMsg && <p className="admin-msg">{folderMsg}</p>}

                    <p className="admin-hint" style={{ marginTop: 10 }}>
                        استيراد المحتوى الأساسي (9 فولدرز جاهزة بمئات الأذكار) مرة واحدة فقط.
                    </p>
                    <button type="button" onClick={handleSeed} disabled={seeding}>
                        {seeding ? 'جارِ الاستيراد...' : 'استيراد المحتوى الأساسي'}
                    </button>
                    {seedMsg && <p className="admin-msg">{seedMsg}</p>}
                </form>

                <form className="admin-panel" onSubmit={handleAddItem}>
                    <h2>إضافة ذكر</h2>
                    <p className="admin-hint">أضف ذكرًا داخل أحد الفولدرز الموجودة.</p>

                    <select
                        value={itemFolderId}
                        onChange={(e) => setItemFolderId(e.target.value)}
                        required
                    >
                        <option value="">اختر فولدرًا...</option>
                        {folders.map(f => (
                            <option key={f.id} value={f.id}>{f.name}</option>
                        ))}
                    </select>

                    <textarea
                        placeholder="نص الذكر"
                        value={itemText}
                        onChange={(e) => setItemText(e.target.value)}
                        rows={4}
                        required
                        style={{
                            padding: '13px 15px',
                            backgroundColor: 'rgba(255, 255, 255, 0.045)',
                            border: '1px solid var(--admin-glass-border)',
                            borderRadius: '12px',
                            color: 'var(--text)',
                            fontSize: '0.95rem',
                            fontFamily: 'inherit',
                            resize: 'vertical'
                        }}
                    />
                    <input
                        type="number"
                        placeholder="عدد التكرار (اختياري)"
                        value={itemCount}
                        onChange={(e) => setItemCount(e.target.value)}
                        min="1"
                    />
                    <input
                        type="text"
                        placeholder="الراوي / المصدر (اختياري، مثال: رواه مسلم)"
                        value={itemNarrator}
                        onChange={(e) => setItemNarrator(e.target.value)}
                    />
                    <input
                        type="text"
                        placeholder="الآية (اختياري، مثال: البقرة 255)"
                        value={itemAyahRef}
                        onChange={(e) => setItemAyahRef(e.target.value)}
                    />
                    <button type="submit" disabled={itemSaving || folders.length === 0}>
                        {itemSaving ? 'جارِ الإضافة...' : 'إضافة الذكر'}
                    </button>
                    {folders.length === 0 && (
                        <p className="admin-msg">أضف فولدرًا أعلاه أولاً.</p>
                    )}
                    {itemMsg && <p className="admin-msg">{itemMsg}</p>}
                </form>
            </div>

            <div className="admin-manage">
                <h2>إدارة الفولدرز والأذكار</h2>

                {folders.length === 0 && (
                    <p className="admin-msg">لا توجد فولدرز بعد — أضف واحدًا أعلاه أو استورد المحتوى الأساسي.</p>
                )}

                {folders.map(folder => {
                    const isExpanded = expandedFolderId === folder.id
                    const isEditing = editingFolderId === folder.id
                    const folderItems = itemsForFolder(folder.id)

                    return (
                        <div key={folder.id} className="manage-reciter">
                            {isEditing ? (
                                <div className="manage-edit-row">
                                    <input
                                        type="text"
                                        value={editFolderName}
                                        onChange={(e) => setEditFolderName(e.target.value)}
                                        placeholder="اسم الفولدر"
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
                                        <span className="manage-clip-count"> ({folderItems.length} ذكر)</span>
                                    </button>
                                    <div className="manage-btn-row">
                                        <button className="edit-btn" onClick={() => startEditFolder(folder)}>تعديل</button>
                                        <button className="delete-btn" onClick={() => handleDeleteFolder(folder)}>حذف</button>
                                    </div>
                                </div>
                            )}

                            {isExpanded && (
                                <div className="manage-clips">
                                    {folderItems.length === 0 ? (
                                        <p className="admin-msg">لم تتم إضافة أي أذكار لهذا الفولدر بعد.</p>
                                    ) : (
                                        folderItems.map(item => {
                                            const isItemEditing = editingItemId === item.id
                                            return (
                                                <div key={item.id} className="manage-clip-row" style={{ alignItems: 'flex-start' }}>
                                                    {isItemEditing ? (
                                                        <div className="manage-edit-row" style={{ flex: 1 }}>
                                                            <textarea
                                                                value={editItemText}
                                                                onChange={(e) => setEditItemText(e.target.value)}
                                                                rows={4}
                                                                style={{
                                                                    padding: '10px 13px',
                                                                    backgroundColor: 'rgba(255, 255, 255, 0.045)',
                                                                    border: '1px solid var(--admin-glass-border)',
                                                                    borderRadius: '10px',
                                                                    color: 'var(--text)',
                                                                    fontSize: '0.9rem',
                                                                    fontFamily: 'inherit',
                                                                    resize: 'vertical'
                                                                }}
                                                            />
                                                            <input
                                                                type="number"
                                                                value={editItemCount}
                                                                onChange={(e) => setEditItemCount(e.target.value)}
                                                                placeholder="عدد التكرار"
                                                                min="1"
                                                            />
                                                            <input
                                                                type="text"
                                                                value={editItemNarrator}
                                                                onChange={(e) => setEditItemNarrator(e.target.value)}
                                                                placeholder="الراوي / المصدر"
                                                            />
                                                            <input
                                                                type="text"
                                                                value={editItemAyahRef}
                                                                onChange={(e) => setEditItemAyahRef(e.target.value)}
                                                                placeholder="الآية"
                                                            />
                                                            <div className="manage-btn-row">
                                                                <button className="save-btn" onClick={() => saveEditItem(item.id)}>حفظ</button>
                                                                <button className="cancel-btn" onClick={cancelEditItem}>إلغاء</button>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <>
                                                            <span className="manage-clip-title" dir="rtl">
                                                                {item.text}
                                                                <br />
                                                                <span style={{ color: 'var(--text-dim)', fontSize: '0.8rem' }}>
                                                                    {item.narrator && <>{item.narrator} </>}
                                                                    {item.ayahRef && <>· {item.ayahRef} </>}
                                                                    {item.count && <>· تكرار {item.count}</>}
                                                                </span>
                                                            </span>
                                                            <div className="manage-btn-row">
                                                                <button className="edit-btn" onClick={() => startEditItem(item)}>تعديل</button>
                                                                <button className="delete-btn" onClick={() => handleDeleteItem(item)}>حذف</button>
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

export default AdminAzkarFolders
