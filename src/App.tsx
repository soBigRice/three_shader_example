import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import WaterRipple from './cases/waterRipple';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/water-ripple" element={<WaterRipple />} />
      </Routes>
    </BrowserRouter>
  );
}
