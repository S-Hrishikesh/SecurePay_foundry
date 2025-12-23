// A simplified look at the new App.jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LandingPage from './Pages/LandingPage';
import SubscriberDashboard from './Pages/SubscriberDashboard';
import CreatorDashboard from './Pages/CreatorDashboard';
import HistoryPage from './Pages/HistoryPage';
import AnalyticsPage from './Pages/AnalyticsPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/subscriber" element={<SubscriberDashboard />} />
        <Route path="/creator" element={<CreatorDashboard />} />
        <Route path="/history" element={<HistoryPage />} />
        <Route path="/analytics" element={<AnalyticsPage />} />
      </Routes>
    </BrowserRouter>
  );
}
export default App;

