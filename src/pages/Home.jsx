import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { collection, getDocs, orderBy, query } from 'firebase/firestore'
import { getReciters } from '../api'
import { db } from '../firebase'
import ReciterCard from '../components/ReciterCard'
import Avatar from '../components/Avatar'
import './Home.css'

function Home() {
    const [apiReciters, setApiReciters] = useState([])
    const [customReciters, setCustomReciters] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')

    useEffect(() => {
        async function load() {
            const apiData = await getReciters()
            setApiReciters(apiData)
            setLoading(false)

            try {
                const customSnap = await getDocs(query(collection(db, 'fullSowarReciters'), orderBy('name')))
                setCustomReciters(customSnap.docs.map(d => ({ id: d.id, ...d.data() })))
            } catch (err) {
                console.error('Could not load custom reciters:', err)
            }
        }
        load()
    }, [])

    const filteredApi = apiReciters.filter(reciter =>
        reciter.name.toLowerCase().includes(searchTerm.trim().toLowerCase())
    )
    const filteredCustom = customReciters.filter(reciter =>
        reciter.name.toLowerCase().includes(searchTerm.trim().toLowerCase())
    )

    if (loading) return <p className="status-text">Loading reciters...</p>

    const totalResults = filteredApi.length + filteredCustom.length

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

            {totalResults === 0 ? (
                <p className="status-text">No reciters match "{searchTerm}".</p>
            ) : (
                <div className="reciters-grid">
                    {filteredCustom.map(reciter => (
                        <Link key={`custom-${reciter.id}`} to={`/full-sowar/custom/${reciter.id}`} className="reciter-card">
                            <Avatar src={reciter.imageUrl} name={reciter.name} />
                            <h3>{reciter.name}</h3>
                        </Link>
                    ))}
                    {filteredApi.map(reciter => (
                        <ReciterCard
                            key={`api-${reciter.id}`}
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
