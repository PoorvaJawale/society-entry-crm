import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiHome, FiList, FiClock, FiSearch } from 'react-icons/fi';
import { supabase } from '../../supabaseClient';

export const FlatsDirectory = () => {
  const navigate = useNavigate();
  const [flats, setFlats] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchFlats = async () => {
      const { data, error } = await supabase
        .from('flats')
        .select('*')
        .order('flat_number', { ascending: true });

      if (data) {
        setFlats(data);
      }
    };

    fetchFlats();

    // Constant explicit sync to fix disabled Postgres Publication bug in Supabase
    const interval = setInterval(fetchFlats, 3000);
    return () => clearInterval(interval);
  }, []);

  const filtered = flats.filter(f => 
    f.flat_number.toLowerCase().includes(searchTerm.toLowerCase()) || 
    f.resident_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <div className="container animate-slide-up">
        <div className="flex-between header">
          <div>
            <h1>Directory</h1>
            <p>All Flats & Residents</p>
          </div>
        </div>

        <div className="card" style={{ padding: '16px', display: 'flex', gap: 12, marginBottom: 24 }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <FiSearch size={18} color="#9ca3af" style={{ position: 'absolute', top: 14, left: 14 }} />
            <input 
              type="text" 
              placeholder="Search by Flat or Name..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ padding: '12px 12px 12px 40px', margin: 0, fontSize: '0.9rem' }}
            />
          </div>
        </div>

        <div className="grid-list">
          {filtered.map(flat => (
            <div key={flat.id} className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{ width: 48, height: 48, borderRadius: 12, backgroundColor: 'rgba(13, 42, 106, 0.05)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                  <FiHome size={24} color="var(--primary-blue)" />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0, color: 'var(--text-main)' }}>{flat.flat_number}</h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: '4px 0 0 0', fontWeight: 500 }}>{flat.resident_name}</p>
                </div>
              </div>
              
              <div style={{
                backgroundColor: flat.occupancy_type === 'owner' ? 'rgba(13, 42, 106, 0.1)' : 'rgba(243, 112, 33, 0.15)',
                color: flat.occupancy_type === 'owner' ? 'var(--primary-blue)' : 'var(--primary-orange)',
                padding: '6px 14px',
                borderRadius: '8px',
                fontSize: '0.75rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}>
                {flat.occupancy_type}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Navbar Moved Outside */}
      <div className="bottom-nav">
        <div className="nav-item" onClick={() => navigate('/gatekeeper')}>
          <FiList />
          <span>Pending</span>
        </div>
        <div className="nav-item active">
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
