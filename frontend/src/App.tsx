import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/header';
import Home from './pages/home';
import Categories from './pages/categories';
import AuthPage from './pages/profile';
import './App.css';
import MemeUpload from './pages/upload';
import Explore from './pages/explore';

function App() {
  return (
    <Router>
      <div className="bg-blue-900 min-h-screen">
        {/* Always visible */}
        <Header />

        {/* Page routes */}
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/category" element={<Categories />} />
          <Route path="/profile" element={<AuthPage />} />
          <Route path="/upload" element={<MemeUpload />} />
          <Route path="/explore" element={<Explore />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
