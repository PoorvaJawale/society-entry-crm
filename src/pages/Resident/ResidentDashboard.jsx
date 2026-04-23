import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiBell, FiLogOut, FiCheckCircle, FiXCircle } from 'react-icons/fi';
import { playHomeownerAlert } from '../../utils/audio';
import { supabase } from '../../supabaseClient';

export const ResidentDashboard = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [history, setHistory] = useState([]);
  const [resident, setResident] = useState({ name: '', flat: '' });
  const prevPendingIds = useRef(new Set());

  useEffect(() => {
    // Check auth
    const flat = localStorage.getItem('currentResidentFlat');
    const name = localStorage.getItem('currentResidentName');
    
    if (!flat) {
      navigate('/resident');
      return;
    }
    setResident({ flat, name });

    const fetchMyVisitors = async () => {
      const { data, error } = await supabase
        .from('visitors')
        .select('*')
        .eq('flat_number', flat)
        .order('created_at', { ascending: false });

      if (data) {
        const currentPending = data.filter(v => v.status === 'pending');
        setNotifications(currentPending);
        setHistory(data.filter(v => v.status !== 'pending'));

        // Sound alert check
        let newPendingFound = false;
        const currentPendingIds = new Set(currentPending.map(v => v.id));

        currentPending.forEach(v => {
          if (!prevPendingIds.current.has(v.id)) {
            newPendingFound = true; // New pending visitor appeared!
          }
        });

        if (newPendingFound) {
          playHomeownerAlert();
        }

        prevPendingIds.current = currentPendingIds;
      }
    };

    fetchMyVisitors();

    // Polling fallback to guarantee 100% sync regardless of Supabase WS Configuration
    const interval = setInterval(fetchMyVisitors, 3000);

    return () => clearInterval(interval);
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('currentResidentFlat');
    localStorage.removeItem('currentResidentName');
    navigate('/resident');
  };

  const formatTime = (isoString) => {
    if (!isoString) return '';
    const d = new Date(isoString);
    return d.toLocaleDateString([], { month: 'short', day: 'numeric'}) + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (!resident.flat) return null;

  return (
    <div className="container animate-slide-up">
      <div className="flex-between header">
        <div>
          <h1>Homeowner</h1>
          <p>Flat {resident.flat} • {resident.name}</p>
        </div>
        <button onClick={handleLogout} style={{ padding: '8px 12px', background: 'transparent', color: 'var(--text-muted)' }}>
          <FiLogOut size={24} />
        </button>
      </div>

      <div style={{ marginBottom: 24, padding: '20px', backgroundColor: 'var(--primary-blue)', color: 'white', borderRadius: 'var(--border-radius)', display: 'flex', alignItems: 'center', gap: 16 }}>
        <FiBell size={32} color="var(--primary-orange)" />
        <div>
          <h2 style={{ fontSize: '1.2rem', marginBottom: 4 }}>Live Feed Active</h2>
          <p style={{ opacity: 0.9, fontSize: '0.85rem' }}>Auto-syncing to Main Gate</p>
        </div>
      </div>

      <h3 style={{ marginBottom: 12, color: 'var(--text-muted)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Pending Actions</h3>

      {notifications.length === 0 ? (
        <div className="card text-center" style={{ padding: '40px 20px', backgroundColor: 'transparent', border: '2px dashed #e5e7eb', boxShadow: 'none' }}>
          <p style={{ color: 'var(--text-muted)' }}>No visitors waiting at gate.</p>
        </div>
      ) : (
        <div className="grid-list">
          {notifications.map(visitor => (
            <div 
              key={visitor.id} 
              className="card" 
              style={{ borderLeft: '4px solid var(--warning-yellow)', cursor: 'pointer', margin: 0 }}
              onClick={() => navigate(`/resident/alert/${visitor.id}`)}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{ width: 64, height: 64, borderRadius: 12, backgroundColor: '#f3f4f6', overflow: 'hidden', flexShrink: 0 }}>
                  {visitor.photo_url ? (
                    <img src={visitor.photo_url} alt="Visitor" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <div className="flex-center" style={{ height: '100%' }}><span style={{fontSize: 24}}>👤</span></div>
                  )}
                </div>
                
                <div style={{ flex: 1 }}>
                  <div className="flex-between" style={{ marginBottom: 4 }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>{visitor.name}</h3>
                    <span style={{ fontSize: '0.75rem', color: 'var(--warning-yellow)', fontWeight: 700 }}>Action Required</span>
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: 12, display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <span>{visitor.purpose}</span>
                    {visitor.phone_number && <span style={{ fontWeight: 600 }}>📞 {visitor.phone_number}</span>}
                  </div>
                  <button className="btn-green" style={{ width: '100%', padding: '10px', fontSize: '0.9rem' }}>
                    Review Request
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Embedded History for Resident */}
      <h3 style={{ marginTop: 32, marginBottom: 12, color: 'var(--text-muted)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Recent History</h3>
      {history.length === 0 ? (
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No past visitors recorded.</p>
      ) : (
        <div className="grid-list">
          {history.map(visitor => (
            <div key={visitor.id} className="card" style={{ display: 'flex', alignItems: 'center', gap: 16, margin: 0, padding: 16 }}>
               <div style={{ width: 40, height: 40, borderRadius: 8, backgroundColor: '#f3f4f6', overflow: 'hidden', flexShrink: 0 }}>
                  {visitor.photo_url ? (
                    <img src={visitor.photo_url} alt="Visitor" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <div className="flex-center" style={{ height: '100%' }}><span style={{fontSize: 16}}>👤</span></div>
                  )}
              </div>
              <div style={{ flex: 1 }}>
                <div className="flex-between">
                  <h4 style={{ margin: 0, fontSize: '0.95rem', color: 'var(--text-main)' }}>{visitor.name}</h4>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>{formatTime(visitor.created_at)}</span>
                </div>
                 <div style={{ marginTop: 4, fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: 4,
                  color: visitor.status === 'approved' ? 'var(--success-green)' : 'var(--danger-red)', fontWeight: 600
                 }}>
                  {visitor.status === 'approved' ? <FiCheckCircle /> : <FiXCircle />}
                  <span>{visitor.status.charAt(0).toUpperCase() + visitor.status.slice(1)} Entry</span>
                  {visitor.phone_number && <span style={{ marginLeft: 'auto', color: 'var(--text-muted)' }}>📞 {visitor.phone_number}</span>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
