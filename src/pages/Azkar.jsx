import { Link } from 'react-router-dom'
import './Azkar.css'

function Azkar() {
    return (
        <section className="azkar-page" dir="rtl">
            <Link to="/" className="back-link">رجوع</Link>
            <h1 className="page-title">أذكار الصباح والمساء</h1>
            <p className="page-subtitle">اختر كيف تريد الذكر</p>

            <div className="azkar-hub-cards">
                <Link to="/azkar/read" className="azkar-hub-card">
                    <span className="azkar-hub-card-icon">📖</span>
                    <h2>اقرأ</h2>
                    <p>تصفح الأذكار مكتوبة مع عدد مرات التكرار.</p>
                </Link>

                <Link to="/azkar/listen" className="azkar-hub-card">
                    <span className="azkar-hub-card-icon">🎧</span>
                    <h2>استمع</h2>
                    <p>استمع إلى الأذكار بصوت مقروء تلقائيًا.</p>
                </Link>
            </div>
        </section>
    )
}

export default Azkar
