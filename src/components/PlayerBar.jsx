import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
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

function DownloadIcon() {
    return (
        <svg {...iconProps} width={17} height={17} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M12 3v12" />
            <path d="M7 10.5 12 15.5 17 10.5" />
            <path d="M4.5 18.5h15" />
        </svg>
    )
}

function formatTime(seconds) {
    if (!isFinite(seconds) || seconds < 0) return '0:00'
    const m = Math.floor(seconds / 60)
    const s = Math.floor(seconds % 60)
    return `${m}:${s.toString().padStart(2, '0')}`
}

const REPEAT_LABELS_AR = { off: 'التكرار متوقف', one: 'تكرار المقطع الحالي', all: 'تكرار الكل' }

function SeekBar({ progress, duration, seek, setProgress }) {
    const trackRef = useRef(null)
    const [dragValue, setDragValue] = useState(null)

    const value = dragValue !== null ? dragValue : progress
    const pct = duration > 0 ? (value / duration) * 100 : 0

    function valueFromClientX(clientX) {
        const rect = trackRef.current.getBoundingClientRect()
        const ratio = rect.width > 0 ? (clientX - rect.left) / rect.width : 0
        return Math.min(1, Math.max(0, ratio)) * duration
    }

    function handlePointerDown(e) {
        if (!duration) return
        trackRef.current.setPointerCapture(e.pointerId)
        setDragValue(valueFromClientX(e.clientX))
    }

    function handlePointerMove(e) {
        if (dragValue === null) return
        setDragValue(valueFromClientX(e.clientX))
    }

    function commitDrag(e) {
        if (dragValue === null) return
        const v = valueFromClientX(e.clientX)
        setDragValue(null)
        seek(v)
    }

    function handleKeyDown(e) {
        if (!duration) return
        if (e.key === 'Home') { e.preventDefault(); seek(0); return }
        if (e.key === 'End') { e.preventDefault(); seek(duration); return }
        const delta = e.key === 'ArrowRight' ? 5 : e.key === 'ArrowLeft' ? -5 : 0
        if (!delta) return
        e.preventDefault()
        seek(Math.min(duration, Math.max(0, progress + delta)))
    }

    return (
        <div
            ref={trackRef}
            className={`player-seek ${dragValue !== null ? 'dragging' : ''}`}
            dir="ltr"
            role="slider"
            tabIndex={0}
            aria-label="التقديم"
            aria-valuemin={0}
            aria-valuemax={duration || 0}
            aria-valuenow={value}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={commitDrag}
            onPointerCancel={commitDrag}
            onKeyDown={handleKeyDown}
        >
            <div className="player-seek-track">
                <div className="player-seek-fill" style={{ width: `${pct}%` }} />
                <div className="player-seek-thumb" style={{ left: `${pct}%` }} />
            </div>
        </div>
    )
}

function sanitizeFilename(name) {
    return (name || 'تلاوة').replace(/[\\/:*?"<>|]/g, ' ').trim().slice(0, 120)
}

function PlayerBar({ player, subtitle }) {
    const {
        currentTrack, isPlaying, repeatMode, progress, duration, audioRef,
        togglePlayPause, next, prev, cycleRepeat, handleEnded, stop, seek,
        setProgress, setDuration
    } = player

    const [downloading, setDownloading] = useState(false)

    useEffect(() => {
        setDownloading(false)
    }, [currentTrack])

    if (!currentTrack) return null

    async function handleDownload() {
        setDownloading(true)
        const filename = `${sanitizeFilename(currentTrack.title)}.mp3`
        try {
            const res = await fetch(currentTrack.audioUrl)
            if (!res.ok) throw new Error('download failed')
            const blob = await res.blob()
            const blobUrl = URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = blobUrl
            a.download = filename
            document.body.appendChild(a)
            a.click()
            a.remove()
            URL.revokeObjectURL(blobUrl)
        } catch {
            window.open(currentTrack.audioUrl, '_blank')
        }
        setDownloading(false)
    }

    return createPortal(
        <div className="player-bar">
            <audio
                ref={audioRef}
                src={currentTrack.audioUrl}
                onEnded={handleEnded}
                onTimeUpdate={(e) => setProgress(e.target.currentTime)}
                onLoadedMetadata={(e) => setDuration(e.target.duration)}
            />

            <SeekBar progress={progress} duration={duration} seek={seek} setProgress={setProgress} />

            <div className="player-bar-row">
                <div className="player-track-info">
                    <span className="player-track-title">{currentTrack.title}</span>
                    {subtitle && <span className="player-track-subtitle">{subtitle}</span>}
                </div>

                <div className="player-controls">
                    <button className="player-icon-btn" onClick={prev} aria-label="السابق"><PrevIcon /></button>
                    <button className="player-play-btn" onClick={togglePlayPause} aria-label={isPlaying ? 'إيقاف مؤقت' : 'تشغيل'}>
                        {isPlaying ? <PauseIcon /> : <PlayIcon />}
                    </button>
                    <button className="player-icon-btn" onClick={next} aria-label="التالي"><NextIcon /></button>
                </div>

                <div className="player-side-controls">
                    <span className="player-time">{formatTime(progress)} / {formatTime(duration)}</span>
                    <button
                        className="player-icon-btn"
                        onClick={handleDownload}
                        disabled={downloading}
                        aria-label={downloading ? 'جارِ التنزيل...' : 'تنزيل الصوت'}
                        title={downloading ? 'جارِ التنزيل...' : 'تنزيل الصوت'}
                    >
                        <DownloadIcon />
                    </button>
                    <button
                        className={`player-repeat-btn repeat-${repeatMode}`}
                        onClick={cycleRepeat}
                        aria-label={REPEAT_LABELS_AR[repeatMode]}
                        title={REPEAT_LABELS_AR[repeatMode]}
                    >
                        <RepeatIcon />
                        {repeatMode === 'one' && <span className="player-repeat-badge">1</span>}
                    </button>
                    <button className="player-close-btn" onClick={stop} aria-label="إغلاق المشغل"><CloseIcon /></button>
                </div>
            </div>
        </div>,
        document.body
    )
}

export default PlayerBar
