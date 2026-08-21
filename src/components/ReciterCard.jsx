import { Link } from 'react-router-dom'
import ReciterAvatar from './ReciterAvatar'
import './ReciterCard.css'

function ReciterCard({ reciter, linkTo }) {
    return (
        <Link to={linkTo} className="reciter-card">
            <ReciterAvatar reciter={reciter} />
            <h3>{reciter.name}</h3>
        </Link>
    )
}

export default ReciterCard