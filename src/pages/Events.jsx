import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import islamicEvents from '../data/islamicEvents'
import { getCurrentHijriDate, hijriToGregorian } from '../api'
import './Events.css'

function startOfDay(d) {
    return new Date(d.getFullYear(), d.getMonth(), d.getDate())
}

function daysBetween(a, b) {
    const MS_PER_DAY = 24 * 60 * 60 * 1000
    return Math.round((startOfDay(b) - startOfDay(a)) / MS_PER_DAY)
}

function Events() {
    const [results, setResults] = useState(null)
    const [error, setError] = useState('')

    useEffect(() => {
        async function load() {
            try {
                const todayHijri = await getCurrentHijriDate()
                const today = new Date()

                const computed = await Promise.all(islamicEvents.map(async (evt) => {
                    let eventDate = await hijriToGregorian(evt.hijriDay, evt.hijriMonth, todayHijri.year)
                    if (startOfDay(eventDate) < startOfDay(today)) {
                        eventDate = await hijriToGregorian(evt.hijriDay, evt.hijriMonth, todayHijri.year + 1)
                    }
                    return { ...evt, daysLeft: daysBetween(today, eventDate) }
                }))

                setResults(computed)
            } catch (err) {
                setError(err.message || 'حدث خطأ أثناء حساب المواعيد.')
            }
        }
        load()
    }, [])

    return (
        <section className="events-page">
            <Link to="/" className="back-link">&larr; Back</Link>
            <h1 className="page-title">Events</h1>
            <p className="page-subtitle" dir="rtl">المناسبات الإسلامية القادمة</p>

            {error && <p className="events-error" dir="rtl">{error}</p>}
            {!results && !error && <p className="status-text" dir="rtl">جارِ الحساب...</p>}

            {results && (
                <div className="events-grid">
                    {results.map(evt => (
                        <div key={evt.id} className="event-card">
                            <h2 dir="rtl">{evt.nameAr}</h2>
                            <p className="event-days">{evt.daysLeft}</p>
                            <span className="event-days-label" dir="rtl">يوم متبقي</span>
                        </div>
                    ))}
                </div>
            )}
        </section>
    )
}

export default Events
