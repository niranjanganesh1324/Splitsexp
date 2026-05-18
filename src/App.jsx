import React, { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Header from './components/Header'
import Footer from './components/Footer'
import Landing from './pages/Landing'
import Dashboard from './pages/Dashboard'
import ScanSplit from './pages/ScanSplit'
import History from './pages/History'
import GroupManagement from './pages/GroupManagement'
import SettleBalances from './pages/SettleBalances'

function App() {
  const [currentUser, setCurrentUser] = useState(null)

  useEffect(() => {
    // Check local storage for existing session
    const savedUser = localStorage.getItem('splitexp_user')
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser))
    }
  }, [])

  const handleLoginSuccess = (user) => {
    setCurrentUser(user)
    localStorage.setItem('splitexp_user', JSON.stringify(user))
  }

  const handleLogout = () => {
    setCurrentUser(null)
    localStorage.removeItem('splitexp_user')
  }

  return (
    <Router>
      <div className="bg-background text-on-background min-h-screen flex flex-col font-body-md overflow-x-hidden">
        <Header user={currentUser} onLogout={handleLogout} />
        
        <Routes>
          <Route path="/" element={
            !currentUser ? <Landing onLoginSuccess={handleLoginSuccess} /> : <Navigate to="/dashboard" />
          } />
          <Route path="/dashboard" element={
            currentUser ? <Dashboard user={currentUser} /> : <Navigate to="/" />
          } />
          <Route path="/scan" element={
            currentUser ? <ScanSplit user={currentUser} /> : <Navigate to="/" />
          } />
          <Route path="/history" element={
            currentUser ? <History user={currentUser} /> : <Navigate to="/" />
          } />
          <Route path="/groups" element={
            currentUser ? <GroupManagement user={currentUser} /> : <Navigate to="/" />
          } />
          <Route path="/settle" element={
            currentUser ? <SettleBalances user={currentUser} /> : <Navigate to="/" />
          } />
          {/* Add more routes later */}
        </Routes>
        
        <Footer />
      </div>
    </Router>
  )
}

export default App
