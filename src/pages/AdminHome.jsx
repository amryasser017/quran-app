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
                <h1>Admin</h1>
                <button className="logout-btn" onClick={handleLogout}>Log Out</button>
            </div>

            <div className="admin-home-cards">
                <Link to="/admin/full-sowar" className="admin-home-card">
                    <span className="admin-home-card-icon">📖</span>
                    <h2>Control Full Sowar</h2>
                    <p>Add reciters, add or edit surah recordings, including for reciters already pulled from the API.</p>
                </Link>

                <Link to="/admin/short-parts" className="admin-home-card">
                    <span className="admin-home-card-icon">✨</span>
                    <h2>Control Short Parts</h2>
                    <p>Add reciters and short highlight clips for the Short Parts section.</p>
                </Link>
            </div>
        </section>
    )
}

export default AdminHome
