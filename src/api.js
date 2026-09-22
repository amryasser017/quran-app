import { getMethodForCountry } from './data/prayerMethods'

const API_BASE = "https://www.mp3quran.net/api/v3"
const PRAYER_API_BASE = "https://api.aladhan.com/v1"
const GEOCODE_API_BASE = "https://api.bigdatacloud.net/data/reverse-geocode-client"
const ARCHIVE_METADATA_BASE = "https://archive.org/metadata"
const ARCHIVE_DOWNLOAD_BASE = "https://archive.org/download"

export async function getReciters() {
    const res = await fetch(`${API_BASE}/reciters?language=ar`)
    const data = await res.json()
    return data.reciters
}

export async function getSurahNames() {
    const res = await fetch(`${API_BASE}/suwar?language=ar`)
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

const GREGORIAN_MONTHS_AR = [
    'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
    'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
]

function parsePrayerResponse(json) {
    if (!json || json.code !== 200 || !json.data) {
        throw new Error('تعذر العثور على مواقيت الصلاة لهذا الموقع.')
    }
    const { timings, date, meta } = json.data
    const g = date?.gregorian
    const h = date?.hijri
    return {
        timings: {
            Fajr: cleanTime(timings.Fajr),
            Sunrise: cleanTime(timings.Sunrise),
            Dhuhr: cleanTime(timings.Dhuhr),
            Asr: cleanTime(timings.Asr),
            Maghrib: cleanTime(timings.Maghrib),
            Isha: cleanTime(timings.Isha)
        },
        gregorian: g ? `${g.day} ${GREGORIAN_MONTHS_AR[g.month.number - 1]} ${g.year}` : '',
        hijri: h ? `${h.day} ${h.month?.ar || h.month?.en || ''} ${h.year} هـ` : '',
        timezone: meta?.timezone || ''
    }
}

export async function getPrayerTimesByCity(city, country) {
    const method = getMethodForCountry(country)
    const params = new URLSearchParams({ city, method: String(method) })
    if (country) params.set('country', country)
    const res = await fetch(`${PRAYER_API_BASE}/timingsByCity?${params.toString()}`)
    if (!res.ok) throw new Error('تعذر العثور على مواقيت الصلاة لهذه المدينة. جرّب إضافة اسم الدولة، مثل "القاهرة، مصر".')
    return parsePrayerResponse(await res.json())
}

export async function getPrayerTimesByCoords(latitude, longitude, country) {
    const method = getMethodForCountry(country)
    const params = new URLSearchParams({
        latitude: String(latitude),
        longitude: String(longitude),
        method: String(method)
    })
    const res = await fetch(`${PRAYER_API_BASE}/timings?${params.toString()}`)
    if (!res.ok) throw new Error('تعذر جلب مواقيت الصلاة لموقعك.')
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
    if (!res.ok) throw new Error('تعذر جلب تاريخ اليوم الهجري.')
    const json = await res.json()
    const h = json?.data?.hijri
    if (!h) throw new Error('تعذر جلب تاريخ اليوم الهجري.')
    return { day: Number(h.day), month: Number(h.month.number), year: Number(h.year) }
}

export async function hijriToGregorian(day, month, year) {
    const dd = String(day).padStart(2, '0')
    const mm = String(month).padStart(2, '0')
    const res = await fetch(`${PRAYER_API_BASE}/hToG/${dd}-${mm}-${year}`)
    if (!res.ok) throw new Error('تعذر تحويل هذا التاريخ الهجري.')
    const json = await res.json()
    const g = json?.data?.gregorian
    if (!g?.date) throw new Error('تعذر تحويل هذا التاريخ الهجري.')
    const [gd, gm, gy] = g.date.split('-').map(Number)
    return new Date(gy, gm - 1, gd)
}

// Looks up an Internet Archive item's real file listing at runtime (official,
// documented Metadata API) rather than hardcoding a guessed download URL.
export async function getArchiveAudioFiles(identifier) {
    const res = await fetch(`${ARCHIVE_METADATA_BASE}/${identifier}`)
    if (!res.ok) throw new Error('تعذر تحميل مجموعة الملفات الصوتية.')
    const json = await res.json()
    const files = json?.files || []
    return files
        .filter(f => f.name && /\.mp3$/i.test(f.name) && (f.format || '').toLowerCase().includes('mp3'))
        .map(f => ({
            name: f.name,
            title: f.title || '',
            url: `${ARCHIVE_DOWNLOAD_BASE}/${identifier}/${encodeURIComponent(f.name)}`
        }))
}