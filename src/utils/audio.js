const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

const playTone = (freq, type, duration, vol) => {
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  const oscillator = audioCtx.createOscillator();
  const gainNode = audioCtx.createGain();

  oscillator.type = type;
  oscillator.frequency.setValueAtTime(freq, audioCtx.currentTime);

  gainNode.gain.setValueAtTime(vol, audioCtx.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + duration);

  oscillator.connect(gainNode);
  gainNode.connect(audioCtx.destination);

  oscillator.start();
  oscillator.stop(audioCtx.currentTime + duration);
};

export const playHomeownerAlert = () => {
  // Pleasant two-tone chime (Ding-Dong)
  try {
    playTone(523.25, 'sine', 0.5, 0.5); // C5
    setTimeout(() => playTone(415.30, 'sine', 0.8, 0.5), 200); // G#4
  } catch(e) { console.error("Audio playback prevented:", e); }
};

export const playGatekeeperAlert = (status) => {
  try {
    if (status === 'approve') {
      // High positive double beep
      playTone(880, 'sine', 0.1, 0.3); // A5
      setTimeout(() => playTone(1046.50, 'sine', 0.3, 0.3), 150); // C6
    } else {
      // Low error buzz
      playTone(300, 'sawtooth', 0.5, 0.3);
    }
  } catch(e) { console.error("Audio playback prevented:", e); }
};
