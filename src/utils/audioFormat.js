const PLAYABLE_AUDIO_EXTENSIONS = ['mp3', 'm4a', 'wav', 'ogg', 'oga', 'aac', 'flac', 'opus', 'weba']
const KNOWN_VIDEO_EXTENSIONS = ['mov', 'mp4', 'm4v', 'avi', 'mkv', 'webm', '3gp']

function extensionOf(url) {
    try {
        const path = new URL(url).pathname
        const match = path.match(/\.([a-z0-9]+)$/i)
        return match ? match[1].toLowerCase() : ''
    } catch {
        return ''
    }
}

// Browsers generally cannot play .mov/.mp4/etc through an <audio> element outside
// of Safari with specific codecs — a very common mistake is pasting a link to a
// phone voice-recording exported as .mov. Null = couldn't tell (no extension, e.g.
// a redirect/stream URL), true/false = a reasonably confident guess.
export function audioUrlWarning(url) {
    const ext = extensionOf(url)
    if (!ext) return null
    if (KNOWN_VIDEO_EXTENSIONS.includes(ext)) {
        return `الرابط ده امتداده .${ext}، وهو صيغة فيديو مش صوت — غالبًا مش هيشتغل في مشغل الصوت على أغلب الأجهزة. حوّل الملف لصيغة صوت زي mp3 أو m4a وارفعه تاني.`
    }
    if (!PLAYABLE_AUDIO_EXTENSIONS.includes(ext)) {
        return `الرابط ده امتداده .${ext}، وده مش من صيغ الصوت المعروفة (mp3, m4a, wav, ogg...) — ممكن ميشتغلش في كل الأجهزة.`
    }
    return null
}
