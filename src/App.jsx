import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AddVisitor } from './pages/Gatekeeper/AddVisitor';
import { Dashboard } from './pages/Gatekeeper/Dashboard';
import { FlatsDirectory } from './pages/Gatekeeper/FlatsDirectory';
import { ResidentAuth } from './pages/Resident/ResidentAuth';
import { ResidentDashboard } from './pages/Resident/ResidentDashboard';
import { NotificationAlert } from './pages/Resident/NotificationAlert';
import { History } from './pages/History';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/gatekeeper" replace />} />
        
        {/* Gatekeeper Routes */}
        <Route path="/gatekeeper" element={<Dashboard />} />
        <Route path="/gatekeeper/add" element={<AddVisitor />} />
        <Route path="/gatekeeper/flats" element={<FlatsDirectory />} />
        <Route path="/gatekeeper/history" element={<History />} />
        
        {/* Resident Routes */}
        <Route path="/resident" element={<ResidentAuth />} />
        <Route path="/resident/dash" element={<ResidentDashboard />} />
        <Route path="/resident/alert/:visitorId" element={<NotificationAlert />} />
      </Routes>
    </Router>
  );
}

export default App;
