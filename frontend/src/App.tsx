import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import './App.css'
import HammerMoleGame from './islands/hammer/HammerMoleGame'
import FlappyGame from './islands/flappy/FlappyGame'

function App() {
  return (
    <Router>
      <Routes>

        <Route path="/" />


        <Route path="/hammermole" element={<HammerMoleGame />} />
        <Route path="/flappybird" element={<FlappyGame />} />
      </Routes>
    </Router>
  )
}

export default App
