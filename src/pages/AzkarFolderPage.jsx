import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { collection, getDocs, query, where } from 'firebase/firestore'
import { db } from '../firebase'
import './Azkar.css'

function buildRemaining(items) {
    const obj = {}
    items.forEach(item => {
        if (item.count) obj[item.id] = item.count
    })
    return obj
}

function AzkarFolderPage() {
    const { folderId } = useParams()
    const [folder, setFolder] = useState(null)
    const [items, setItems] = useState([])
    const [loading, setLoading] = useState(true)
    const [remaining, setRemaining] = useState({})

    useEffect(() => {
        async function load() {
            try {
                const itemsSnap = await getDocs(query(
                    collection(db, 'azkarItems'),
                    where('folderId', '==', folderId)
                ))
                const itemsData = itemsSnap.docs.map(d => ({ id: d.id, ...d.data() }))
                itemsData.sort((a, b) => (a.createdAt?.seconds || 0) - (b.createdAt?.seconds || 0))
                setItems(itemsData)
                setRemaining(buildRemaining(itemsData))

                const foldersSnap = await getDocs(collection(db, 'azkarFolders'))
                const match = foldersSnap.docs.find(d => d.id === folderId)
                if (match) setFolder({ id: match.id, ...match.data() })
            } catch (err) {
                console.error('Could not load azkar items:', err)
            }
            setLoading(false)
        }
        load()
    }, [folderId])

    function handleTap(item) {
        if (!item.count) return
        setRemaining(prev => {
            const current = prev[item.id] ?? item.count
            if (current <= 0) return prev
            return { ...prev, [item.id]: current - 1 }
        })
    }

    function handleReset() {
        setRemaining(buildRemaining(items))
    }

    if (loading) return <p className="status-text">جارِ التحميل...</p>

    const hasCounters = items.some(item => item.count)

    return (
        <section className="azkar-page" dir="rtl">
            <Link to="/azkar/library" className="back-link">&rarr; رجوع إلى مكتبة الأذكار</Link>
            <h1 className="page-title">{folder ? folder.name : 'الفولدر'}</h1>
            <p className="page-subtitle">{items.length} ذكر{hasCounters ? ' — اضغط على الذكر لتسجيل كل مرة تقرأه' : ''}</p>

            {hasCounters && (
                <button className="azkar-reset-btn" onClick={handleReset}>إعادة العدّ</button>
            )}

            {items.length === 0 ? (
                <p className="status-text">لا توجد أذكار في هذا الفولدر بعد.</p>
            ) : (
                <div className="azkar-list">
                    {items.map(item => {
                        if (!item.count) {
                            return (
                                <div key={item.id} className="azkar-card">
                                    <p className="azkar-text">{item.text}</p>
                                    {item.ayahRef && <p className="azkar-reference">﴿ {item.ayahRef} ﴾</p>}
                                    {item.narrator && <p className="azkar-reference">{item.narrator}</p>}
                                </div>
                            )
                        }

                        const left = remaining[item.id] ?? item.count
                        const done = left <= 0
                        return (
                            <button
                                key={item.id}
                                className={`azkar-card ${done ? 'done' : ''}`}
                                onClick={() => handleTap(item)}
                            >
                                <p className="azkar-text">{item.text}</p>
                                {item.ayahRef && <p className="azkar-reference">﴿ {item.ayahRef} ﴾</p>}
                                {item.narrator && <p className="azkar-reference">{item.narrator}</p>}
                                <span className="azkar-count-badge">
                                    {done ? '✓ تم' : `متبقي ${left} من ${item.count}`}
                                </span>
                            </button>
                        )
                    })}
                </div>
            )}
        </section>
    )
}

export default AzkarFolderPage
