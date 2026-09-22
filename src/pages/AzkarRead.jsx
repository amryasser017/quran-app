import { useState } from 'react'
import { Link } from 'react-router-dom'
import azkar from '../data/azkar'
import './Azkar.css'

function buildRemaining(items) {
    const obj = {}
    items.forEach(item => { obj[item.id] = item.count })
    return obj
}

function AzkarRead() {
    const [period, setPeriod] = useState('morning')
    const items = azkar[period]
    const [remaining, setRemaining] = useState(() => buildRemaining(items))

    function handlePeriodChange(next) {
        setPeriod(next)
        setRemaining(buildRemaining(azkar[next]))
    }

    function handleTap(item) {
        setRemaining(prev => {
            const current = prev[item.id] ?? item.count
            if (current <= 0) return prev
            return { ...prev, [item.id]: current - 1 }
        })
    }

    function handleReset() {
        setRemaining(buildRemaining(items))
    }

    return (
        <section className="azkar-page" dir="rtl">
            <Link to="/azkar" className="back-link">&rarr; رجوع</Link>
            <h1 className="page-title">اقرأ الأذكار</h1>
            <p className="page-subtitle">اضغط على الذكر لتسجيل كل مرة تقرأه</p>

            <div className="azkar-toggle">
                <button
                    className={period === 'morning' ? 'active' : ''}
                    onClick={() => handlePeriodChange('morning')}
                >
                    أذكار الصباح
                </button>
                <button
                    className={period === 'evening' ? 'active' : ''}
                    onClick={() => handlePeriodChange('evening')}
                >
                    أذكار المساء
                </button>
            </div>

            <button className="azkar-reset-btn" onClick={handleReset}>إعادة العدّ</button>

            <div className="azkar-list">
                {items.map(item => {
                    const left = remaining[item.id] ?? item.count
                    const done = left <= 0
                    return (
                        <button
                            key={item.id}
                            className={`azkar-card ${done ? 'done' : ''}`}
                            onClick={() => handleTap(item)}
                        >
                            <p className="azkar-text">{item.text}</p>
                            {item.reference && <p className="azkar-reference">{item.reference}</p>}
                            {item.benefit && <p className="azkar-benefit">{item.benefit}</p>}
                            <span className="azkar-count-badge">
                                {done ? '✓ تم' : `متبقي ${left} من ${item.count}`}
                            </span>
                        </button>
                    )
                })}
            </div>
        </section>
    )
}

export default AzkarRead
