import React, { useRef, useState, useCallback } from 'react';
import { FiCamera, FiX, FiCheck } from 'react-icons/fi';

export const CameraCapture = ({ onCapture, onCancel }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [hasPhoto, setHasPhoto] = useState(false);
  const [photoData, setPhotoData] = useState(null);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' } // Prefer back camera
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      alert("Cannot access camera. Please check permissions.");
    }
  };

  React.useEffect(() => {
    startCamera();
    return () => {
      // Cleanup camera stream
      if (videoRef.current && videoRef.current.srcObject) {
        videoRef.current.srcObject.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const takePhoto = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    const dataUrl = canvas.toDataURL('image/jpeg');
    setPhotoData(dataUrl);
    setHasPhoto(true);

    // Stop stream after capture
    if (video.srcObject) {
      video.srcObject.getTracks().forEach(track => track.stop());
    }
  }, []);

  const confirmPhoto = () => {
    if (photoData) onCapture(photoData);
  };

  const retakePhoto = () => {
    setHasPhoto(false);
    setPhotoData(null);
    startCamera();
  };

  return (
    <div style={styles.fullscreenOverlay}>
      {!hasPhoto ? (
        <>
          <video
            ref={videoRef}
            autoPlay
            playsInline
            style={styles.video}
          />
          <div style={styles.controls}>
            <button style={styles.cancelBtn} onClick={onCancel}>
              <FiX size={24} />
            </button>
            <button style={styles.captureBtn} onClick={takePhoto}>
              <div style={styles.innerCaptureBtn} />
            </button>
            <div style={{ width: 44 }}></div> {/* Spacer for centering */}
          </div>
        </>
      ) : (
        <>
          <img src={photoData} alt="Captured" style={styles.video} />
          <div style={styles.controls}>
            <button style={styles.cancelBtn} onClick={retakePhoto}>
              <FiX size={24} /> Retake
            </button>
            <button style={styles.confirmBtn} onClick={confirmPhoto}>
              <FiCheck size={24} /> Use Photo
            </button>
          </div>
        </>
      )}
      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </div>
  );
};

const styles = {
  fullscreenOverlay: {
    position: 'fixed',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: '#000',
    zIndex: 9999,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center'
  },
  video: {
    width: '100%',
    height: '100%',
    objectFit: 'cover'
  },
  controls: {
    position: 'absolute',
    bottom: 0, left: 0, right: 0,
    padding: '30px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    background: 'linear-gradient(translateY(0), rgba(0,0,0,0) 0%, rgba(0,0,0,0.8) 100%)'
  },
  captureBtn: {
    width: 72, height: 72,
    borderRadius: '50%',
    backgroundColor: 'rgba(255,255,255,0.3)',
    border: '4px solid white',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 0
  },
  innerCaptureBtn: {
    width: 56, height: 56,
    borderRadius: '50%',
    backgroundColor: 'white'
  },
  cancelBtn: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    color: 'white',
    borderRadius: '50px',
    padding: '12px 20px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  confirmBtn: {
    backgroundColor: 'var(--primary-green)',
    color: 'white',
    borderRadius: '50px',
    padding: '12px 24px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  }
};
