import { useEffect, useMemo, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore'
import { db } from '../firebase'
import Avatar from '../components/Avatar'
import PlayerBar from '../components/PlayerBar'
import usePlaylistPlayer from '../hooks/usePlaylistPlayer'
import './ShortClips.css'

function FullSowarCustomReciterPage() {
    const { id } = useParams()
    const [reciter, setReciter] = useState(null)
    const [surahs, setSurahs] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')

    useEffect(() => {
        async function load() {
            const reciterSnap = await getDoc(doc(db, 'fullSowarReciters', id))
            if (reciterSnap.exists()) {
                setReciter({ id: reciterSnap.id, ...reciterSnap.data() })
            }

            const q = query(
                collection(db, 'fullSowarSurahs'),
                where('reciterSource', '==', 'custom'),
                where('reciterId', '==', id)
            )
            const surahsSnap = await getDocs(q)
            setSurahs(surahsSnap.docs.map(d => ({ id: d.id, ...d.data() })))
            setLoading(false)
        }
        load()
    }, [id])

    const tracks = useMemo(
        () => surahs.map((s, i) => ({ key: s.id, title: s.surahName, audioUrl: s.audioUrl, index: i })),
        [surahs]
    )

    const player = usePlaylistPlayer(tracks)

    if (loading) return <p className="status-text">Loading...</p>
    if (!reciter) return <p className="status-text">Reciter not found.</p>

    const filteredSurahs = tracks.filter(s =>
        s.title.toLowerCase().includes(searchTerm.trim().toLowerCase())
    )

    return (
        <section className="reciter-page">
            <Link to="/full-sowar" className="back-link">&larr; Back to Full Sowar</Link>

            <div className="reciter-header">
                <Avatar src={reciter.imageUrl} name={reciter.name} />
                <div>
                    <h1>{reciter.name}</h1>
                </div>
            </div>

            <input
                type="text"
                className="search-input"
                placeholder="Search by surah name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />

            {filteredSurahs.length === 0 ? (
                <p className="status-text">No surahs match, or none added yet.</p>
            ) : (
                <div className="surah-grid">
                    {filteredSurahs.map(surah => {
                        const isCurrent = player.currentIndex === surah.index
                        return (
                            <div key={surah.key} className={`surah-card ${isCurrent ? 'playing' : ''}`}>
                                <span className="surah-name">{surah.title}</span>
                                <button
                                    className="play-btn"
                                    onClick={() => isCurrent ? player.togglePlayPause() : player.play(surah.index)}
                                >
                                    {isCurrent && player.isPlaying ? '⏸ Pause' : '▶ Play'}
                                </button>
                            </div>
                        )
                    })}
                </div>
            )}

            <PlayerBar player={player} subtitle={reciter.name} />
        </section>
    )
}

export default FullSowarCustomReciterPage
