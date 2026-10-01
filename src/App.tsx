import './App.css'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'

import { ProtectedRoute } from './components/auth/ProtectedRoute'
import { PublicRoute } from './components/auth/PublicRoute'
import Game from './pages/Game'
import Games from './pages/Games'
import Home from './pages/Home'
import Login from './pages/Login'
import Profile from './pages/Profile'
import Register from './pages/Register'

function App() {
  return (
    <div className='min-h-screen w-full bg-midnight'>
      <BrowserRouter>
        <Routes>
          <Route element={<PublicRoute />}>
            <Route path='/' element={<Navigate to='/login' replace />} />
            <Route path='/login' element={<Login />} />
            <Route path='/register' element={<Register />} />
          </Route>

          <Route element={<ProtectedRoute />}>
            <Route path='/app/home' element={<Home />} />
            <Route path='/app/games' element={<Games />} />
            <Route path='/app/games/:id' element={<Game />} />
            <Route path='/app/profile' element={<Profile />} />
            <Route path='/app/game/:id' element={<Game />} />
          </Route>

          <Route path='/game/:id' element={<ProtectedRoute />}>
            <Route index element={<Game />} />
          </Route>

          <Route path='*' element={<Navigate to='/login' replace />} />
        </Routes>
      </BrowserRouter>
    </div>
  )
}

export default App
