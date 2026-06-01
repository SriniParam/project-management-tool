import { Routes, Route } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import Board from './pages/Board'
import Navbar from './components/Navbar'

function App() {
  return (
    <div>
      <Navbar />

      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/board/:id" element={<Board />} />
      </Routes>
    </div>
  )
}

export default App