import { useEffect, useMemo, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { doc, getDoc, collection, getDocs, query, where } from 'firebase/firestore'
import { db } from '../firebase'
import Avatar from '../components/Avatar'
import PlayerBar from '../components/PlayerBar'
import usePlaylistPlayer from '../hooks/usePlaylistPlayer'
import './Podcasts.css'

function PodcastFolderPage() {
    const { folderId } = useParams()
    const [folder, setFolder] = useState(null)
    const [episodes, setEpisodes] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')

    useEffect(() => {
        async function load() {
            const folderSnap = await getDoc(doc(db, 'podcastFolders', folderId))
            if (folderSnap.exists()) {
                setFolder({ id: folderSnap.id, ...folderSnap.data() })
            }

            const episodesSnap = await getDocs(query(
                collection(db, 'podcastEpisodes'),
                where('folderId', '==', folderId)
            ))
            const episodesData = episodesSnap.docs.map(d => ({ id: d.id, ...d.data() }))
            episodesData.sort((a, b) => (a.createdAt?.seconds || 0) - (b.createdAt?.seconds || 0))
            setEpisodes(episodesData)
            setLoading(false)
        }
        load()
    }, [folderId])

    const tracks = useMemo(
        () => episodes.map((e, i) => ({ key: e.id, title: e.title, audioUrl: e.audioUrl, index: i })),
        [episodes]
    )

    const player = usePlaylistPlayer(tracks)

    if (loading) return <p className="status-text">جارِ التحميل...</p>
    if (!folder) return <p className="status-text">الفولدر غير موجود.</p>

    const filteredTracks = tracks.filter(t =>
        t.title.toLowerCase().includes(searchTerm.trim().toLowerCase())
    )

    return (
        <section className="podcast-page">
            <Link to="/podcasts" className="back-link">&rarr; رجوع إلى البودكاست</Link>

            <div className="podcast-header">
                <Avatar src={folder.imageUrl} name={folder.name} />
                <div>
                    <h1>{folder.name}</h1>
                </div>
            </div>

            <input
                type="text"
                className="search-input"
                placeholder="ابحث باسم الحلقة..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />

            {filteredTracks.length === 0 ? (
                <p className="status-text">لا توجد حلقات مطابقة، أو لم تتم إضافة حلقات بعد.</p>
            ) : (
                <div className="episode-grid">
                    {filteredTracks.map(track => {
                        const isCurrent = player.currentIndex === track.index
                        return (
                            <div key={track.key} className={`episode-card ${isCurrent ? 'playing' : ''}`}>
                                <span className="episode-title">{track.title}</span>
                                <button
                                    className="play-btn"
                                    onClick={() => isCurrent ? player.togglePlayPause() : player.play(track.index)}
                                >
                                    {isCurrent && player.isPlaying ? '⏸ إيقاف' : '▶ تشغيل'}
                                </button>
                            </div>
                        )
                    })}
                </div>
            )}

            <PlayerBar player={player} subtitle={folder.name} />
        </section>
    )
}

export default PodcastFolderPage
