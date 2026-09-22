import { Link } from 'react-router-dom'
import './Landing.css'
function Landing() {
    return (
        <section className="landing">
            <h1 className="landing-title">القرآن الكريم</h1>
            <p className="landing-subtitle">استمع إلى القرآن الكريم، ولا تفوّت صلاة أبدًا</p>

            <div className="landing-cards">
                <Link to="/full-sowar" className="landing-card">
                    <span className="landing-card-icon">📖</span>
                    <h2>السور كاملة</h2>
                    <p>تلاوات كاملة للسور من العديد من القراء، من البداية إلى النهاية.</p>
                </Link>

                <Link to="/short-clips" className="landing-card">
                    <span className="landing-card-icon">✨</span>
                    <h2>مقاطع مختارة</h2>
                    <p>مقاطع قصيرة مختارة — آية أو لحظة معينة من التلاوة.</p>
                </Link>

                <Link to="/prayer-times" className="landing-card">
                    <span className="landing-card-icon">🕌</span>
                    <h2>مواقيت الصلاة</h2>
                    <p>مواقيت صلاة دقيقة لأي مدينة — تلقائيًا أو بالبحث.</p>
                </Link>

                <Link to="/azkar" className="landing-card">
                    <span className="landing-card-icon">📿</span>
                    <h2>أذكار الصباح والمساء</h2>
                    <p>أذكار الصباح والمساء — اقرأ أو استمع.</p>
                </Link>

                <Link to="/events" className="landing-card">
                    <span className="landing-card-icon">🌙</span>
                    <h2>المناسبات</h2>
                    <p>العد التنازلي لرمضان والعيدين ورأس السنة الهجرية.</p>
                </Link>

                <Link to="/asmaa-allah" className="landing-card">
                    <span className="landing-card-icon">🕋</span>
                    <h2>أسماء الله الحسنى</h2>
                    <p>أسماء الله الحسنى التسعة والتسعون، مع معنى كل اسم.</p>
                </Link>
            </div>
        </section>
    )
}

export default Landing
