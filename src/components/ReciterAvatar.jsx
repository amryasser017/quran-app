import Avatar from './Avatar'

function ReciterAvatar({ reciter, size }) {
    return <Avatar src={`/reciters/${reciter.id}.jpg`} name={reciter.name} size={size} />
}

export default ReciterAvatar
