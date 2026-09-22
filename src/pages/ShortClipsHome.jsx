import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { collection, getDocs, orderBy, query } from 'firebase/firestore'
import { db } from '../firebase'
import Avatar from '../components/Avatar'
import './ShortClips.css'

function ShortClipsHome() {
    const [reciters, setReciters] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')

    useEffect(() => {
        async function load() {
            const q = query(collection(db, 'shortClipReciters'), orderBy('name'))
            const snapshot = await getDocs(q)
            setReciters(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })))
            setLoading(false)
        }
        load()
    }, [])

    const filteredReciters = reciters.filter(reciter =>
        reciter.name.toLowerCase().includes(searchTerm.trim().toLowerCase())
    )

    if (loading) return <p className="status-text">جارِ التحميل...</p>

    return (
        <section className="home">
            <Link to="/" className="back-link">&rarr; رجوع</Link>
            <h1 className="page-title">مقاطع مختارة</h1>
            <p className="page-subtitle">مقاطع مختارة من القراء المفضلين</p>

            <input
                type="text"
                className="search-input"
                placeholder="ابحث باسم القارئ..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />

            {reciters.length === 0 ? (
                <p className="status-text">لم يُضَف أي قارئ بعد. استخدم لوحة الإدارة لإضافة أول قارئ.</p>
            ) : filteredReciters.length === 0 ? (
                <p className="status-text">لا يوجد قراء مطابقون لـ "{searchTerm}".</p>
            ) : (
                <div className="reciters-grid">
                    {filteredReciters.map(reciter => (
                        <Link key={reciter.id} to={`/short-clips/reciter/${reciter.id}`} className="reciter-card">
                            <Avatar src={reciter.imageUrl} name={reciter.name} />
                            <h3>{reciter.name}</h3>
                        </Link>
                    ))}
                </div>
            )}
        </section>
    )
}

export default ShortClipsHome
