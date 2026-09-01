import { useCallback, useEffect, useRef, useState } from 'react'

// tracks: array of { key, title, audioUrl, index }
// repeatMode: 'all' (loop whole list, default) | 'one' (loop current track) | 'off' (stop after last track)
function usePlaylistPlayer(tracks) {
    const [currentIndex, setCurrentIndex] = useState(null)
    const [isPlaying, setIsPlaying] = useState(false)
    const [repeatMode, setRepeatMode] = useState('all')
    const [progress, setProgress] = useState(0)
    const [duration, setDuration] = useState(0)
    const audioRef = useRef(null)

    const currentTrack = currentIndex !== null ? tracks[currentIndex] : null

    const play = useCallback((index) => {
        if (index < 0 || index >= tracks.length) return
        setCurrentIndex(index)
        setIsPlaying(true)
    }, [tracks])

    const togglePlayPause = useCallback(() => {
        if (currentIndex === null) {
            if (tracks.length > 0) play(0)
            return
        }
        setIsPlaying(p => !p)
    }, [currentIndex, tracks, play])

    const next = useCallback(() => {
        if (currentIndex === null || tracks.length === 0) return
        const nextIndex = currentIndex + 1
        if (nextIndex < tracks.length) {
            setCurrentIndex(nextIndex)
            setIsPlaying(true)
        } else if (repeatMode !== 'off') {
            setCurrentIndex(0)
            setIsPlaying(true)
        } else {
            setIsPlaying(false)
        }
    }, [currentIndex, tracks, repeatMode])

    const prev = useCallback(() => {
        if (currentIndex === null || tracks.length === 0) return
        const prevIndex = currentIndex - 1
        setCurrentIndex(prevIndex >= 0 ? prevIndex : tracks.length - 1)
        setIsPlaying(true)
    }, [currentIndex, tracks])

    const cycleRepeat = useCallback(() => {
        setRepeatMode(m => (m === 'all' ? 'one' : m === 'one' ? 'off' : 'all'))
    }, [])

    const handleEnded = useCallback(() => {
        if (repeatMode === 'one') {
            const audio = audioRef.current
            if (audio) {
                audio.currentTime = 0
                audio.play().catch(() => {})
            }
            return
        }
        next()
    }, [repeatMode, next])

    const stop = useCallback(() => {
        setCurrentIndex(null)
        setIsPlaying(false)
    }, [])

    const seek = useCallback((time) => {
        const audio = audioRef.current
        if (audio) audio.currentTime = time
    }, [])

    useEffect(() => {
        const audio = audioRef.current
        if (!audio || !currentTrack) return
        if (isPlaying) {
            audio.play().catch(() => {})
        } else {
            audio.pause()
        }
    }, [isPlaying, currentTrack])

    return {
        currentIndex, currentTrack, isPlaying, repeatMode, progress, duration, audioRef,
        play, togglePlayPause, next, prev, cycleRepeat, handleEnded, stop, seek,
        setProgress, setDuration
    }
}

export default usePlaylistPlayer
