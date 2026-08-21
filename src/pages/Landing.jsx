import { Link } from 'react-router-dom'
import './Landing.css'
function Landing() {
    return (
        <section className="landing">
            <h1 className="landing-title">Quran</h1>
            <p className="landing-subtitle">Choose how you want to listen</p>

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
            </div>
        </section>
    )
}

export default Landing
