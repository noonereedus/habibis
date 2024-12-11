import logo from './logo.svg';
import './App.css';
import './styles.css';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import SharedOrder from './pages/SharedOrder';
import MainPage from './pages/mainPage';
import Shopping from './pages/shopping';

function App() {
  return (
    <Router>
      <nav>
        <Link to="/MainPage">Home</Link>
        <Link to="/SharedOrder">SharedOrder</Link>
        <Link to="/Shopping">Shop</Link>
      </nav>
      <Routes>
        <Route path="/MainPage" element={<MainPage />} />
        <Route path="/SharedOrder" element={<SharedOrder />} />
        <Route path="/Shopping" element={<shopping />} />
      </Routes>
    </Router>
  );
}

export default App;
