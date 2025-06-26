import { Outlet } from 'react-router-dom'
import Header from './components/Header'
import './App.css'

function App() {
  return (
    <div className="app-container">
      <Header />
      <div className="content-container">
        <Outlet />
      </div>
    </div>
  )
}

export default App