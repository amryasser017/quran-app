const API_BASE = "https://www.mp3quran.net/api/v3"
const PRAYER_API_BASE = "https://api.aladhan.com/v1"
const GEOCODE_API_BASE = "https://api.bigdatacloud.net/data/reverse-geocode-client"
const PRAYER_METHOD = 3 // Muslim World League

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

function cleanTime(t) {
    // Aladhan sometimes appends a timezone offset, e.g. "05:12 (+03)"
    return t ? t.split(' ')[0] : t
}

function parsePrayerResponse(json) {
    if (!json || json.code !== 200 || !json.data) {
        throw new Error('Could not find prayer times for that location.')
    }
    const { timings, date, meta } = json.data
    return {
        timings: {
            Fajr: cleanTime(timings.Fajr),
            Sunrise: cleanTime(timings.Sunrise),
            Dhuhr: cleanTime(timings.Dhuhr),
            Asr: cleanTime(timings.Asr),
            Maghrib: cleanTime(timings.Maghrib),
            Isha: cleanTime(timings.Isha)
        },
        gregorian: date?.readable || '',
        hijri: date?.hijri ? `${date.hijri.day} ${date.hijri.month?.en || ''} ${date.hijri.year} AH` : '',
        timezone: meta?.timezone || ''
    }
}

export async function getPrayerTimesByCity(city, country) {
    const params = new URLSearchParams({ city, method: String(PRAYER_METHOD) })
    if (country) params.set('country', country)
    const res = await fetch(`${PRAYER_API_BASE}/timingsByCity?${params.toString()}`)
    if (!res.ok) throw new Error('Could not find prayer times for that city. Try adding the country, e.g. "Cairo, Egypt".')
    return parsePrayerResponse(await res.json())
}

export async function getPrayerTimesByCoords(latitude, longitude) {
    const params = new URLSearchParams({
        latitude: String(latitude),
        longitude: String(longitude),
        method: String(PRAYER_METHOD)
    })
    const res = await fetch(`${PRAYER_API_BASE}/timings?${params.toString()}`)
    if (!res.ok) throw new Error('Could not fetch prayer times for your location.')
    return parsePrayerResponse(await res.json())
}

export async function reverseGeocode(latitude, longitude) {
    try {
        const params = new URLSearchParams({
            latitude: String(latitude),
            longitude: String(longitude),
            localityLanguage: 'en'
        })
        const res = await fetch(`${GEOCODE_API_BASE}?${params.toString()}`)
        if (!res.ok) return null
        const json = await res.json()
        const city = json.city || json.locality || json.principalSubdivision
        if (!city) return null
        return { city, country: json.countryName || '' }
    } catch {
        return null
    }
}

export async function getCurrentHijriDate() {
    const today = new Date()
    const dd = String(today.getDate()).padStart(2, '0')
    const mm = String(today.getMonth() + 1).padStart(2, '0')
    const yyyy = today.getFullYear()
    const res = await fetch(`${PRAYER_API_BASE}/gToH/${dd}-${mm}-${yyyy}`)
    if (!res.ok) throw new Error("Could not fetch today's Hijri date.")
    const json = await res.json()
    const h = json?.data?.hijri
    if (!h) throw new Error("Could not fetch today's Hijri date.")
    return { day: Number(h.day), month: Number(h.month.number), year: Number(h.year) }
}

export async function hijriToGregorian(day, month, year) {
    const dd = String(day).padStart(2, '0')
    const mm = String(month).padStart(2, '0')
    const res = await fetch(`${PRAYER_API_BASE}/hToG/${dd}-${mm}-${year}`)
    if (!res.ok) throw new Error('Could not convert that Hijri date.')
    const json = await res.json()
    const g = json?.data?.gregorian
    if (!g?.date) throw new Error('Could not convert that Hijri date.')
    const [gd, gm, gy] = g.date.split('-').map(Number)
    return new Date(gy, gm - 1, gd)
}