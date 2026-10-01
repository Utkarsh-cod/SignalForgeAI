import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { Overview } from './pages/Overview';
import { Market } from './pages/Market';
import { Prediction } from './pages/Prediction';
import { ModelPerformance } from './pages/ModelPerformance';
import { Backtest } from './pages/Backtest';
import { News } from './pages/News';
import { Settings } from './pages/Settings';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Overview />} />
          <Route path="market" element={<Market />} />
          <Route path="sentiment" element={<News />} />
          <Route path="prediction" element={<Prediction />} />
          <Route path="model" element={<ModelPerformance />} />
          <Route path="backtest" element={<Backtest />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
