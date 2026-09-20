import { Link } from 'react-router-dom'
import './Landing.css'
function Landing() {
    return (
        <section className="landing">
            <h1 className="landing-title">Quran</h1>
            <p className="landing-subtitle">Listen to the Quran, and never miss a prayer</p>

            <div className="landing-cards">
                <Link to="/full-sowar" className="landing-card">
                    <span className="landing-card-icon">📖</span>
                    <h2>Full Sowar</h2>
                    <p>Complete surah recitations from many reciters, start to finish.</p>
                </Link>

                <Link to="/short-clips" className="landing-card">
                    <span className="landing-card-icon">✨</span>
                    <h2>Short Parts</h2>
                    <p>Short, chosen highlights — a specific ayah or moment from a recitation.</p>
                </Link>

                <Link to="/prayer-times" className="landing-card">
                    <span className="landing-card-icon">🕌</span>
                    <h2>Prayer Times</h2>
                    <p>Accurate prayer times for any city — auto-detected or searched.</p>
                </Link>

                <Link to="/azkar" className="landing-card">
                    <span className="landing-card-icon">📿</span>
                    <h2>Azkar Al-Sabah wa Al-Masaa</h2>
                    <p>Morning and evening remembrances — read or listen, in Arabic.</p>
                </Link>

                <Link to="/events" className="landing-card">
                    <span className="landing-card-icon">🌙</span>
                    <h2>Events</h2>
                    <p>Countdown to Ramadan, Eid, Mawlid, and the Islamic New Year.</p>
                </Link>

                <Link to="/asmaa-allah" className="landing-card">
                    <span className="landing-card-icon">🕋</span>
                    <h2>أسماء الله الحسنى</h2>
                    <p>The 99 Names of Allah, each with its meaning.</p>
                </Link>
            </div>
        </section>
    )
}

export default Landing
