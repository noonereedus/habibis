// import logo from './logo.svg';
import './App.css';
import './styles.css';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import SharedOrder from './pages/SharedOrder';
// import mainPage from './pages/mainPage';
// import shopping from './pages/shopping';

function App() {
  return (
    <Router>
      <nav>
        <Link to="/">Home</Link>
        <Link to="/SharedOrder">SharedOrder</Link>
        <Link to="/shopping">Shop</Link>
      </nav>
      <Routes>
        <Route path="/" element={<mainPage />} />
        <Route path="/SharedOrder" element={<SharedOrder />} />
        <Route path="/shopping" element={<shopping />} />
      </Routes>
    </Router>
  );
}

export default App;
