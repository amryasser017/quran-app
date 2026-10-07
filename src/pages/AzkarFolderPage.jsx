import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore'
import { db } from '../firebase'
import './Azkar.css'

function AzkarFolderPage() {
    const { folderId } = useParams()
    const [folder, setFolder] = useState(null)
    const [items, setItems] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function load() {
            try {
                const itemsSnap = await getDocs(query(
                    collection(db, 'azkarItems'),
                    where('folderId', '==', folderId),
                    orderBy('createdAt')
                ))
                setItems(itemsSnap.docs.map(d => ({ id: d.id, ...d.data() })))

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

    if (loading) return <p className="status-text">جارِ التحميل...</p>

    return (
        <section className="azkar-page" dir="rtl">
            <Link to="/azkar/library" className="back-link">&rarr; رجوع إلى مكتبة الأذكار</Link>
            <h1 className="page-title">{folder ? folder.name : 'الفولدر'}</h1>
            <p className="page-subtitle">{items.length} ذكر</p>

            {items.length === 0 ? (
                <p className="status-text">لا توجد أذكار في هذا الفولدر بعد.</p>
            ) : (
                <div className="azkar-list">
                    {items.map(item => (
                        <div key={item.id} className="azkar-card">
                            <p className="azkar-text">{item.text}</p>
                            {item.ayahRef && <p className="azkar-reference">﴿ {item.ayahRef} ﴾</p>}
                            {item.narrator && <p className="azkar-reference">{item.narrator}</p>}
                            {item.count && <span className="azkar-count-badge">تكرار {item.count}</span>}
                        </div>
                    ))}
                </div>
            )}
        </section>
    )
}

export default AzkarFolderPage
