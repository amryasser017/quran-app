import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { auth } from '../firebase'
import './Admin.css'

function AdminLogin() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate()

    async function handleSubmit(e) {
        e.preventDefault()
        setError('')
        setLoading(true)
        try {
            await signInWithEmailAndPassword(auth, email, password)
            navigate('/admin')
        } catch (err) {
            setError('البريد الإلكتروني أو كلمة المرور غير صحيحة.')
        }
        setLoading(false)
    }

    return (
        <section className="admin-login">
            <form className="admin-form" onSubmit={handleSubmit}>
                <h1>تسجيل دخول الإدارة</h1>
                <input
                    type="email"
                    placeholder="البريد الإلكتروني"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
                <input
                    type="password"
                    placeholder="كلمة المرور"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
                {error && <p className="admin-error">{error}</p>}
                <button type="submit" disabled={loading}>
                    {loading ? 'جارِ تسجيل الدخول...' : 'تسجيل الدخول'}
                </button>
            </form>
        </section>
    )
}

export default AdminLogin
