import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { BlogList } from './components/BlogList'
import { BlogPost } from './components/BlogPost'
import './App.css'

function App() {
  return (
    <BrowserRouter>
      <div className="app">
        <Routes>
          <Route path="/" element={<BlogList />} />
          <Route path="/post/:id" element={<BlogPost />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}

export default App
