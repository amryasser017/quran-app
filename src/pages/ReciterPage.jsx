import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getReciters, getSurahNames, buildAudioUrl } from '../api'
import ReciterAvatar from '../components/ReciterAvatar'
import './ReciterPage.css'

function ReciterPage() {
    const { id } = useParams()
    const [reciter, setReciter] = useState(null)
    const [surahNames, setSurahNames] = useState([])
    const [nowPlaying, setNowPlaying] = useState(null)
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')

    useEffect(() => {
        Promise.all([getReciters(), getSurahNames()]).then(([reciters, surahs]) => {
            const found = reciters.find(r => String(r.id) === id)
            setReciter(found)
            setSurahNames(surahs)
            setLoading(false)
        })
    }, [id])

    if (loading) return <p className="status-text">Loading...</p>
    if (!reciter) return <p className="status-text">Reciter not found.</p>

    const moshaf = reciter.moshaf && reciter.moshaf[0]
    if (!moshaf) return <p className="status-text">No recitation data available for this reciter.</p>
    const surahIds = moshaf.surah_list.split(',').filter(Boolean).map(Number)

    const surahsWithNames = surahIds.map(surahNum => {
        const surahInfo = surahNames.find(s => s.id === surahNum)
        return {
            number: surahNum,
            name: surahInfo ? surahInfo.name.trim() : `Surah ${surahNum}`
        }
    })

    const filteredSurahs = surahsWithNames.filter(surah =>
        surah.name.toLowerCase().includes(searchTerm.trim().toLowerCase()) ||
        String(surah.number).includes(searchTerm.trim())
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
                        const audioUrl = buildAudioUrl(moshaf.server, surah.number)
                        const isPlaying = nowPlaying === surah.number

                        return (
                            <div key={surah.number} className={`surah-card ${isPlaying ? 'playing' : ''}`}>
                                <span className="surah-number">{surah.number}</span>
                                <span className="surah-name">{surah.name}</span>
                                <button
                                    className="play-btn"
                                    onClick={() => setNowPlaying(isPlaying ? null : surah.number)}
                                >
                                    {isPlaying ? '⏸ Pause' : '▶ Play'}
                                </button>
                                {isPlaying && (
                                    <audio
                                        src={audioUrl}
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

export default ReciterPage
