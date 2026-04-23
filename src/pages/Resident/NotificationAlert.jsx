import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiCheck, FiX, FiShield, FiUser, FiPhone } from 'react-icons/fi';
import { supabase } from '../../supabaseClient';

export const NotificationAlert = () => {
  const { visitorId } = useParams();
  const navigate = useNavigate();
  const [visitor, setVisitor] = useState(null);
  const [actionTaken, setActionTaken] = useState(null);

  useEffect(() => {
    const fetchVisitor = async () => {
      const { data, error } = await supabase
        .from('visitors')
        .select('*')
        .eq('id', visitorId)
        .single();
        
      if (data) {
        setVisitor(data);
        if (data.status !== 'pending') setActionTaken(data.status);
      }
    };

    fetchVisitor();
  }, [visitorId]);

  const handleAction = async (status) => {
    if (!visitor) return;
    
    setActionTaken(status);

    const { error } = await supabase
      .from('visitors')
      .update({ status })
      .eq('id', visitor.id);
      
    if (error) {
      console.error(error);
      alert("Failed to update status.");
      setActionTaken(null);
      return;
    }

    setTimeout(() => {
      navigate('/resident/dash');
    }, 2000);
  };

  if (!visitor) {
    return <div className="container flex-center">Loading...</div>;
  }

  if (actionTaken) {
    return (
      <div className="container flex-center" style={{ backgroundColor: actionTaken === 'approved' ? 'var(--primary-green)' : 'var(--danger-red)', color: 'white' }}>
        <div className="card text-center animate-slide-up" style={{ backgroundColor: 'white', color: 'var(--text-main)', maxWidth: 320, width: '100%' }}>
          {actionTaken === 'approved' ? (
            <FiCheck size={64} color="var(--primary-green)" style={{ margin: '0 auto 16px' }} />
          ) : (
            <FiX size={64} color="var(--danger-red)" style={{ margin: '0 auto 16px' }} />
          )}
          <h2>Access {actionTaken === 'approved' ? 'Granted' : 'Denied'}</h2>
          <p style={{ color: 'var(--text-muted)', marginTop: 8 }}>Gatekeeper has been notified.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: 0, backgroundColor: '#000', display: 'flex', flexDirection: 'column', height: '100vh', maxWidth: '100%' }}>
      {/* Top Warning Banner */}
      <div style={{ backgroundColor: 'var(--warning-yellow)', color: '#000', padding: '12px 20px', display: 'flex', alignItems: 'center', gap: 8, fontWeight: 600 }}>
        <FiShield size={20} /> Visitor at Main Gate
      </div>
      
      {/* Photo Area */}
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
        {visitor.photo_url ? (
          <img src={visitor.photo_url} alt="Visitor" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <div className="flex-center" style={{ width: '100%', height: '100%', backgroundColor: '#2d3748' }}>
            <FiUser size={80} color="#718096" />
          </div>
        )}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '40%', background: 'linear-gradient(to top, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 100%)' }}></div>
      </div>

      {/* Details Card overlapping photo */}
      <div style={{ backgroundColor: 'white', borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: '32px 24px', marginTop: -40, position: 'relative', zIndex: 10 }}>
        <div className="text-center" style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: '1.8rem', marginBottom: 8, fontWeight: 800 }}>{visitor.name}</h1>
          <div style={{ display: 'inline-block', backgroundColor: '#f370211a', padding: '8px 16px', borderRadius: 20, color: 'var(--primary-orange)', fontWeight: 700, fontSize: '1rem', marginBottom: 8 }}>
            {visitor.purpose}
          </div>
          {visitor.phone_number && (
            <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 600 }}>
              <FiPhone size={14} style={{ marginBottom: -2, marginRight: 4 }} /> {visitor.phone_number}
            </div>
          )}
        </div>

        <div style={{ display: 'flex', gap: 16, marginTop: 32 }}>
          <button 
            className="btn-large" 
            style={{ flex: 1, backgroundColor: 'white', border: '2px solid var(--danger-red)', color: 'var(--danger-red)' }}
            onClick={() => handleAction('rejected')}
          >
            <FiX size={24} style={{ marginBottom: -6, marginRight: 8 }} /> Reject
          </button>
          
          <button 
            className="btn-large btn-green" 
            style={{ flex: 2 }}
            onClick={() => handleAction('approved')}
          >
            <FiCheck size={24} style={{ marginBottom: -6, marginRight: 8 }} /> Approve Entry
          </button>
        </div>
      </div>
    </div>
  );
};
