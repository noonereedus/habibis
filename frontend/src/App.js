import logo from './logo.svg';
import './App.css';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import basket from './pages/basket';
import mainPage from './pages/mainPage';
import shopping from './pages/shopping';

function App() {
  return (
    <Router>
      <nav>
        <Link to="/">Home</Link>
        <Link to="/basket">Basket</Link>
        <Link to="/contact">Shop</Link>
      </nav>
      <Routes>
        <Route path="/" element={<mainPage />} />
        <Route path="/basket" element={<basket />} />
        <Route path="/shopping" element={<shopping />} />
      </Routes>
    </Router>
  );
}

export default App;
