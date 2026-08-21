import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getReciters } from '../api'
import ReciterCard from '../components/ReciterCard'
import './Home.css'

function Home() {
    const [reciters, setReciters] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')

    useEffect(() => {
        getReciters().then(data => {
            setReciters(data)
            setLoading(false)
        })
    }, [])

    const filteredReciters = reciters.filter(reciter =>
        reciter.name.toLowerCase().includes(searchTerm.trim().toLowerCase())
    )

    if (loading) return <p className="status-text">Loading reciters...</p>

    return (
        <section className="home">
            <Link to="/" className="back-link">&larr; Back</Link>
            <h1 className="page-title">Full Sowar</h1>
            <p className="page-subtitle">Complete recitations, start to finish</p>

            <input
                type="text"
                className="search-input"
                placeholder="Search by reciter name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />

            {filteredReciters.length === 0 ? (
                <p className="status-text">No reciters match "{searchTerm}".</p>
            ) : (
                <div className="reciters-grid">
                    {filteredReciters.map(reciter => (
                        <ReciterCard
                            key={reciter.id}
                            reciter={reciter}
                            linkTo={`/full-sowar/reciter/${reciter.id}`}
                        />
                    ))}
                </div>
            )}
        </section>
    )
}

export default Home
