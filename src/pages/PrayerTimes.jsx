import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getPrayerTimesByCity, getPrayerTimesByCoords, reverseGeocode } from '../api'
import cities from '../data/cities'
import QiblaCompass from '../components/QiblaCompass'
import './PrayerTimes.css'

const STORAGE_KEY = 'prayerLocation'

const PRAYER_ORDER = ['Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha']
const NEXT_ELIGIBLE = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha']
const PRAYER_ICONS = {
    Fajr: '🌄',
    Sunrise: '🌅',
    Dhuhr: '☀️',
    Asr: '🌤️',
    Maghrib: '🌇',
    Isha: '🌙'
}

function saveLocation(loc) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(loc))
    } catch {
        // ignore storage failures (private browsing, disabled storage, etc.)
    }
}

function loadSavedLocation() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY)
        return raw ? JSON.parse(raw) : null
    } catch {
        return null
    }
}

function toMinutes(hhmm) {
    if (!hhmm) return null
    const [h, m] = hhmm.split(':').map(Number)
    return h * 60 + m
}

function getNowInTimezone(timezone) {
    const now = new Date()
    if (!timezone) return now
    try {
        const parts = new Intl.DateTimeFormat('en-US', {
            timeZone: timezone,
            hourCycle: 'h23',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        }).formatToParts(now)
        const get = (type) => Number(parts.find(p => p.type === type)?.value ?? 0)
        const zoned = new Date(now)
        zoned.setHours(get('hour'), get('minute'), get('second'), 0)
        return zoned
    } catch {
        return now
    }
}

function getNextPrayer(timings, nowInZone) {
    const nowMinutes = nowInZone.getHours() * 60 + nowInZone.getMinutes()
    for (const name of NEXT_ELIGIBLE) {
        const t = toMinutes(timings[name])
        if (t !== null && t > nowMinutes) return name
    }
    return 'Fajr'
}

function getCountdown(timings, nextName, nowInZone) {
    const nowMinutes = nowInZone.getHours() * 60 + nowInZone.getMinutes()
    let target = toMinutes(timings[nextName])
    if (target === null) return ''
    let diff = target - nowMinutes
    if (diff <= 0) diff += 24 * 60
    const h = Math.floor(diff / 60)
    const m = diff % 60
    return h === 0 ? `in ${m}m` : `in ${h}h ${m}m`
}

function formatDisplayTime(hhmm) {
    if (!hhmm) return '--:--'
    const [hStr, mStr] = hhmm.split(':')
    let h = Number(hStr)
    const period = h >= 12 ? 'PM' : 'AM'
    h = h % 12
    if (h === 0) h = 12
    return `${h}:${mStr} ${period}`
}

