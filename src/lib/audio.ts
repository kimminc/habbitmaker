export const playDingSound = () => {
  if (typeof window === 'undefined') return;

  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;

    const context = new AudioContext();
    const now = context.currentTime;

    // 더 청량하고 맑은 느낌을 위해 높은 옥타브의 화음 구성 (C6, E6, G6, C7)
    const notes = [1046.50, 1318.51, 1567.98, 2093.00]; 
    
    notes.forEach((freq, index) => {
      const startTime = now + (index * 0.05); // 더 빠른 템포로 '띠리링'
      const duration = 0.6;

      const oscillator = context.createOscillator();
      const gainNode = context.createGain();

      // '청량함'을 위해 Triangle파와 Sine파의 중간 느낌을 냄 (여기서는 Triangle 사용 후 필터링 효과)
      oscillator.type = 'triangle'; 
      oscillator.frequency.setValueAtTime(freq, startTime);
      
      // 주파수가 살짝 떨어지게 해서 자연스러운 여운 생성
      oscillator.frequency.exponentialRampToValueAtTime(freq * 0.95, startTime + duration);

      // 투명한 느낌을 위해 볼륨 엔벨로프 세밀하게 조절
      gainNode.gain.setValueAtTime(0, startTime);
      gainNode.gain.linearRampToValueAtTime(0.15, startTime + 0.01); // 빠른 어택
      gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + duration); // 긴 릴리즈

      oscillator.connect(gainNode);
      gainNode.connect(context.destination);

      oscillator.start(startTime);
      oscillator.stop(startTime + duration);
    });
  } catch (error) {
    console.error('Audio playback failed:', error);
  }
};
