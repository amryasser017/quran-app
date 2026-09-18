import { useCallback, useEffect, useRef, useState } from 'react'

// items: array of { id, text, count } — each item's text is spoken `count` times in a row
function useSpeechPlaylist(items) {
    const [supported] = useState(() => typeof window !== 'undefined' && 'speechSynthesis' in window)
    const [currentIndex, setCurrentIndex] = useState(null)
    const [isPlaying, setIsPlaying] = useState(false)
    const voiceRef = useRef(null)

    useEffect(() => {
        if (!supported) return
        function pickVoice() {
            const voices = window.speechSynthesis.getVoices()
            voiceRef.current = voices.find(v => v.lang?.toLowerCase().startsWith('ar')) || null
        }
        pickVoice()
        window.speechSynthesis.onvoiceschanged = pickVoice
    }, [supported])

    useEffect(() => {
        if (!supported) return
        return () => window.speechSynthesis.cancel()
    }, [supported])

    const speakFrom = useCallback((index) => {
        if (!supported) return
        window.speechSynthesis.cancel()
        if (index < 0 || index >= items.length) {
            setIsPlaying(false)
            setCurrentIndex(null)
            return
        }
        for (let i = index; i < items.length; i++) {
            const item = items[i]
            const repeats = Math.max(1, item.count || 1)
            for (let r = 0; r < repeats; r++) {
                const utter = new SpeechSynthesisUtterance(item.text)
                utter.lang = 'ar-SA'
                utter.rate = 0.92
                if (voiceRef.current) utter.voice = voiceRef.current
                if (r === 0) {
                    utter.onstart = () => setCurrentIndex(i)
                }
                if (i === items.length - 1 && r === repeats - 1) {
                    utter.onend = () => {
                        setIsPlaying(false)
                        setCurrentIndex(null)
                    }
                }
                window.speechSynthesis.speak(utter)
            }
        }
        setIsPlaying(true)
    }, [items, supported])

    const play = useCallback((index = 0) => {
        speakFrom(index)
    }, [speakFrom])

    const togglePlayPause = useCallback(() => {
        if (!supported) return
        if (currentIndex === null) {
            play(0)
            return
        }
        if (isPlaying) {
            window.speechSynthesis.pause()
            setIsPlaying(false)
        } else {
            window.speechSynthesis.resume()
            setIsPlaying(true)
        }
    }, [supported, currentIndex, isPlaying, play])

    const next = useCallback(() => {
        if (currentIndex === null) return
        speakFrom(currentIndex + 1)
    }, [currentIndex, speakFrom])

    const prev = useCallback(() => {
        if (currentIndex === null) return
        speakFrom(Math.max(0, currentIndex - 1))
    }, [currentIndex, speakFrom])

    const stop = useCallback(() => {
        if (supported) window.speechSynthesis.cancel()
        setIsPlaying(false)
        setCurrentIndex(null)
    }, [supported])

    return { supported, currentIndex, isPlaying, play, togglePlayPause, next, prev, stop }
}

export default useSpeechPlaylist
