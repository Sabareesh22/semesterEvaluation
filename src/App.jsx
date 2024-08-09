import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import Sidebar from './components/Sidebar';
import COEpage from './pages/COEpage';

function App() {
  return (
    <Router>
      <div className="appContainer">
        <Sidebar />
        <div className="content">
          <Routes>
            <Route path="/" element={<COEpage />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
