const API_BASE = "https://www.mp3quran.net/api/v3"

export async function getReciters() {
    const res = await fetch(`${API_BASE}/reciters?language=eng`)
    const data = await res.json()
    return data.reciters
}

export async function getSurahNames() {
    const res = await fetch(`${API_BASE}/suwar`)
    const data = await res.json()
    return data.suwar
}

export function buildAudioUrl(serverUrl, surahNumber) {
    const padded = String(surahNumber).padStart(3, '0')
    return `${serverUrl}${padded}.mp3`
}