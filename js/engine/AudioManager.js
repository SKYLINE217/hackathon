/**
 * AudioManager — Procedural sound effects via Web Audio API
 */
const AudioManager = {
    ctx: null,
    enabled: true,

    init() {
        this.enabled = StorageManager.getSettings().sound !== false;
        try {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        } catch { this.enabled = false; }
    },

    _resume() {
        if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume();
    },

    _play(type, freq, duration, vol = 0.3, freqEnd = null) {
        if (!this.enabled || !this.ctx) return;
        this._resume();
        const osc  = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.type = type;
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
        if (freqEnd) osc.frequency.linearRampToValueAtTime(freqEnd, this.ctx.currentTime + duration);
        gain.gain.setValueAtTime(vol, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);
        osc.start(this.ctx.currentTime);
        osc.stop(this.ctx.currentTime + duration);
    },

    eat()      { this._play('sine',   300, 0.12, 0.2, 600); },
    click()    { this._play('square', 800, 0.06, 0.1); },
    wrong()    { this._play('sawtooth', 150, 0.25, 0.2, 80); },
    correct()  { this._play('sine',   660, 0.15, 0.2, 880); },
    hover()    { this._play('sine',   600, 0.05, 0.05); },
    jackIn()   {
        if (!this.enabled || !this.ctx) return;
        this._resume();
        [200, 400, 800, 1600].forEach((f, i) => {
            setTimeout(() => this._play('square', f, 0.1, 0.1), i * 80);
        });
    },
    keyPress() { this._play('triangle', 300, 0.04, 0.05); },
    keyError() { this._play('sawtooth', 100, 0.1, 0.1, 50); },
    alert()    { this._play('square', 1200, 0.1, 0.2); },
    turn()     { this._play('sine',   400, 0.03, 0.05); },
    gameOver() {
        if (!this.enabled || !this.ctx) return;
        this._resume();
        [440, 330, 220, 110].forEach((f, i) => {
            setTimeout(() => this._play('sine', f, 0.3, 0.25), i * 160);
        });
    },
    achievement() {
        if (!this.enabled || !this.ctx) return;
        this._resume();
        [523, 659, 784, 1047].forEach((f, i) => {
            setTimeout(() => this._play('sine', f, 0.2, 0.2), i * 100);
        });
    },
    tick()     { this._play('square', 440, 0.05, 0.08); },
    powerup()  {
        if (!this.enabled || !this.ctx) return;
        this._resume();
        this._play('sine', 400, 0.3, 0.25, 900);
    },

    setEnabled(val) {
        this.enabled = val;
        const settings = StorageManager.getSettings();
        settings.sound = val;
        StorageManager.setSettings(settings);
    }
};
