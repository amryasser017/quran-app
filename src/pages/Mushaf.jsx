import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import mushafSurahPages from '../data/mushafSurahPages'
import mushafJuzPages from '../data/mushafJuzPages'
import khatmDua from '../data/khatmDua'
import './Mushaf.css'

const TOTAL_PAGES = 604
// Dark theme (white text on a dark page) reads far more comfortably than a
// bright white page against this app's midnight UI, especially at night.
const IMAGE_BASE = 'https://cdn.jsdelivr.net/gh/SakinaDevGroup/mushaf-madani-cdn@main/dark'
const LAST_PAGE_KEY = 'mushafLastPage'
const BOOKMARK_KEY = 'mushafBookmark'
const TAP_THRESHOLD = 8
const SWIPE_THRESHOLD = 50

const PANEL_TITLES = {
    juz: 'الأجزاء',
    index: 'الفهرس',
    pages: 'الصفحات',
    khatm: 'دعاء الختم'
}

function pageImageUrl(page) {
    return `${IMAGE_BASE}/p${page}.png`
}

function FullscreenIcon({ active }) {
    return active ? (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M9 3H5a2 2 0 0 0-2 2v4M15 3h4a2 2 0 0 1 2 2v4M9 21H5a2 2 0 0 1-2-2v-4M15 21h4a2 2 0 0 0 2-2v-4" />
        </svg>
    ) : (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M3 9V5a2 2 0 0 1 2-2h4M21 9V5a2 2 0 0 0-2-2h-4M3 15v4a2 2 0 0 0 2 2h4M21 15v4a2 2 0 0 1-2 2h-4" />
        </svg>
    )
}

function findForPage(list, page) {
    let current = list[0]
    for (const entry of list) {
        if (entry.page <= page) current = entry
        else break
    }
    return current
}

function loadStoredPage(key, fallback) {
    try {
        const raw = localStorage.getItem(key)
        const n = raw ? Number(raw) : NaN
        return Number.isInteger(n) && n >= 1 && n <= TOTAL_PAGES ? n : fallback
    } catch {
        return fallback
    }
}

