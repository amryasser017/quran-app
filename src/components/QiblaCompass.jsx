import { useEffect, useRef, useState } from 'react'
import './QiblaCompass.css'

const KAABA_LAT = 21.4225241
const KAABA_LON = 39.8261818

function toRad(deg) {
    return (deg * Math.PI) / 180
}

function toDeg(rad) {
    return (rad * 180) / Math.PI
}

// Great-circle initial bearing from the user's coordinates to the Kaaba.
function calculateQiblaBearing(lat, lon) {
    const phiK = toRad(KAABA_LAT)
    const lambdaK = toRad(KAABA_LON)
    const phi = toRad(lat)
    const lambda = toRad(lon)
    const deltaLambda = lambdaK - lambda

    const y = Math.sin(deltaLambda) * Math.cos(phiK)
    const x = Math.cos(phi) * Math.sin(phiK) - Math.sin(phi) * Math.cos(phiK) * Math.cos(deltaLambda)
    const bearing = toDeg(Math.atan2(y, x))
    return (bearing + 360) % 360
}

// iOS gives a ready-made true-north compass heading via webkitCompassHeading.
// Elsewhere, alpha increases counter-clockwise from the device's start
// orientation, so it's flipped to a clockwise-from-north heading.
function getCompassHeading(event) {
    if (typeof event.webkitCompassHeading === 'number' && !Number.isNaN(event.webkitCompassHeading)) {
        return event.webkitCompassHeading
    }
    if (typeof event.alpha === 'number' && !Number.isNaN(event.alpha)) {
        return (360 - event.alpha) % 360
    }
    return null
}

function angleDiff(a, b) {
    const diff = Math.abs(a - b) % 360
    return diff > 180 ? 360 - diff : diff
}

function QiblaCompass() {
    const [status, setStatus] = useState('idle') // idle | locating | listening | bearing-only | error
    const [error, setError] = useState('')
    const [qiblaBearing, setQiblaBearing] = useState(null)
    const [heading, setHeading] = useState(null)
    const lastUpdateRef = useRef(0)

    useEffect(() => {
        if (status !== 'listening') return
        const eventName = 'ondeviceorientationabsolute' in window ? 'deviceorientationabsolute' : 'deviceorientation'

        function handleOrientation(event) {
            const now = Date.now()
            if (now - lastUpdateRef.current < 50) return
            lastUpdateRef.current = now
            const h = getCompassHeading(event)
            if (h !== null) setHeading(h)
        }

        window.addEventListener(eventName, handleOrientation)
        return () => window.removeEventListener(eventName, handleOrientation)
    }, [status])

    function handleEnable() {
        setError('')
        setHeading(null)

        if (!navigator.geolocation) {
            setError('Your browser does not support location, which the compass needs to find the Qibla direction.')
            setStatus('error')
            return
        }

        setStatus('locating')

        navigator.geolocation.getCurrentPosition(
            async (pos) => {
                const bearing = calculateQiblaBearing(pos.coords.latitude, pos.coords.longitude)
                setQiblaBearing(bearing)

                const hasOrientation = typeof window.DeviceOrientationEvent !== 'undefined'
                if (!hasOrientation) {
                    setStatus('bearing-only')
                    return
                }

                try {
                    if (typeof window.DeviceOrientationEvent.requestPermission === 'function') {
                        const permission = await window.DeviceOrientationEvent.requestPermission()
                        if (permission !== 'granted') {
                            setError('Compass access was denied. Allow motion & orientation access in your browser settings to use the live needle.')
                            setStatus('bearing-only')
                            return
                        }
                    }
                    setStatus('listening')
                } catch {
                    setStatus('bearing-only')
                }
            },
            (err) => {
                setError(err.code === err.PERMISSION_DENIED
                    ? 'Location access was denied. The compass needs your location to find the Qibla direction.'
                    : 'Could not detect your location for the compass.')
                setStatus('error')
            },
            { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
        )
    }

    const kaabaScreenAngle = (qiblaBearing !== null && heading !== null)
        ? (qiblaBearing - heading + 360) % 360
        : null
    const northScreenAngle = heading !== null ? (360 - heading) % 360 : null
    const aligned = kaabaScreenAngle !== null && angleDiff(kaabaScreenAngle, 0) <= 5

    return (
        <div className="qibla-compass-card">
            <h3 className="qibla-title">🧭 Qibla Compass</h3>

            {status === 'idle' && (
                <>
                    <p className="qibla-hint">Uses your live location and device compass to point exactly toward the Kaaba.</p>
                    <button className="qibla-enable-btn" onClick={handleEnable}>Enable Compass</button>
                </>
            )}

            {status === 'locating' && <p className="qibla-hint">Finding your precise location…</p>}

            {status === 'error' && (
                <>
                    <p className="qibla-error">{error}</p>
                    <button className="qibla-enable-btn" onClick={handleEnable}>Try Again</button>
                </>
            )}

            {(status === 'listening' || status === 'bearing-only') && (
                <div className="qibla-result">
                    {status === 'listening' && (
                        <div className="qibla-dial">
                            <div className="qibla-fixed-pointer" />
                            {northScreenAngle !== null && (
                                <div className="qibla-rotor" style={{ transform: `rotate(${northScreenAngle}deg)` }}>
                                    <span className="qibla-n-marker">N</span>
                                </div>
                            )}
                            {kaabaScreenAngle !== null ? (
                                <div className="qibla-rotor" style={{ transform: `rotate(${kaabaScreenAngle}deg)` }}>
                                    <span className={`qibla-marker ${aligned ? 'aligned' : ''}`}>🕋</span>
                                </div>
                            ) : (
                                <p className="qibla-calibrating">Move your phone in a figure-8 to calibrate…</p>
                            )}
                            <div className="qibla-center-dot" />
                        </div>
                    )}

                    {status === 'listening' && aligned && <p className="qibla-aligned-msg">✓ Facing the Qibla</p>}

                    {error && <p className="qibla-error">{error}</p>}

                    {qiblaBearing !== null && (
                        <p className="qibla-degrees">Qibla is {Math.round(qiblaBearing)}° from true north</p>
                    )}

                    {status === 'bearing-only' && (
                        <p className="qibla-hint">
                            Face true north, then turn {Math.round(qiblaBearing)}° clockwise to face the Qibla.
                        </p>
                    )}
                </div>
            )}
        </div>
    )
}

export default QiblaCompass
