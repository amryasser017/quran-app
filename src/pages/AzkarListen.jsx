import { useState } from 'react'
import { Link } from 'react-router-dom'
import azkar from '../data/azkar'
import useSpeechPlaylist from '../hooks/useSpeechPlaylist'
import './Azkar.css'

function AzkarListen() {
    const [period, setPeriod] = useState('morning')
    const items = azkar[period]
    const player = useSpeechPlaylist(items)

    function handlePeriodChange(next) {
        player.stop()
        setPeriod(next)
    }

    function handlePlayClick() {
        if (player.currentIndex === null) {
            player.play(0)
        } else {
            player.togglePlayPause()
        }
    }

    return (
        <section className="azkar-page" dir="rtl">
            <Link to="/azkar" className="back-link">رجوع</Link>
            <h1 className="page-title">استمع إلى الأذكار</h1>
            <p className="page-subtitle">استماع تلقائي للأذكار بصوت الجهاز</p>

            {!player.supported && (
                <p className="azkar-error">
                    هذا المتصفح لا يدعم خاصية القراءة الصوتية، جرّب قسم «اقرأ» بدلاً من ذلك.
                </p>
            )}

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

            {player.supported && (
                <div className="azkar-listen-player">
                    <button className="azkar-listen-play" onClick={handlePlayClick}>
                        {player.isPlaying ? '⏸ إيقاف مؤقت' : '▶ تشغيل'}
                    </button>
                    <div className="azkar-listen-controls">
                        <button onClick={player.prev} disabled={player.currentIndex === null}>السابق</button>
                        <button onClick={player.next} disabled={player.currentIndex === null}>التالي</button>
                        <button onClick={player.stop} disabled={player.currentIndex === null}>إيقاف ✕</button>
                    </div>
                </div>
            )}

            <div className="azkar-list">
                {items.map((item, index) => (
                    <div
                        key={item.id}
                        className={`azkar-card listen ${player.currentIndex === index ? 'active' : ''}`}
                    >
                        <p className="azkar-text">{item.text}</p>
                        {item.reference && <p className="azkar-reference">{item.reference}</p>}
                        <span className="azkar-count-badge">× {item.count}</span>
                    </div>
                ))}
            </div>
        </section>
    )
}

export default AzkarListen
