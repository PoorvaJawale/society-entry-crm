import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiHome, FiUser, FiArrowRight, FiTag } from 'react-icons/fi';
import { supabase } from '../../supabaseClient';

export const ResidentAuth = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ name: '', flat: '', occupancyType: 'owner' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // If already logged in, redirect to dashboard
    if (localStorage.getItem('currentResidentFlat')) {
      navigate('/resident/dash');
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.name && formData.flat) {
      setIsSubmitting(true);
      
      const flatNumber = formData.flat.toUpperCase();

      try {
        // Upsert into Supabase (if flat exists, overwrite name and occupancy_type)
        const { error } = await supabase
          .from('flats')
          .upsert(
            { 
              flat_number: flatNumber, 
              resident_name: formData.name, 
              occupancy_type: formData.occupancyType 
            }, 
            { onConflict: 'flat_number' }
          );

        if (error) {
          console.error(error);
          alert("Failed to register flat. Please check database connection.");
        } else {
          localStorage.setItem('currentResidentFlat', flatNumber);
          localStorage.setItem('currentResidentName', formData.name);
          navigate('/resident/dash');
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <div className="container flex-center" style={{ backgroundColor: 'var(--primary-blue)', color: 'white' }}>
      <div className="card animate-slide-up auth-container" style={{ color: 'var(--text-main)', padding: '40px 30px' }}>
        <div className="text-center header">
          <div style={{ backgroundColor: '#f0f8ff', width: 80, height: 80, borderRadius: '50%', margin: '0 auto 24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <FiHome size={40} color="var(--primary-blue)" />
          </div>
          <h1 style={{ marginBottom: 8, fontSize: '1.8rem' }}>Welcome Home</h1>
          <p>Register your flat to receive entry alerts.</p>
        </div>

        <form onSubmit={handleSubmit} style={{ marginTop: 32 }}>
          <div className="input-group">
            <label className="input-label" style={{ color: 'var(--text-main)' }}>Your Name</label>
            <div style={{ position: 'relative' }}>
              <FiUser size={20} color="#94a3b8" style={{ position: 'absolute', top: 18, left: 16 }} />
              <input 
                type="text" 
                placeholder="E.g. John Doe"
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
                style={{ paddingLeft: 48 }}
                required
              />
            </div>
          </div>

          <div className="input-group">
            <label className="input-label" style={{ color: 'var(--text-main)' }}>Flat Number</label>
            <div style={{ position: 'relative' }}>
              <FiHome size={20} color="#94a3b8" style={{ position: 'absolute', top: 18, left: 16 }} />
              <input 
                type="text" 
                placeholder="E.g. A-101"
                value={formData.flat}
                onChange={e => setFormData({...formData, flat: e.target.value})}
                style={{ paddingLeft: 48 }}
                required
              />
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 6, lineHeight: '1.2' }}>
              Note: If this flat is already registered under someone else, signing up will overwrite the residency details indicating you have taken over the flat.
            </p>
          </div>

          <div className="input-group">
            <label className="input-label" style={{ color: 'var(--text-main)' }}>Occupancy Status</label>
            <div style={{ position: 'relative' }}>
              <FiTag size={20} color="#94a3b8" style={{ position: 'absolute', top: 18, left: 16 }} />
              <select 
                value={formData.occupancyType}
                onChange={e => setFormData({...formData, occupancyType: e.target.value})}
                style={{ paddingLeft: 48, backgroundColor: '#f8fbfa', appearance: 'none' }}
              >
                <option value="owner">Property Owner</option>
                <option value="rental">Rental Tenant</option>
              </select>
            </div>
          </div>

          <button type="submit" disabled={isSubmitting} className="btn-large btn-green" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginTop: 24, padding: '20px' }}>
            {isSubmitting ? 'Registering...' : 'Get Started'} <FiArrowRight size={24} />
          </button>
        </form>
      </div>
    </div>
  );
};
