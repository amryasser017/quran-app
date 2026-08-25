import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore'
import { db } from '../firebase'
import Avatar from '../components/Avatar'
import './ShortClips.css'

function FullSowarCustomReciterPage() {
    const { id } = useParams()
    const [reciter, setReciter] = useState(null)
    const [surahs, setSurahs] = useState([])
    const [loading, setLoading] = useState(true)
    const [nowPlaying, setNowPlaying] = useState(null)
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

    if (loading) return <p className="status-text">Loading...</p>
    if (!reciter) return <p className="status-text">Reciter not found.</p>

    const filteredSurahs = surahs.filter(s =>
        s.surahName.toLowerCase().includes(searchTerm.trim().toLowerCase())
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
                        const isPlaying = nowPlaying === surah.id
                        return (
                            <div key={surah.id} className={`surah-card ${isPlaying ? 'playing' : ''}`}>
                                <span className="surah-name">{surah.surahName}</span>
                                <button
                                    className="play-btn"
                                    onClick={() => setNowPlaying(isPlaying ? null : surah.id)}
                                >
                                    {isPlaying ? '⏸ Pause' : '▶ Play'}
                                </button>
                                {isPlaying && (
                                    <audio
                                        src={surah.audioUrl}
                                        autoPlay
                                        controls
                                        onEnded={() => setNowPlaying(null)}
                                        className="audio-player"
                                    />
                                )}
                            </div>
                        )
                    })}
                </div>
            )}
        </section>
    )
}

export default FullSowarCustomReciterPage
