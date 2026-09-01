import { useEffect, useMemo, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { doc, getDoc, collection, query, where, getDocs, orderBy } from 'firebase/firestore'
import { db } from '../firebase'
import Avatar from '../components/Avatar'
import PlayerBar from '../components/PlayerBar'
import usePlaylistPlayer from '../hooks/usePlaylistPlayer'
import './ShortClips.css'

function ShortClipReciterPage() {
    const { id } = useParams()
    const [reciter, setReciter] = useState(null)
    const [clips, setClips] = useState([])
    const [loading, setLoading] = useState(true)

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

    const tracks = useMemo(
        () => clips.map((c, i) => ({ key: c.id, title: c.title, audioUrl: c.audioUrl, index: i })),
        [clips]
    )

    const player = usePlaylistPlayer(tracks)

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

            {tracks.length === 0 ? (
                <p className="status-text">No clips added for this reciter yet.</p>
            ) : (
                <div className="surah-grid">
                    {tracks.map(clip => {
                        const isCurrent = player.currentIndex === clip.index
                        return (
                            <div key={clip.key} className={`surah-card ${isCurrent ? 'playing' : ''}`}>
                                <span className="surah-name">{clip.title}</span>
                                <button
                                    className="play-btn"
                                    onClick={() => isCurrent ? player.togglePlayPause() : player.play(clip.index)}
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

export default ShortClipReciterPage
