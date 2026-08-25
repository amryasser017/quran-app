import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Landing from './pages/Landing'
import Home from './pages/Home'
import ReciterPage from './pages/ReciterPage'
import FullSowarCustomReciterPage from './pages/FullSowarCustomReciterPage'
import ShortClipsHome from './pages/ShortClipsHome'
import ShortClipReciterPage from './pages/ShortClipReciterPage'
import AdminLogin from './pages/AdminLogin'
import AdminHome from './pages/AdminHome'
import AdminFullSowar from './pages/AdminFullSowar'
import AdminShortParts from './pages/AdminShortParts'
import ProtectedRoute from './components/ProtectedRoute'
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
