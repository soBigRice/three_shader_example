import { HashRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import WaterRipple from './cases/waterRipple';
import SphereDissolve from './cases/sphereDissolve';

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/water-ripple" element={<WaterRipple />} />
        <Route path="/sphere-dissolve" element={<SphereDissolve />} />
      </Routes>
    </HashRouter>
  );
}
