import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { doc, getDoc, collection, query, where, getDocs, orderBy } from 'firebase/firestore'
import { db } from '../firebase'
import Avatar from '../components/Avatar'
import './ShortClips.css'

function ShortClipReciterPage() {
    const { id } = useParams()
    const [reciter, setReciter] = useState(null)
    const [clips, setClips] = useState([])
    const [loading, setLoading] = useState(true)
    const [nowPlaying, setNowPlaying] = useState(null)

    useEffect(() => {
        async function load() {
            const reciterSnap = await getDoc(doc(db, 'shortClipReciters', id))
            if (reciterSnap.exists()) {
                setReciter({ id: reciterSnap.id, ...reciterSnap.data() })
            }

            const q = query(
                collection(db, 'clips'),
                where('reciterId', '==', id),
                orderBy('createdAt', 'desc')
            )
            const clipsSnap = await getDocs(q)
            setClips(clipsSnap.docs.map(d => ({ id: d.id, ...d.data() })))
            setLoading(false)
        }
        load()
    }, [id])

    if (loading) return <p className="status-text">Loading...</p>
    if (!reciter) return <p className="status-text">Reciter not found.</p>

    return (
        <section className="reciter-page">
            <Link to="/short-clips" className="back-link">&larr; Back to Short Parts</Link>

            <div className="reciter-header">
                <Avatar src={reciter.imageUrl} name={reciter.name} />
                <div>
                    <h1>{reciter.name}</h1>
                </div>
            </div>

            {clips.length === 0 ? (
                <p className="status-text">No clips added for this reciter yet.</p>
            ) : (
                <div className="surah-grid">
                    {clips.map(clip => {
                        const isPlaying = nowPlaying === clip.id
                        return (
                            <div key={clip.id} className={`surah-card ${isPlaying ? 'playing' : ''}`}>
                                <span className="surah-name">{clip.title}</span>
                                <button
                                    className="play-btn"
                                    onClick={() => setNowPlaying(isPlaying ? null : clip.id)}
                                >
                                    {isPlaying ? '⏸ Pause' : '▶ Play'}
                                </button>
                                {isPlaying && (
                                    <audio
                                        src={clip.audioUrl}
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

export default ShortClipReciterPage
