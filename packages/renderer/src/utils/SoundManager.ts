// EKD Clean - Audio System
// Built by EKD Digital - Premium Sound Experience

export class SoundManager {
  private static instance: SoundManager;
  private audioContext: AudioContext | null = null;

  private constructor() {
    // Initialize Web Audio API
    if (typeof window !== "undefined" && "AudioContext" in window) {
      this.audioContext = new AudioContext();
    }
  }

  public static getInstance(): SoundManager {
    if (!SoundManager.instance) {
      SoundManager.instance = new SoundManager();
    }
    return SoundManager.instance;
  }

  // Generate procedural sounds for now (later can load actual audio files)
  private createBeepSound(
    frequency: number,
    duration: number,
    type: OscillatorType = "sine"
  ): void {
    if (!this.audioContext) return;

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    oscillator.frequency.value = frequency;
    oscillator.type = type;

    gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(
      0.1,
      this.audioContext.currentTime + 0.01
    );
    gainNode.gain.exponentialRampToValueAtTime(
      0.01,
      this.audioContext.currentTime + duration
    );

    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + duration);
  }

  private createClickSound(): void {
    if (!this.audioContext) return;

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();
    const filter = this.audioContext.createBiquadFilter();

    oscillator.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    // Sharp click sound
    oscillator.frequency.value = 800;
    oscillator.type = "square";

    filter.type = "highpass";
    filter.frequency.value = 400;

    gainNode.gain.setValueAtTime(0.15, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(
      0.01,
      this.audioContext.currentTime + 0.05
    );

    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + 0.05);
  }

  private createScanSound(): void {
    if (!this.audioContext) return;

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();
    const filter = this.audioContext.createBiquadFilter();

    oscillator.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    // Scanning sound - sweeping frequency
    oscillator.frequency.setValueAtTime(200, this.audioContext.currentTime);
    oscillator.frequency.linearRampToValueAtTime(
      800,
      this.audioContext.currentTime + 0.5
    );
    oscillator.type = "sawtooth";

    filter.type = "lowpass";
    filter.frequency.value = 1000;

    gainNode.gain.setValueAtTime(0.05, this.audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(
      0.02,
      this.audioContext.currentTime + 0.5
    );

    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + 0.5);
  }

  private createSuccessSound(): void {
    // Success chord - C major
    const frequencies = [523.25, 659.25, 783.99]; // C5, E5, G5

    frequencies.forEach((freq, index) => {
      setTimeout(() => {
        this.createBeepSound(freq, 0.3, "sine");
      }, index * 100);
    });
  }

  private createErrorSound(): void {
    if (!this.audioContext) return;

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    // Error sound - dissonant tone
    oscillator.frequency.setValueAtTime(400, this.audioContext.currentTime);
    oscillator.frequency.linearRampToValueAtTime(
      200,
      this.audioContext.currentTime + 0.3
    );
    oscillator.type = "sawtooth";

    gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(
      0.01,
      this.audioContext.currentTime + 0.3
    );

    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + 0.3);
  }

  // Public methods for playing sounds
  public playClick(): void {
    this.createClickSound();
  }

  public playScan(): void {
    this.createScanSound();
  }

  public playSuccess(): void {
    this.createSuccessSound();
  }

  public playError(): void {
    this.createErrorSound();
  }

  public playNotification(): void {
    this.createBeepSound(880, 0.2, "sine");
    setTimeout(() => {
      this.createBeepSound(1108.73, 0.2, "sine"); // D6
    }, 200);
  }

  public playProgress(): void {
    this.createBeepSound(600, 0.1, "sine");
  }

  // Resume audio context if needed (for user interaction requirement)
  public async resumeContext(): Promise<void> {
    if (this.audioContext && this.audioContext.state === "suspended") {
      await this.audioContext.resume();
    }
  }
}
