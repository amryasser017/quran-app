import { useEffect, useState } from 'react'
import { getAzkarFromApi } from '../api'
import staticAzkar from '../data/azkar'

// Tries to fetch morning/evening azkar live from a real third-party API
// (api.islamic.app). Each period falls back independently to the bundled,
// hand-verified static list if its fetch fails or returns something we
// can't parse, so a flaky API never breaks the page.
function useAzkarData() {
    const [data, setData] = useState({ morning: staticAzkar.morning, evening: staticAzkar.evening })
    const [source, setSource] = useState({ morning: 'static', evening: 'static' })

    useEffect(() => {
        let cancelled = false
        for (const period of ['morning', 'evening']) {
            getAzkarFromApi(period)
                .then(items => {
                    if (cancelled) return
                    setData(prev => ({ ...prev, [period]: items }))
                    setSource(prev => ({ ...prev, [period]: 'api' }))
                })
                .catch(() => { /* keep the static fallback already in state */ })
        }
        return () => { cancelled = true }
    }, [])

    return { data, source }
}

export default useAzkarData
