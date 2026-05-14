import { HashRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import WaterRipple from './cases/waterRipple';
import SphereDissolve from './cases/sphereDissolve';
import LetterDissolve from './cases/letterDissolve';

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/water-ripple" element={<WaterRipple />} />
        <Route path="/sphere-dissolve" element={<SphereDissolve />} />
        <Route path="/letter-dissolve" element={<LetterDissolve />} />
      </Routes>
    </HashRouter>
  );
}
