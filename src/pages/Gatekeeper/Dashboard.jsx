import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiPlus, FiClock, FiCheckCircle, FiXCircle, FiLogOut, FiUser, FiHome, FiList } from 'react-icons/fi';
import { playGatekeeperAlert } from '../../utils/audio';
import { supabase } from '../../supabaseClient';

export const Dashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('pending');
  const [visitors, setVisitors] = useState([]);
  const prevStatusMap = useRef({});

  useEffect(() => {
    const fetchVisitors = async () => {
      const { data, error } = await supabase
        .from('visitors')
        .select('*')
        .order('created_at', { ascending: false });

      if (data) {
        let hasChanges = false;
        
        data.forEach(newV => {
          const oldStatus = prevStatusMap.current[newV.id];
          
          if (oldStatus && oldStatus === 'pending' && oldStatus !== newV.status) {
            // Found a status change from pending!
            if (newV.status === 'approved') playGatekeeperAlert('approve');
            if (newV.status === 'rejected') playGatekeeperAlert('reject');
            hasChanges = true;
          }
          
          prevStatusMap.current[newV.id] = newV.status;
        });

        setVisitors(data);
      }
    };

    fetchVisitors();

    // Robust Polling Fallback (3 seconds) to guarantee real-time updates and sounds 
    // even if Supabase Realtime Native Postgres Broadcasting isn't enabled by the user natively.
    const interval = setInterval(fetchVisitors, 3000);

    return () => clearInterval(interval);
  }, []);

  const filteredVisitors = visitors.filter(v => v.status === activeTab);

  const formatTime = (isoString) => {
    if (!isoString) return '';
    const d = new Date(isoString);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'pending': return <span className="status-badge status-pending"><FiClock /> Pending</span>;
      case 'approved': return <span className="status-badge status-approved"><FiCheckCircle /> Approved</span>;
      case 'rejected': return <span className="status-badge status-rejected"><FiXCircle /> Rejected</span>;
      default: return null;
    }
  };

  return (
    <>
      <div className="container animate-slide-up">
        <div className="flex-between header">
          <div>
            <h1>Gatekeeper</h1>
            <p>Main Gate Dashboard</p>
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <button style={{ padding: '8px', background: 'transparent', color: 'var(--danger-red)' }}>
              <FiLogOut size={24} />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 24, overflowX: 'auto', paddingBottom: 4 }}>
          <button 
            onClick={() => setActiveTab('pending')}
            style={{ flex: 1, minWidth: 100, backgroundColor: activeTab === 'pending' ? 'white' : 'transparent', color: activeTab === 'pending' ? 'var(--text-main)' : 'var(--text-muted)', boxShadow: activeTab === 'pending' ? 'var(--shadow-sm)' : 'none' }}>
            Pending
          </button>
          <button 
            onClick={() => setActiveTab('approved')}
            style={{ flex: 1, minWidth: 100, backgroundColor: activeTab === 'approved' ? 'white' : 'transparent', color: activeTab === 'approved' ? 'var(--text-main)' : 'var(--text-muted)', boxShadow: activeTab === 'approved' ? 'var(--shadow-sm)' : 'none' }}>
            Approved
          </button>
          <button 
            onClick={() => setActiveTab('rejected')}
            style={{ flex: 1, minWidth: 100, backgroundColor: activeTab === 'rejected' ? 'white' : 'transparent', color: activeTab === 'rejected' ? 'var(--text-main)' : 'var(--text-muted)', boxShadow: activeTab === 'rejected' ? 'var(--shadow-sm)' : 'none' }}>
            Rejected
          </button>
        </div>

        {/* List */}
        <div>
          {filteredVisitors.length === 0 ? (
            <div className="card text-center" style={{ padding: '40px 20px', backgroundColor: 'transparent', border: 'none', boxShadow: 'none' }}>
              <p style={{ color: 'var(--text-muted)' }}>No {activeTab} visitors</p>
            </div>
          ) : (
            <div className="grid-list">
              {filteredVisitors.map(visitor => (
                <div key={visitor.id} className="card" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <div style={{ width: 60, height: 60, borderRadius: 12, backgroundColor: '#e2e8f0', overflow: 'hidden', flexShrink: 0 }}>
                    {visitor.photo_url ? (
                      <img src={visitor.photo_url} alt="Visitor" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <div className="flex-center" style={{ height: '100%' }}><FiUser color="#9ca3af" size={24} /></div>
                    )}
                  </div>
                  
                  <div style={{ flex: 1 }}>
                    <div className="flex-between" style={{ marginBottom: 4 }}>
                      <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>{visitor.name}</h3>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{formatTime(visitor.created_at)}</span>
                    </div>
                    <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: 8, display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <span>Flat {visitor.flat_number} • {visitor.purpose}</span>
                      {/* Using the CSS selector width here directly to overcome default SVG behavior but preserving icon format */}
                      {visitor.phone_number && <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>📞 {visitor.phone_number}</span>}
                    </div>
                    <div>{getStatusBadge(visitor.status)}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Floating Add Button */}
        <div style={{ position: 'fixed', bottom: 85, left: 0, right: 0, padding: '0 20px', display: 'flex', justifyContent: 'center', zIndex: 10, pointerEvents: 'none' }}>
          <button 
            className="btn-green btn-large" 
            style={{ maxWidth: 440, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, pointerEvents: 'auto' }}
            onClick={() => navigate('/gatekeeper/add')}
          >
            <FiPlus size={24} /> New Visitor
          </button>
        </div>
      </div>

      {/* Bottom Navbar (Moved OUTSIDE the container to prevent CSS Transform breaks) */}
      <div className="bottom-nav">
        <div className="nav-item active">
          <FiList />
          <span>Pending</span>
        </div>
        <div className="nav-item" onClick={() => navigate('/gatekeeper/flats')}>
          <FiHome />
          <span>Directory</span>
        </div>
        <div className="nav-item" onClick={() => navigate('/gatekeeper/history')}>
          <FiClock />
          <span>History</span>
        </div>
      </div>
    </>
  );
};
