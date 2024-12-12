//import logo from './logo.svg';
import './App.css';
import './styles.css';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import SharedOrder from './pages/SharedOrder';
import MainPage from './pages/mainPage';
//import Shopping from './pages/shopping';

function App() {
  return (
    <Router>
      <nav>
        <Link to="/MainPage">Home</Link>
      </nav>
      <Routes>
        <Route path="/MainPage" element={<MainPage />} />
        <Route path="/SharedOrder" element={<SharedOrder />} />
      </Routes>
    </Router>
  );
}

export default App;
