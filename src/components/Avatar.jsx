import { useState } from 'react'
import './Avatar.css'

function Avatar({ src, name, size = 90 }) {
    const [imgFailed, setImgFailed] = useState(!src)
    const firstLetter = name ? name.trim().charAt(0).toUpperCase() : '?'

    if (imgFailed || !src) {
        return (
            <div
                className="avatar-fallback"
                style={{ width: size, height: size, fontSize: size * 0.4 }}
            >
                {firstLetter}
            </div>
        )
    }

    return (
        <img
            src={src}
            alt={name}
            className="avatar-image"
            style={{ width: size, height: size }}
            onError={() => setImgFailed(true)}
        />
    )
}

export default Avatar
