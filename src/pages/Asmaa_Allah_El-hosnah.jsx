import { Link } from 'react-router-dom'
import names99 from '../data/names99'
import './AsmaaAllah.css'

function Asmaa_Allah_El_hosnah() {
    return (
        <section className="asmaa-page">
            <Link to="/" className="back-link">&larr; Back</Link>
            <h1 className="page-title">الله</h1>
            <p className="page-subtitle" dir="rtl">اسماء الله الحسني</p>

            <div className="asmaa-grid">
                {names99.map(name => (
                    <div key={name.id} className="asmaa-card">
                        <span className="asmaa-id">{name.id}</span>
                        <h2 dir="rtl">{name.nameAr}</h2>
                        <p className="asmaa-meaning" dir="rtl">{name.meaning}</p>
                    </div>
                ))}
            </div>
        </section>
    )
}

export default Asmaa_Allah_El_hosnah
