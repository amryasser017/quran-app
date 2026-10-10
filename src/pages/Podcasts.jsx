import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { collection, getDocs, query, orderBy } from 'firebase/firestore'
import { db } from '../firebase'
import Avatar from '../components/Avatar'
import './Podcasts.css'

function Podcasts() {
    const [folders, setFolders] = useState([])
    const [episodeCounts, setEpisodeCounts] = useState({})
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')

    useEffect(() => {
        async function load() {
            try {
                const foldersSnap = await getDocs(query(collection(db, 'podcastFolders'), orderBy('name')))
                setFolders(foldersSnap.docs.map(d => ({ id: d.id, ...d.data() })))

                const episodesSnap = await getDocs(collection(db, 'podcastEpisodes'))
                const counts = {}
                episodesSnap.docs.forEach(d => {
                    const folderId = d.data().folderId
                    counts[folderId] = (counts[folderId] || 0) + 1
                })
                setEpisodeCounts(counts)
            } catch (err) {
                console.error('Could not load podcast folders:', err)
            }
            setLoading(false)
        }
        load()
    }, [])

    const filteredFolders = folders.filter(folder =>
        folder.name.toLowerCase().includes(searchTerm.trim().toLowerCase())
    )

    return (
        <section className="podcasts-page">
            <Link to="/" className="back-link">&rarr; رجوع</Link>
            <h1 className="page-title">البودكاست</h1>
            <p className="page-subtitle">استمع إلى الحلقات، مصنّفة في فولدرز</p>

            <input
                type="text"
                className="search-input"
                placeholder="ابحث باسم الفولدر..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />

            {loading ? (
                <p className="status-text">جارِ التحميل...</p>
            ) : filteredFolders.length === 0 ? (
                <p className="status-text">لا توجد فولدرز مطابقة.</p>
            ) : (
                <div className="podcast-folders-grid">
                    {filteredFolders.map(folder => (
                        <Link key={folder.id} to={`/podcasts/${folder.id}`} className="podcast-folder-card">
                            <Avatar src={folder.imageUrl} name={folder.name} />
                            <h3>{folder.name}</h3>
                            <p>{episodeCounts[folder.id] || 0} حلقة</p>
                        </Link>
                    ))}
                </div>
            )}
        </section>
    )
}

export default Podcasts