function PrayerTimes() {
    const [city, setCity] = useState('')
    const [country, setCountry] = useState('')
    const [prayerData, setPrayerData] = useState(null)
    const [loading, setLoading] = useState(false)
    const [detecting, setDetecting] = useState(false)
    const [error, setError] = useState('')
    const [searchInput, setSearchInput] = useState('')
    const [, setTick] = useState(0)

    useEffect(() => {
        const saved = loadSavedLocation()
        if (!saved) return
        setLoading(true)
        const fetchPromise = saved.mode === 'coords'
            ? getPrayerTimesByCoords(saved.latitude, saved.longitude, saved.country)
            : getPrayerTimesByCity(saved.city, saved.country)

        fetchPromise
            .then(data => {
                setPrayerData(data)
                setCity(saved.city)
                setCountry(saved.country || '')
            })
            .catch(err => setError(err.message || 'Could not load your saved location.'))
            .finally(() => setLoading(false))
    }, [])

    useEffect(() => {
        if (!prayerData) return
        const id = setInterval(() => setTick(t => t + 1), 30000)
        return () => clearInterval(id)
    }, [prayerData])

    async function fetchAndApply(fetchFn, cityName, countryName, coords) {
        setLoading(true)
        setError('')
        try {
            const data = await fetchFn()
            setPrayerData(data)
            setCity(cityName)
            setCountry(countryName)
            saveLocation(coords
                ? { mode: 'coords', city: cityName, country: countryName, ...coords }
                : { mode: 'city', city: cityName, country: countryName })
        } catch (err) {
            setError(err.message || 'Something went wrong. Please try again.')
        }
        setLoading(false)
    }

    function handleDetect() {
        if (!navigator.geolocation) {
            setError('Your browser does not support location detection. Try searching instead.')
            return
        }
        setDetecting(true)
        setError('')
        navigator.geolocation.getCurrentPosition(
            async (pos) => {
                const { latitude, longitude } = pos.coords
                try {
                    const place = await reverseGeocode(latitude, longitude)
                    const cityName = place?.city || 'Your location'
                    const countryName = place?.country || ''
                    const data = await getPrayerTimesByCoords(latitude, longitude, countryName)
                    setPrayerData(data)
                    setCity(cityName)
                    setCountry(countryName)
                    saveLocation({ mode: 'coords', city: cityName, country: countryName, latitude, longitude })
                } catch (err) {
                    setError(err.message || 'Could not fetch prayer times for your location.')
                }
                setDetecting(false)
            },
            (err) => {
                setDetecting(false)
                setError(err.code === err.PERMISSION_DENIED
                    ? 'Location access was denied. Choose a city instead.'
                    : 'Could not detect your location. Choose a city instead.')
            },
            { timeout: 10000, maximumAge: 600000 }
        )
    }

    function handleSearchSubmit(e) {
        e.preventDefault()
        const trimmed = searchInput.trim()
        if (!trimmed) return
        let cityName = trimmed
        let countryName = ''
        if (trimmed.includes(',')) {
            const parts = trimmed.split(',')
            cityName = parts[0].trim()
            countryName = parts.slice(1).join(',').trim()
        }
        fetchAndApply(() => getPrayerTimesByCity(cityName, countryName), cityName, countryName)
    }

    function handleDropdownChange(e) {
        const idx = e.target.value
        if (idx === '') return
        const picked = cities[Number(idx)]
        fetchAndApply(() => getPrayerTimesByCity(picked.city, picked.country), picked.city, picked.country)
        e.target.value = ''
    }

    function handleChangeCity() {
        setPrayerData(null)
        setError('')
        setSearchInput('')
    }

    const nowInZone = prayerData ? getNowInTimezone(prayerData.timezone) : null
    const nextPrayer = prayerData ? getNextPrayer(prayerData.timings, nowInZone) : null
    const countdown = prayerData ? getCountdown(prayerData.timings, nextPrayer, nowInZone) : ''

    return (
        <section className="prayer-page">
            <Link to="/" className="back-link">&larr; Back</Link>
            <h1 className="page-title">Prayer Times</h1>
            <p className="page-subtitle">Accurate prayer times for any city, anywhere</p>

            {!prayerData && !loading && (
                <div className="prayer-picker">
                    <button className="detect-btn" onClick={handleDetect} disabled={detecting}>
                        {detecting ? 'Detecting your location...' : '📍 Detect My Location'}
                    </button>

                    <div className="prayer-divider"><span>or</span></div>

                    <form className="prayer-search-row" onSubmit={handleSearchSubmit}>
                        <input
                            type="text"
                            className="search-input prayer-search-input"
                            placeholder="Search any city... e.g. Cairo, Egypt"
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                        />
                        <button type="submit" className="prayer-search-btn">Search</button>
                    </form>

                    <div className="prayer-dropdown-row">
                        <label htmlFor="city-select">Or choose a popular city</label>
                        <select id="city-select" defaultValue="" onChange={handleDropdownChange}>
                            <option value="" disabled>Select a city...</option>
                            {cities.map((c, i) => (
                                <option key={`${c.city}-${c.country}`} value={i}>
                                    {c.city}, {c.country}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            )}

            {loading && <p className="status-text">Loading prayer times...</p>}
            {error && <p className="prayer-error">{error}</p>}

            {prayerData && !loading && (
                <div className="prayer-result">
                    <div className="prayer-location-row">
                        <h2>{city}{country ? `, ${country}` : ''}</h2>
                        <button className="change-city-btn" onClick={handleChangeCity}>Change city</button>
                    </div>
                    <p className="prayer-dates">
                        {prayerData.gregorian}{prayerData.hijri ? ` · ${prayerData.hijri}` : ''}
                    </p>

                    <div className="prayer-times-grid">
                        {PRAYER_ORDER.map(name => {
                            const isNext = name === nextPrayer
                            return (
                                <div key={name} className={`prayer-card ${isNext ? 'next' : ''}`}>
                                    <span className="prayer-icon">{PRAYER_ICONS[name]}</span>
                                    <span className="prayer-name">{name}</span>
                                    <span className="prayer-time">{formatDisplayTime(prayerData.timings[name])}</span>
                                    {isNext && <span className="prayer-countdown">{countdown}</span>}
                                </div>
                            )
                        })}
                    </div>

                    <QiblaCompass />
                </div>
            )}
        </section>
    )
}

export default PrayerTimes
