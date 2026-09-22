import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import mushafSurahPages from '../data/mushafSurahPages'
import mushafJuzPages from '../data/mushafJuzPages'
import khatmDua from '../data/khatmDua'
import './Mushaf.css'

const TOTAL_PAGES = 604
// Classic bright Mushaf page — black ink on a cream page, matching the
// standard printed Madani Mushaf look.
const IMAGE_BASE = 'https://cdn.jsdelivr.net/gh/SakinaDevGroup/mushaf-madani-cdn@main/light'
const LAST_PAGE_KEY = 'mushafLastPage'
const BOOKMARK_KEY = 'mushafBookmark'
const TAP_THRESHOLD = 8
const SWIPE_THRESHOLD = 50
const QUARTER_LABELS = ['الربع الأول', 'الربع الثاني', 'الربع الثالث', 'الربع الرابع']

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

function JuzIcon() {
    return (
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="12" cy="12" r="8.5" />
            <path d="M12 3.5V12l6 6" />
        </svg>
    )
}

function IndexIcon() {
    return (
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
            <path d="M4 6h16M4 12h16M4 18h10" />
        </svg>
    )
}

function BookmarkIcon({ filled }) {
    return (
        <svg width="16" height="17" viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" aria-hidden="true">
            <path d="M6 3.5h12v17l-6-4.2-6 4.2v-17Z" />
        </svg>
    )
}

function PagesIcon() {
    return (
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <rect x="6" y="3.5" width="13" height="17" rx="1.5" />
            <path d="M9.5 8h6M9.5 12h6M9.5 16h4" />
        </svg>
    )
}

function DuaIcon() {
    return (
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M6 21c0-4 1-7 2-9M18 21c0-4-1-7-2-9" />
            <path d="M8 12c0-4 1.2-8 2.2-9.5a1 1 0 0 1 1.8.6V11M16 12c0-4-1.2-8-2.2-9.5a1 1 0 0 0-1.8.6" />
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

function findIndexForPage(list, page) {
    let idx = 0
    for (let i = 0; i < list.length; i++) {
        if (list[i].page <= page) idx = i
        else break
    }
    return idx
}

function hizbInfoForPage(page) {
    const juzIndex = findIndexForPage(mushafJuzPages, page)
    const juz = mushafJuzPages[juzIndex]
    const nextJuz = mushafJuzPages[juzIndex + 1]
    const juzStart = juz.page
    const juzEnd = nextJuz ? nextJuz.page - 1 : TOTAL_PAGES
    const span = Math.max(1, juzEnd - juzStart + 1)
    const quarterIdx = Math.min(7, Math.floor(((page - juzStart) / span) * 8))
    return {
        hizbNumber: (juz.id - 1) * 2 + Math.floor(quarterIdx / 4) + 1,
        quarterLabel: QUARTER_LABELS[quarterIdx % 4]
    }
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
    const hizbInfo = useMemo(() => hizbInfoForPage(page), [page])

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
                {bookmark === page && <span className="mushaf-ribbon" aria-hidden="true" />}
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
                <>
                    <div className="mushaf-hizb-badge">
                        {hizbInfo.quarterLabel} — الحزب {hizbInfo.hizbNumber}
                    </div>
                    <div className="mushaf-bottombar">
                        <div className="mushaf-toolbar-row">
                            <button onClick={() => setPanel('juz')}>
                                <JuzIcon /><span>الأجزاء</span>
                            </button>
                            <button onClick={() => setPanel('index')}>
                                <IndexIcon /><span>الفهرس</span>
                            </button>
                            <button onClick={handleSaveBookmark}>
                                <BookmarkIcon filled /><span>{savedFlash ? 'تم الحفظ ✓' : 'حفظ علامة'}</span>
                            </button>
                        </div>
                        <div className="mushaf-toolbar-row">
                            <button onClick={() => setPanel('khatm')}>
                                <DuaIcon /><span>دعاء الختم</span>
                            </button>
                            <button onClick={() => setPanel('pages')}>
                                <PagesIcon /><span>الصفحات</span>
                            </button>
                            <button onClick={handleGoBookmark} disabled={!bookmark}>
                                <BookmarkIcon /><span>انتقال للعلامة</span>
                            </button>
                        </div>
                    </div>
                </>
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
