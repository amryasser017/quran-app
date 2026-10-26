import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage'
import { storage } from '../firebase'

// Uploads a file to Firebase Storage under `folder/`, reporting 0-100 progress,
// and resolves with its public download URL. Used instead of pasting a link to
// a third-party host (catbox.moe etc.) — those are free/anonymous and
// unreliable: some links just stop working with no way for us to fix them.
export function uploadAudioFile(file, folder, onProgress) {
    const safeName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.\-_]/g, '_')}`
    const storageRef = ref(storage, `${folder}/${safeName}`)
    const task = uploadBytesResumable(storageRef, file)

    return new Promise((resolve, reject) => {
        task.on(
            'state_changed',
            (snapshot) => {
                if (onProgress && snapshot.totalBytes > 0) {
                    onProgress(Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100))
                }
            },
            reject,
            async () => {
                try {
                    const url = await getDownloadURL(task.snapshot.ref)
                    resolve(url)
                } catch (err) {
                    reject(err)
                }
            }
        )
    })
}
