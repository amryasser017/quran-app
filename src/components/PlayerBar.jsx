import './PlayerBar.css'

const iconProps = { width: 18, height: 18, viewBox: '0 0 24 24', fill: 'currentColor' }

function PrevIcon() {
    return (
        <svg {...iconProps} aria-hidden="true">
            <path d="M6 5a1 1 0 0 1 1 1v12a1 1 0 1 1-2 0V6a1 1 0 0 1 1-1Zm13.3.4a1 1 0 0 1 .7 1v11.2a1 1 0 0 1-1.6.8L9.6 12.8a1 1 0 0 1 0-1.6l8.8-6.6a1 1 0 0 1 .9-.2Z" />
        </svg>
    )
}

function NextIcon() {
    return (
        <svg {...iconProps} aria-hidden="true">
            <path d="M18 5a1 1 0 0 0-1 1v12a1 1 0 1 0 2 0V6a1 1 0 0 0-1-1ZM4.7 5.4a1 1 0 0 0-.7 1v11.2a1 1 0 0 0 1.6.8l8.8-6.6a1 1 0 0 0 0-1.6L5.6 3.6a1 1 0 0 0-.9-.2Z" />
        </svg>
    )
}

function PlayIcon() {
    return (
        <svg {...iconProps} width={16} height={16} aria-hidden="true">
            <path d="M8 5.3a1 1 0 0 1 1.5-.87l10 6.7a1 1 0 0 1 0 1.74l-10 6.7A1 1 0 0 1 8 18.7V5.3Z" />
        </svg>
    )
}

function PauseIcon() {
    return (
        <svg {...iconProps} width={16} height={16} aria-hidden="true">
            <path d="M7 4.5a1.5 1.5 0 0 1 1.5 1.5v12a1.5 1.5 0 0 1-3 0V6A1.5 1.5 0 0 1 7 4.5Zm10 0a1.5 1.5 0 0 1 1.5 1.5v12a1.5 1.5 0 0 1-3 0V6A1.5 1.5 0 0 1 17 4.5Z" />
        </svg>
    )
}

function RepeatIcon() {
    return (
        <svg {...iconProps} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M17 2.5 20 5.5 17 8.5" />
            <path d="M4 11.5v-2a4 4 0 0 1 4-4h12" />
            <path d="M7 21.5 4 18.5 7 15.5" />
            <path d="M20 12.5v2a4 4 0 0 1-4 4H4" />
        </svg>
    )
}

function CloseIcon() {
    return (
        <svg {...iconProps} width={15} height={15} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
            <path d="M5 5 19 19M19 5 5 19" />
        </svg>
    )
}

function formatTime(seconds) {
    if (!isFinite(seconds) || seconds < 0) return '0:00'
    const m = Math.floor(seconds / 60)
    const s = Math.floor(seconds % 60)
    return `${m}:${s.toString().padStart(2, '0')}`
}

function PlayerBar({ player, subtitle }) {
    const {
        currentTrack, isPlaying, repeatMode, progress, duration, audioRef,
        togglePlayPause, next, prev, cycleRepeat, handleEnded, stop, seek,
        setProgress, setDuration
    } = player

    if (!currentTrack) return null

    const pct = duration > 0 ? (progress / duration) * 100 : 0

    return (
        <div className="player-bar">
            <audio
                ref={audioRef}
                src={currentTrack.audioUrl}
                onEnded={handleEnded}
                onTimeUpdate={(e) => setProgress(e.target.currentTime)}
                onLoadedMetadata={(e) => setDuration(e.target.duration)}
            />

            <input
                type="range"
                className="player-seek"
                min="0"
                max={duration || 0}
                value={progress}
                onChange={(e) => seek(Number(e.target.value))}
                style={{ backgroundSize: `${pct}% 100%` }}
                aria-label="Seek"
            />

            <div className="player-bar-row">
                <div className="player-track-info">
                    <span className="player-track-title">{currentTrack.title}</span>
                    {subtitle && <span className="player-track-subtitle">{subtitle}</span>}
                </div>

                <div className="player-controls">
                    <button className="player-icon-btn" onClick={prev} aria-label="Previous"><PrevIcon /></button>
                    <button className="player-play-btn" onClick={togglePlayPause} aria-label={isPlaying ? 'Pause' : 'Play'}>
                        {isPlaying ? <PauseIcon /> : <PlayIcon />}
                    </button>
                    <button className="player-icon-btn" onClick={next} aria-label="Next"><NextIcon /></button>
                </div>

                <div className="player-side-controls">
                    <span className="player-time">{formatTime(progress)} / {formatTime(duration)}</span>
                    <button
                        className={`player-repeat-btn repeat-${repeatMode}`}
                        onClick={cycleRepeat}
                        aria-label={`Repeat: ${repeatMode}`}
                        title={`Repeat: ${repeatMode === 'all' ? 'all' : repeatMode === 'one' ? 'one' : 'off'}`}
                    >
                        <RepeatIcon />
                        {repeatMode === 'one' && <span className="player-repeat-badge">1</span>}
                    </button>
                    <button className="player-close-btn" onClick={stop} aria-label="Close player"><CloseIcon /></button>
                </div>
            </div>
        </div>
    )
}

export default PlayerBar
