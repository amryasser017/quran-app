import { Link } from 'react-router-dom'
import { useNavigate } from 'react-router-dom'
import { signOut } from 'firebase/auth'
import { auth } from '../firebase'
import './Admin.css'

function AdminHome() {
    const navigate = useNavigate()

    async function handleLogout() {
        await signOut(auth)
        navigate('/admin/login')
    }

    return (
        <section className="admin-home">
            <div className="admin-top">
                <h1>الإدارة</h1>
                <button className="logout-btn" onClick={handleLogout}>تسجيل الخروج</button>
            </div>

            <div className="admin-home-cards">
                <Link to="/admin/full-sowar" className="admin-home-card">
                    <span className="admin-home-card-icon">📖</span>
                    <h2>إدارة السور كاملة</h2>
                    <p>أضف قراء، وأضف أو عدّل تسجيلات السور، حتى للقراء المسحوبين من الواجهة البرمجية مسبقًا.</p>
                </Link>

                <Link to="/admin/short-parts" className="admin-home-card">
                    <span className="admin-home-card-icon">✨</span>
                    <h2>إدارة المقاطع المختارة</h2>
                    <p>أضف قراء ومقاطع مختارة قصيرة لقسم المقاطع المختارة.</p>
                </Link>
            </div>
        </section>
    )
}

export default AdminHome
