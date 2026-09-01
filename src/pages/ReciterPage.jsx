import { useEffect, useMemo, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { collection, getDocs, query, where } from 'firebase/firestore'
import { getReciters, getSurahNames, buildAudioUrl } from '../api'
import { db } from '../firebase'
import ReciterAvatar from '../components/ReciterAvatar'
import PlayerBar from '../components/PlayerBar'
import usePlaylistPlayer from '../hooks/usePlaylistPlayer'
import './ReciterPage.css'

function ReciterPage() {
    const { id } = useParams()
    const [reciter, setReciter] = useState(null)
    const [surahNames, setSurahNames] = useState([])
    const [extraSurahs, setExtraSurahs] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')

    useEffect(() => {
        async function load() {
            const [reciters, surahs] = await Promise.all([
                getReciters(),
                getSurahNames()
            ])
            const found = reciters.find(r => String(r.id) === id)
            setReciter(found)
            setSurahNames(surahs)
            setLoading(false)

            try {
                const extraSnap = await getDocs(query(
                    collection(db, 'fullSowarSurahs'),
                    where('reciterSource', '==', 'api'),
                    where('reciterId', '==', id)
                ))
                setExtraSurahs(extraSnap.docs.map(d => ({ id: d.id, ...d.data() })))
            } catch (err) {
                console.error('Could not load admin-added surahs:', err)
            }
        }
        load()
    }, [id])

    const moshaf = reciter && reciter.moshaf && reciter.moshaf[0]

    const allSurahs = useMemo(() => {
        if (!moshaf) return []

        const surahIds = moshaf.surah_list.split(',').filter(Boolean).map(Number)

        const apiSurahs = surahIds.map(surahNum => {
            const surahInfo = surahNames.find(s => s.id === surahNum)
            return {
                key: `api-${surahNum}`,
                title: surahInfo ? surahInfo.name.trim() : `Surah ${surahNum}`,
                number: surahNum,
                audioUrl: buildAudioUrl(moshaf.server, surahNum),
                isExtra: false
            }
        })

        const adminSurahs = extraSurahs
            .filter(s => s && s.surahName && s.audioUrl)
            .map(s => ({
                key: `extra-${s.id}`,
                title: s.surahName,
                number: null,
                audioUrl: s.audioUrl,
                isExtra: true
            }))

        return [...adminSurahs, ...apiSurahs].map((s, i) => ({ ...s, index: i }))
    }, [moshaf, surahNames, extraSurahs])

    const player = usePlaylistPlayer(allSurahs)

    if (loading) return <p className="status-text">Loading...</p>
    if (!reciter) return <p className="status-text">Reciter not found.</p>
    if (!moshaf) return <p className="status-text">No recitation data available for this reciter.</p>

    const filteredSurahs = allSurahs.filter(surah =>
        surah.title.toLowerCase().includes(searchTerm.trim().toLowerCase()) ||
        (surah.number !== null && String(surah.number).includes(searchTerm.trim()))
    )

    return (
        <section className="reciter-page">
            <Link to="/full-sowar" className="back-link">&larr; Back to Full Sowar</Link>

            <div className="reciter-header">
                <ReciterAvatar reciter={reciter} />
                <div>
                    <h1>{reciter.name}</h1>
                    <p className="rewaya">{moshaf.name}</p>
                </div>
            </div>

            <input
                type="text"
                className="search-input"
                placeholder="Search by surah name or number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />

            {filteredSurahs.length === 0 ? (
                <p className="status-text">No surahs match "{searchTerm}".</p>
            ) : (
                <div className="surah-grid">
                    {filteredSurahs.map(surah => {
                        const isCurrent = player.currentIndex === surah.index

                        return (
                            <div key={surah.key} className={`surah-card ${isCurrent ? 'playing' : ''}`}>
                                {surah.number !== null && <span className="surah-number">{surah.number}</span>}
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

export default ReciterPage
