import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/header';
import Home from './pages/home';
import Categories from './pages/categories';
import AuthPage from './pages/profile';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        {/* Always visible */}
        <Header />

        {/* Page routes */}
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/category" element={<Categories />} />
          <Route path="/profile" element={<AuthPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
