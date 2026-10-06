import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { collection, getDocs, query, orderBy } from 'firebase/firestore'
import { db } from '../firebase'
import './Azkar.css'

function AzkarLibrary() {
    const [folders, setFolders] = useState([])
    const [itemCounts, setItemCounts] = useState({})
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function load() {
            try {
                const foldersSnap = await getDocs(query(collection(db, 'azkarFolders'), orderBy('name')))
                const foldersData = foldersSnap.docs.map(d => ({ id: d.id, ...d.data() }))
                setFolders(foldersData)

                const itemsSnap = await getDocs(collection(db, 'azkarItems'))
                const counts = {}
                itemsSnap.docs.forEach(d => {
                    const folderId = d.data().folderId
                    counts[folderId] = (counts[folderId] || 0) + 1
                })
                setItemCounts(counts)
            } catch (err) {
                console.error('Could not load azkar folders:', err)
            }
            setLoading(false)
        }
        load()
    }, [])

    return (
        <section className="azkar-page" dir="rtl">
            <Link to="/azkar" className="back-link">&rarr; رجوع</Link>
            <h1 className="page-title">مكتبة الأذكار</h1>
            <p className="page-subtitle">أذكار متنوعة لكل المناسبات، مصنّفة في فولدرز</p>

            {loading ? (
                <p className="status-text">جارِ التحميل...</p>
            ) : folders.length === 0 ? (
                <p className="status-text">لا توجد فولدرز بعد.</p>
            ) : (
                <div className="azkar-folder-grid">
                    {folders.map(folder => (
                        <Link key={folder.id} to={`/azkar/library/${folder.id}`} className="azkar-folder-card">
                            <span className="azkar-folder-card-icon">📿</span>
                            <h2>{folder.name}</h2>
                            <p>{itemCounts[folder.id] || 0} ذكر</p>
                        </Link>
                    ))}
                </div>
            )}
        </section>
    )
}

export default AzkarLibrary
