import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CameraCapture } from '../../components/CameraCapture';
import { FiCamera, FiUser, FiHome, FiFileText, FiPhone } from 'react-icons/fi';
import { supabase } from '../../supabaseClient';

export const AddVisitor = () => {
  const navigate = useNavigate();
  const [showCamera, setShowCamera] = useState(false);
  const [photoUrl, setPhotoUrl] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    flatNumber: '',
    purpose: 'Delivery'
  });

  const handleCapture = (dataUrl) => {
    setPhotoUrl(dataUrl);
    setShowCamera(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!photoUrl || !formData.name || !formData.flatNumber || formData.phone.length < 10) {
      alert("Please capture a photo and ensure all fields (including a valid 10-digit phone) are filled.");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const { data, error } = await supabase
        .from('visitors')
        .insert([
          {
            name: formData.name,
            phone_number: formData.phone,
            flat_number: formData.flatNumber,
            purpose: formData.purpose,
            photo_url: photoUrl,
            status: 'pending'
          }
        ]);

      if (error) {
        console.error(error);
        alert("Failed to submit. " + error.message);
      } else {
        navigate('/gatekeeper');
      }
    } catch (err) {
      console.error(err);
      alert("An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container animate-slide-up">
      {showCamera && (
        <CameraCapture 
          onCapture={handleCapture} 
          onCancel={() => setShowCamera(false)} 
        />
      )}

      <div className="header text-center">
        <h1>New Entry</h1>
        <p>Register visitor at the main gate</p>
      </div>

      <div className="card" style={{ flex: 1, padding: '32px 24px' }}>
        <div 
          onClick={() => setShowCamera(true)}
          style={{
            height: 180,
            borderRadius: 'var(--border-radius)',
            backgroundColor: '#f9fafb',
            border: '2px dashed #d1d5db',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: 32,
            cursor: 'pointer',
            overflow: 'hidden',
            position: 'relative',
            transition: 'var(--transition)'
          }}
        >
          {photoUrl ? (
            <img src={photoUrl} alt="Visitor" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <>
              <div style={{ backgroundColor: 'white', padding: 16, borderRadius: '50%', boxShadow: 'var(--shadow-sm)', marginBottom: 12 }}>
                <FiCamera size={32} color="var(--primary-orange)" />
              </div>
              <div style={{ color: 'var(--primary-blue)', fontWeight: 600 }}>Tap to Capture Photo</div>
            </>
          )}
          
          {photoUrl && (
            <div style={{ position: 'absolute', bottom: 12, right: 12, background: 'rgba(0,0,0,0.7)', color: 'white', padding: '6px 16px', borderRadius: 20, fontSize: '0.8rem', fontWeight: 600 }}>
              Retake
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label className="input-label">Visitor Name</label>
            <div style={{ position: 'relative' }}>
              <FiUser size={20} color="#9ca3af" style={{ position: 'absolute', top: 18, left: 16 }} />
              <input 
                type="text" 
                placeholder="E.g. Ramesh Kumar" 
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
                style={{ paddingLeft: 48 }}
                required
              />
            </div>
          </div>

          <div className="input-group">
            <label className="input-label">Mobile Number</label>
            <div style={{ position: 'relative' }}>
              <FiPhone size={20} color="#9ca3af" style={{ position: 'absolute', top: 18, left: 16 }} />
              <input 
                type="tel" 
                placeholder="10-digit number" 
                pattern="[0-9]{10}"
                maxLength="10"
                value={formData.phone}
                onChange={e => setFormData({...formData, phone: e.target.value.replace(/\D/g,'')})}
                style={{ paddingLeft: 48 }}
                required
              />
            </div>
          </div>

          <div className="input-group">
            <label className="input-label">Destination Flat</label>
            <div style={{ position: 'relative' }}>
              <FiHome size={20} color="#9ca3af" style={{ position: 'absolute', top: 18, left: 16 }} />
              <input 
                type="text" 
                placeholder="E.g. A-101" 
                value={formData.flatNumber}
                onChange={e => setFormData({...formData, flatNumber: e.target.value.toUpperCase()})}
                style={{ paddingLeft: 48 }}
                required
              />
            </div>
          </div>

          <div className="input-group">
            <label className="input-label">Purpose of Visit</label>
            <div style={{ position: 'relative' }}>
              <FiFileText size={20} color="#9ca3af" style={{ position: 'absolute', top: 18, left: 16 }} />
              <select 
                value={formData.purpose}
                onChange={e => setFormData({...formData, purpose: e.target.value})}
                style={{ paddingLeft: 48, appearance: 'none', cursor: 'pointer' }}
              >
                <option value="Delivery">📦 Delivery</option>
                <option value="Guest">👥 Guest</option>
                <option value="Maintenance">🔧 Maintenance</option>
                <option value="Cab">🚗 Cab / Taxi</option>
                <option value="Maid">🧹 Maid / Helper</option>
              </select>
            </div>
          </div>

          <button type="submit" disabled={isSubmitting} className="btn-large btn-green" style={{ marginTop: 24 }}>
            {isSubmitting ? 'Processing...' : 'Send Approval Request'}
          </button>
          
          <button 
            type="button" 
            className="btn-large btn-outline" 
            style={{ marginTop: 12 }}
            onClick={() => navigate('/gatekeeper')}
          >
            Cancel
          </button>
        </form>
      </div>
    </div>
  );
};