function Mushaf() {
    const [page, setPage] = useState(() => loadStoredPage(LAST_PAGE_KEY, 1))
    const [bookmark, setBookmark] = useState(() => loadStoredPage(BOOKMARK_KEY, null))
    const [showOverlay, setShowOverlay] = useState(true)
    const [panel, setPanel] = useState(null)
    const [savedFlash, setSavedFlash] = useState(false)
    const [imgError, setImgError] = useState(false)
    const [pageInput, setPageInput] = useState('')
    const [isFullscreen, setIsFullscreen] = useState(false)
    const pointerStart = useRef(null)

    useEffect(() => {
        function handleFullscreenChange() {
            setIsFullscreen(Boolean(document.fullscreenElement))
        }
        document.addEventListener('fullscreenchange', handleFullscreenChange)
        return () => document.removeEventListener('fullscreenchange', handleFullscreenChange)
    }, [])

    function toggleFullscreen() {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen?.().catch(() => {})
        } else {
            document.exitFullscreen?.().catch(() => {})
        }
    }

    const surah = useMemo(() => findForPage(mushafSurahPages, page), [page])
    const juz = useMemo(() => findForPage(mushafJuzPages, page), [page])

    useEffect(() => {
        try { localStorage.setItem(LAST_PAGE_KEY, String(page)) } catch { /* ignore */ }
        setImgError(false)
    }, [page])

    useEffect(() => {
        [page - 1, page + 1].forEach(p => {
            if (p >= 1 && p <= TOTAL_PAGES) {
                const img = new Image()
                img.src = pageImageUrl(p)
            }
        })
    }, [page])

    const goTo = useCallback((p) => {
        setPage(Math.min(TOTAL_PAGES, Math.max(1, p)))
    }, [])

    const next = useCallback(() => goTo(page + 1), [page, goTo])
    const prev = useCallback(() => goTo(page - 1), [page, goTo])

    useEffect(() => {
        function handleKey(e) {
            if (panel) return
            if (e.key === 'ArrowRight') next()
            else if (e.key === 'ArrowLeft') prev()
        }
        window.addEventListener('keydown', handleKey)
        return () => window.removeEventListener('keydown', handleKey)
    }, [next, prev, panel])

    function handlePointerDown(e) {
        pointerStart.current = { x: e.clientX, y: e.clientY }
    }

    function handlePointerUp(e) {
        const start = pointerStart.current
        pointerStart.current = null
        if (!start) return
        const dx = e.clientX - start.x
        const dy = e.clientY - start.y
        if (Math.abs(dx) > SWIPE_THRESHOLD && Math.abs(dx) > Math.abs(dy)) {
            if (dx > 0) next()
            else prev()
        } else if (Math.abs(dx) < TAP_THRESHOLD && Math.abs(dy) < TAP_THRESHOLD) {
            setShowOverlay(o => !o)
        }
    }

    function handleSaveBookmark() {
        setBookmark(page)
        try { localStorage.setItem(BOOKMARK_KEY, String(page)) } catch { /* ignore */ }
        setSavedFlash(true)
        setTimeout(() => setSavedFlash(false), 1500)
    }

    function handleGoBookmark() {
        if (!bookmark) return
        goTo(bookmark)
        setPanel(null)
    }

    function jumpTo(p) {
        goTo(p)
        setPanel(null)
    }

    function handlePageInputSubmit(e) {
        e.preventDefault()
        const n = Number(pageInput)
        if (Number.isInteger(n) && n >= 1 && n <= TOTAL_PAGES) {
            jumpTo(n)
            setPageInput('')
        }
    }

    return (
        <div className="mushaf-page">
            {showOverlay && (
                <div className="mushaf-topbar">
                    <Link to="/" className="mushaf-back" aria-label="رجوع">&rarr;</Link>
                    <span className="mushaf-juz">{juz.nameAr}</span>
                    <span className="mushaf-pagenum">{page}</span>
                    <span className="mushaf-surah">سورة {surah.nameAr}</span>
                    <button
                        className="mushaf-fullscreen-btn"
                        onClick={toggleFullscreen}
                        aria-label={isFullscreen ? 'إنهاء ملء الشاشة' : 'ملء الشاشة'}
                        title={isFullscreen ? 'إنهاء ملء الشاشة' : 'ملء الشاشة'}
                    >
                        <FullscreenIcon active={isFullscreen} />
                    </button>
                </div>
            )}

            <div
                className="mushaf-viewer"
                onPointerDown={handlePointerDown}
                onPointerUp={handlePointerUp}
                onPointerCancel={() => { pointerStart.current = null }}
            >
                {imgError ? (
                    <div className="mushaf-error">
                        <p>تعذر تحميل هذه الصفحة.</p>
                        <button onClick={(e) => { e.stopPropagation(); setImgError(false) }}>إعادة المحاولة</button>
                    </div>
                ) : (
                    <img
                        key={page}
                        src={pageImageUrl(page)}
                        alt={`صفحة ${page}`}
                        className="mushaf-image"
                        draggable={false}
                        onError={() => setImgError(true)}
                    />
                )}
            </div>

            {showOverlay && (
                <div className="mushaf-bottombar">
                    <div className="mushaf-toolbar-row">
                        <button onClick={() => setPanel('juz')}>الأجزاء</button>
                        <button onClick={() => setPanel('index')}>الفهرس</button>
                        <button onClick={handleSaveBookmark}>{savedFlash ? 'تم الحفظ ✓' : 'حفظ علامة'}</button>
                    </div>
                    <div className="mushaf-toolbar-row">
                        <button onClick={() => setPanel('khatm')}>دعاء الختم</button>
                        <button onClick={() => setPanel('pages')}>الصفحات</button>
                        <button onClick={handleGoBookmark} disabled={!bookmark}>انتقال للعلامة</button>
                    </div>
                </div>
            )}

            {panel && (
                <div className="mushaf-panel-backdrop" onClick={() => setPanel(null)}>
                    <div className="mushaf-panel" onClick={(e) => e.stopPropagation()}>
                        <div className="mushaf-panel-header">
                            <h3>{PANEL_TITLES[panel]}</h3>
                            <button className="mushaf-panel-close" onClick={() => setPanel(null)} aria-label="إغلاق">&times;</button>
                        </div>
                        <div className="mushaf-panel-body">
                            {panel === 'index' && (
                                <ul className="mushaf-list">
                                    {mushafSurahPages.map(s => (
                                        <li key={s.id}>
                                            <button onClick={() => jumpTo(s.page)}>
                                                <span>{s.nameAr}</span>
                                                <span className="mushaf-list-page">{s.page}</span>
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            )}
                            {panel === 'juz' && (
                                <ul className="mushaf-list">
                                    {mushafJuzPages.map(j => (
                                        <li key={j.id}>
                                            <button onClick={() => jumpTo(j.page)}>
                                                <span>{j.nameAr}</span>
                                                <span className="mushaf-list-page">{j.page}</span>
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            )}
                            {panel === 'pages' && (
                                <>
                                    <form className="mushaf-page-jump-form" onSubmit={handlePageInputSubmit}>
                                        <input
                                            type="number"
                                            min="1"
                                            max={TOTAL_PAGES}
                                            placeholder="رقم الصفحة (1-604)"
                                            value={pageInput}
                                            onChange={(e) => setPageInput(e.target.value)}
                                        />
                                        <button type="submit">اذهب</button>
                                    </form>
                                    <div className="mushaf-page-grid">
                                        {Array.from({ length: TOTAL_PAGES }, (_, i) => i + 1).map(p => (
                                            <button
                                                key={p}
                                                className={`mushaf-page-grid-btn ${p === page ? 'current' : ''}`}
                                                onClick={() => jumpTo(p)}
                                            >
                                                {p}
                                            </button>
                                        ))}
                                    </div>
                                </>
                            )}
                            {panel === 'khatm' && (
                                <p className="mushaf-dua-text">{khatmDua}</p>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default Mushaf
