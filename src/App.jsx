import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Landing from './pages/Landing'
import Home from './pages/Home'
import ReciterPage from './pages/ReciterPage'
import FullSowarCustomReciterPage from './pages/FullSowarCustomReciterPage'
import ShortClipsHome from './pages/ShortClipsHome'
import ShortClipReciterPage from './pages/ShortClipReciterPage'
import PrayerTimes from './pages/PrayerTimes'
import Azkar from './pages/Azkar'
import AzkarRead from './pages/AzkarRead'
import AzkarListen from './pages/AzkarListen'
import Events from './pages/Events'
import AdminLogin from './pages/AdminLogin'
import AdminHome from './pages/AdminHome'
import AdminFullSowar from './pages/AdminFullSowar'
import AdminShortParts from './pages/AdminShortParts'
import ProtectedRoute from './components/ProtectedRoute'
import AsmaaAllahElHosnah from './pages/Asmaa_Allah_El-hosnah'
import Mushaf from './pages/Mushaf'
import './App.css'

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Landing />} />

                <Route path="/full-sowar" element={<Home />} />
                <Route path="/full-sowar/reciter/:id" element={<ReciterPage />} />
                <Route path="/full-sowar/custom/:id" element={<FullSowarCustomReciterPage />} />

                <Route path="/short-clips" element={<ShortClipsHome />} />
                <Route path="/short-clips/reciter/:id" element={<ShortClipReciterPage />} />

                <Route path="/prayer-times" element={<PrayerTimes />} />

                <Route path="/azkar" element={<Azkar />} />
                <Route path="/azkar/read" element={<AzkarRead />} />
                <Route path="/azkar/listen" element={<AzkarListen />} />

                <Route path="/events" element={<Events />} />

                <Route path="/asmaa-allah" element={<AsmaaAllahElHosnah />} />

                <Route path="/mushaf" element={<Mushaf />} />

                <Route path="/admin/login" element={<AdminLogin />} />
                <Route
                    path="/admin"
                    element={
                        <ProtectedRoute>
                            <AdminHome />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/admin/full-sowar"
                    element={
                        <ProtectedRoute>
                            <AdminFullSowar />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/admin/short-parts"
                    element={
                        <ProtectedRoute>
                            <AdminShortParts />
                        </ProtectedRoute>
                    }
                />

                <Route path="*" element={<p className="status-text">Page not found.</p>} />
            </Routes>
        </BrowserRouter>
    )
}

export default App
