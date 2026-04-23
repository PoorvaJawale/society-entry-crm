import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiFilter, FiCalendar, FiHome, FiCheckCircle, FiXCircle, FiList, FiClock } from 'react-icons/fi';
import { supabase } from '../supabaseClient';

export const History = () => {
  const navigate = useNavigate();
  const [visitors, setVisitors] = useState([]);
  const [filterFlat, setFilterFlat] = useState('');

  useEffect(() => {
    const fetchHistory = async () => {
      const { data, error } = await supabase
        .from('visitors')
        .select('*')
        .neq('status', 'pending')
        .order('created_at', { ascending: false });

      if (data) setVisitors(data);
    };

    fetchHistory();
    // Aggressive Polling
    const interval = setInterval(fetchHistory, 3000);
    return () => clearInterval(interval);
  }, []);

  const filtered = filterFlat 
    ? visitors.filter(v => v.flat_number.toLowerCase().includes(filterFlat.toLowerCase()))
    : visitors;

  const formatTime = (isoString) => {
    if (!isoString) return '';
    const d = new Date(isoString);
    return  d.toLocaleDateString([], { month: 'short', day: 'numeric'}) + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <>
      <div className="container animate-slide-up">
        <div className="flex-between header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <h1 style={{ margin: 0 }}>Global History</h1>
          </div>
        </div>

        <div className="card" style={{ padding: '16px', display: 'flex', gap: 12, marginBottom: 24 }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <FiHome size={18} color="#9ca3af" style={{ position: 'absolute', top: 14, left: 14 }} />
            <input 
              type="text" 
              placeholder="Filter by Flat" 
              value={filterFlat}
              onChange={(e) => setFilterFlat(e.target.value)}
              style={{ padding: '12px 12px 12px 40px', margin: 0, fontSize: '0.9rem' }}
            />
          </div>
          <button style={{ backgroundColor: '#f9fafb', color: 'var(--text-main)', padding: '0 16px', border: '1px solid #e5e7eb' }}>
            <FiCalendar size={20} />
          </button>
        </div>

        <div style={{ position: 'relative', paddingLeft: 16 }}>
          {/* Timeline Line */}
          <div style={{ position: 'absolute', top: 0, bottom: 0, left: 16, width: 2, backgroundColor: '#e5e7eb', zIndex: 0 }}></div>
          
          {filtered.map((visitor, index) => (
            <div key={visitor.id || index} style={{ display: 'flex', gap: 16, marginBottom: 24, position: 'relative', zIndex: 1 }}>
              {/* Timeline Dot */}
              <div style={{ 
                width: 14, height: 14, borderRadius: '50%', 
                backgroundColor: visitor.status === 'approved' ? 'var(--success-green)' : (visitor.status === 'rejected' ? 'var(--danger-red)' : '#cbd5e1'),
                border: '3px solid var(--bg-color)',
                marginTop: 6,
                marginLeft: -7
              }}></div>
              
              <div className="card" style={{ flex: 1, margin: 0, padding: 16, display: 'flex', gap: 12 }}>
                 <div style={{ width: 48, height: 48, borderRadius: 8, backgroundColor: '#f9fafb', overflow: 'hidden', flexShrink: 0 }}>
                  {visitor.photo_url && <img src={visitor.photo_url} alt="Visitor" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                </div>
                <div style={{ flex: 1 }}>
                  <div className="flex-between">
                    <h4 style={{ margin: 0, fontSize: '0.95rem', color: 'var(--text-main)' }}>{visitor.name}</h4>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{formatTime(visitor.created_at)}</span>
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: 4, display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <span>Flat {visitor.flat_number} • {visitor.purpose}</span>
                    {visitor.phone_number && <span style={{ fontWeight: 600 }}>📞 {visitor.phone_number}</span>}
                  </div>
                  <div style={{ marginTop: 8, fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: 4,
                    color: visitor.status === 'approved' ? 'var(--success-green)' : (visitor.status === 'rejected' ? 'var(--danger-red)' : 'var(--warning-yellow)'),
                    fontWeight: 600
                   }}>
                    {visitor.status === 'approved' ? <FiCheckCircle /> : (visitor.status === 'rejected' ? <FiXCircle /> : null)}
                    {visitor.status.charAt(0).toUpperCase() + visitor.status.slice(1)} Entry
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Navbar Moved Outside Container */}
      <div className="bottom-nav">
        <div className="nav-item" onClick={() => navigate('/gatekeeper')}>
          <FiList />
          <span>Pending</span>
        </div>
        <div className="nav-item" onClick={() => navigate('/gatekeeper/flats')}>
          <FiHome />
          <span>Directory</span>
        </div>
        <div className="nav-item active">
          <FiClock />
          <span>History</span>
        </div>
      </div>
    </>
  );
};
