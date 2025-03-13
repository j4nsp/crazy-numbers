// Create a simple blop sound using Web Audio API
let audioContext: AudioContext | null = null;

// Base frequencies for a pentatonic scale (more pleasant than chromatic)
const baseFrequencies = [
  440,  // A4
  523.25, // C5
  587.33, // D5
  659.25, // E5
  783.99, // G5
];

export const playBlopSound = (cellIndex: number) => {
  // Initialize audio context on first use (needs user interaction)
  if (!audioContext) {
    audioContext = new AudioContext();
  }

  // Create oscillator and gain nodes
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();

  // Get frequency based on cell index (use pentatonic scale)
  const baseFreq = baseFrequencies[cellIndex % baseFrequencies.length];

  // Configure oscillator
  oscillator.type = 'sine';
  oscillator.frequency.setValueAtTime(baseFreq, audioContext.currentTime);
  oscillator.frequency.exponentialRampToValueAtTime(
    baseFreq * 0.95,  // Slight pitch drop
    audioContext.currentTime + 0.1
  );

  // Configure gain (volume)
  gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(
    0.01,
    audioContext.currentTime + 0.1
  );

  // Connect nodes
  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);

  // Play sound
  oscillator.start();
  oscillator.stop(audioContext.currentTime + 0.1);
};

export const playPushSound = () => {
  // Initialize audio context on first use (needs user interaction)
  if (!audioContext) {
    audioContext = new AudioContext();
  }

  // Create oscillator and gain nodes
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();
  const filterNode = audioContext.createBiquadFilter();

  // Configure filter
  filterNode.type = 'lowpass';
  filterNode.frequency.setValueAtTime(1000, audioContext.currentTime);
  filterNode.frequency.exponentialRampToValueAtTime(100, audioContext.currentTime + 0.3);
  filterNode.Q.setValueAtTime(10, audioContext.currentTime);

  // Configure oscillator
  oscillator.type = 'sawtooth';
  oscillator.frequency.setValueAtTime(150, audioContext.currentTime);
  oscillator.frequency.exponentialRampToValueAtTime(50, audioContext.currentTime + 0.3);

  // Configure gain (volume)
  gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);

  // Connect nodes
  oscillator.connect(filterNode);
  filterNode.connect(gainNode);
  gainNode.connect(audioContext.destination);

  // Play sound
  oscillator.start();
  oscillator.stop(audioContext.currentTime + 0.3);
}; 