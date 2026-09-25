import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getArchiveAudioFiles } from '../api'
import useAzkarData from '../hooks/useAzkarData'
import usePlaylistPlayer from '../hooks/usePlaylistPlayer'
import PlayerBar from '../components/PlayerBar'
import './Azkar.css'

// A real, complete recording of Azkar al-Sabah wal-Masaa by Sheikh Mishary
// Alafasy, hosted on the Internet Archive.
// https://archive.org/details/adkar_sabah_masae_safar
const ARCHIVE_IDENTIFIER = 'adkar_sabah_masae_safar'

function matchesKeywords(file, keywords) {
    const haystack = `${file.name} ${file.title}`.toLowerCase()
    return keywords.some(k => haystack.includes(k))
}

function AzkarListen() {
    const [period, setPeriod] = useState('morning')
    const { data } = useAzkarData()
    const items = data[period]

    const [tracks, setTracks] = useState([])
    const [loadState, setLoadState] = useState('loading') // 'loading' | 'ready' | 'error'

    useEffect(() => {
        let cancelled = false
        getArchiveAudioFiles(ARCHIVE_IDENTIFIER)
            .then(files => {
                if (cancelled) return
                const morningFile = files.find(f => matchesKeywords(f, ['sabah', 'صباح']))
                const eveningFile = files.find(f => matchesKeywords(f, ['masa', 'مساء']))
                const built = []
                if (morningFile) built.push({ key: 'morning', title: 'أذكار الصباح كاملة', audioUrl: morningFile.url })
                if (eveningFile) built.push({ key: 'evening', title: 'أذكار المساء كاملة', audioUrl: eveningFile.url })
                if (built.length === 0) {
                    setLoadState('error')
                    return
                }
                setTracks(built.map((t, i) => ({ ...t, index: i })))
                setLoadState('ready')
            })
            .catch(() => { if (!cancelled) setLoadState('error') })
        return () => { cancelled = true }
    }, [])

    const player = usePlaylistPlayer(tracks)

    function handlePeriodChange(next) {
        setPeriod(next)
        const idx = tracks.findIndex(t => t.key === next)
        if (idx !== -1 && player.currentIndex !== null) {
            player.play(idx)
        }
    }

    function handlePlayClick() {
        const idx = tracks.findIndex(t => t.key === period)
        if (idx === -1) return
        if (player.currentIndex === idx) {
            player.togglePlayPause()
        } else {
            player.play(idx)
        }
    }

    const isCurrentPlaying = player.isPlaying && tracks[player.currentIndex]?.key === period

    return (
        <section className="azkar-page" dir="rtl">
            <Link to="/azkar" className="back-link">&rarr; رجوع</Link>
            <h1 className="page-title">استمع إلى الأذكار</h1>
            <p className="page-subtitle">بصوت الشيخ مشاري راشد العفاسي</p>

            <div className="azkar-toggle">
                <button
                    className={period === 'morning' ? 'active' : ''}
                    onClick={() => handlePeriodChange('morning')}
                >
                    أذكار الصباح
                </button>
                <button
                    className={period === 'evening' ? 'active' : ''}
                    onClick={() => handlePeriodChange('evening')}
                >
                    أذكار المساء
                </button>
            </div>

            {loadState === 'loading' && <p className="status-text" dir="rtl">جارِ تحميل التسجيل الصوتي...</p>}
            {loadState === 'error' && (
                <p className="azkar-error">تعذر تحميل التسجيل الصوتي حاليًا، حاول مرة أخرى لاحقًا.</p>
            )}

            {loadState === 'ready' && (
                <div className="azkar-listen-player">
                    <button className="azkar-listen-play" onClick={handlePlayClick}>
                        {isCurrentPlaying ? '⏸ إيقاف مؤقت' : '▶ تشغيل'}
                    </button>
                </div>
            )}

            <div className="azkar-list">
                {items.map(item => (
                    <div key={item.id} className="azkar-card listen">
                        <p className="azkar-text">{item.text}</p>
                        {item.reference && <p className="azkar-reference">{item.reference}</p>}
                        {item.benefit && <p className="azkar-benefit">{item.benefit}</p>}
                        <span className="azkar-count-badge">× {item.count}</span>
                    </div>
                ))}
            </div>

            <PlayerBar player={player} subtitle="الشيخ مشاري راشد العفاسي" />
        </section>
    )
}

export default AzkarListen
