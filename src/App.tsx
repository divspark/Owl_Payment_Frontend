import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Navbar } from './components/Navbar'
import { ProductsPage } from './pages/ProductsPage'
import { SuccessPage } from './pages/SuccessPage'
import './index.css'

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<ProductsPage />} />
          <Route path="/success" element={<SuccessPage />} />
        </Routes>
      </main>
    </BrowserRouter>
  )
}

export default App
