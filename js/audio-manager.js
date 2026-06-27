// ================================================================
//  audio-manager.js
//  Creates all game sound effects AND background music using
//  the Web Audio API. No sound files needed — the browser
//  generates everything from scratch with oscillators.
//
//  An AudioContext is the "engine" that produces sound.
//  An OscillatorNode generates a tone at a given frequency (Hz).
//  A GainNode controls the volume (0 = silent, 1 = full volume).
// ================================================================

class Sounds {
  constructor() {
    // AudioContext is the main Web Audio object.
    // We create it once and reuse it for every sound.
    // "window.AudioContext || window.webkitAudioContext" handles
    // older Safari browsers that used a vendor prefix.
    this.ctx = new (window.AudioContext || window.webkitAudioContext)();

    // muted = true means all sounds AND music are silenced.
    // Toggled by the 🔊/🔇 button via toggleMute().
    this.muted = false;

    // musicInterval holds the setInterval ID for the music loop
    // so we can stop it with clearInterval later.
    this.musicInterval = null;

    // The background melody — a slow, calm loop using low notes.
    // Slower tempo + sine waves = much less intrusive background music.
    this.melody = [
      261, 329, 392, 329,   // C4 E4 G4 E4
      261, 293, 261, 220,   // C4 D4 C4 A3
      196, 261, 329, 261,   // G3 C4 E4 C4
      220, 196, 220, 261    // A3 G3 A3 C4
    ];

    // Which note in the melody array to play next
    this.melodyIndex = 0;
  }

  // ---- Helper: play a single beep tone ----------------------
  // frequency = pitch in Hz (higher number = higher pitch)
  // duration  = how long the tone lasts in seconds
  // type      = wave shape: "sine" (smooth), "square" (buzzy), "sawtooth" (harsh)
  // startTime = when to start (lets us schedule multiple tones in a row)
  // volume    = 0.0 to 1.0
  playTone(frequency, duration, type, startTime, volume) {
    // Oscillator generates the actual tone
    const osc = this.ctx.createOscillator();
    osc.type = type;
    osc.frequency.setValueAtTime(frequency, startTime);

    // GainNode controls volume and lets us fade out smoothly
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(volume, startTime);
    // Fade to silence just before the tone ends (avoids a "click" sound)
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

    // Connect: oscillator → gain → speakers
    osc.connect(gain);
    gain.connect(this.ctx.destination);

    // Schedule start and stop
    osc.start(startTime);
    osc.stop(startTime + duration);
  }

  // ---- Background music -------------------------------------
  // Plays the melody array as a looping tune.
  // Each note is triggered by setInterval — when the interval fires
  // we play the next note and advance the index.
  startMusic() {
    if (this.musicInterval) return; // already playing, don't start twice

    this.melodyIndex = 0;

    const bpm          = 90;                  // slow tempo — less intrusive
    const beatMs       = (60 / bpm) * 1000;  // milliseconds per beat
    const noteDuration = (60 / bpm) * 0.85;  // slightly shorter than a full beat

    // setInterval fires every beat and plays the next melody note
    this.musicInterval = setInterval(() => {
      if (this.muted) return; // skip if muted but keep the interval alive

      const freq = this.melody[this.melodyIndex];

      // Melody — soft sine wave (smooth sound)
      this.playTone(freq, noteDuration, "sine", this.ctx.currentTime, 0.05);

      // Bass — sine wave one octave down, on every 4th beat
      if (this.melodyIndex % 4 === 0) {
        this.playTone(freq / 2, noteDuration * 1.5, "sine", this.ctx.currentTime, 0.06);
      }

      // Move to the next note, looping back to 0 when we reach the end
      this.melodyIndex = (this.melodyIndex + 1) % this.melody.length;
    }, beatMs);
  }

  // Stops the music loop entirely (called on game over / restart).
  stopMusic() {
    clearInterval(this.musicInterval);
    this.musicInterval = null;
    this.melodyIndex   = 0;
  }

  // ---- Mute toggle ------------------------------------------
  // Flips the muted flag. Returns the new state so the button
  // can update its icon.
  toggleMute() {
    this.muted = !this.muted;
    return this.muted;
  }

  // ---- Hit sound --------------------------------------------
  // Low, buzzy "splat" when the frog gets hit by a car.
  playHit() {
    if (this.muted) return;
    const now = this.ctx.currentTime;
    this.playTone(200, 0.15, "square", now,       0.4);
    this.playTone(100, 0.2,  "square", now + 0.1, 0.3);
  }

  // ---- Crossing sound ---------------------------------------
  // Three ascending tones when the frog reaches the green zone.
  playCrossing() {
    if (this.muted) return;
    const now = this.ctx.currentTime;
    this.playTone(400, 0.1, "sine", now,        0.4);
    this.playTone(600, 0.1, "sine", now + 0.12, 0.4);
    this.playTone(800, 0.2, "sine", now + 0.24, 0.4);
  }

  // ---- Game over sound --------------------------------------
  // Sad descending melody — four tones stepping down.
  playGameOver() {
    if (this.muted) return;
    const now = this.ctx.currentTime;
    this.playTone(440, 0.2, "sawtooth", now,        0.3);
    this.playTone(370, 0.2, "sawtooth", now + 0.25, 0.3);
    this.playTone(311, 0.2, "sawtooth", now + 0.5,  0.3);
    this.playTone(233, 0.4, "sawtooth", now + 0.75, 0.3);
  }

  // ---- Hop sound --------------------------------------------
  // A tiny soft blip each time the frog moves.
  playHop() {
    if (this.muted) return;
    const now = this.ctx.currentTime;
    this.playTone(300, 0.06, "sine", now, 0.15);
  }
}
