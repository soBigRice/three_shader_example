import { HashRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import WaterRipple from './cases/waterRipple';

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/water-ripple" element={<WaterRipple />} />
      </Routes>
    </HashRouter>
  );
}
