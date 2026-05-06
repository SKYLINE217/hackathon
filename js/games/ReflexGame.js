/**
 * ReflexGame — Reaction Time Tester
 */
class ReflexGame {
    constructor() {
        this.zone    = document.getElementById('reflex-zone');
        this.rounds  = 5;
        this.current = 0;
        this.times   = [];
        this.state   = 'idle'; // idle | waiting | ready | result
        this._waitTimeout = null;
    }

    start() {
        this.current = 0;
        this.times   = [];
        document.getElementById('reflex-gameover').style.display = 'none';
        document.getElementById('reflex-result').style.display   = 'none';
        this._nextRound();
        this.zone.addEventListener('click',   this._clickHandler = () => this._onAction());
        document.addEventListener('keydown', this._keyHandler   = (e) => { if (e.code==='Space') { e.preventDefault(); this._onAction(); }});
    }

    _nextRound() {
        this.state = 'waiting';
        this.zone.className     = 'reflex-zone waiting';
        const instr = document.getElementById('reflex-instruction');
        instr.style.display     = 'block';
        instr.textContent       = 'WAIT FOR GREEN...';
        document.getElementById('reflex-result').style.display = 'none';
        document.getElementById('reflex-round-counter').textContent = `ROUND ${this.current+1}/${this.rounds}`;

        const delay = 1500 + Math.random() * 3500;
        this._waitTimeout = setTimeout(() => {
            if (this.state !== 'waiting') return;
            this.state = 'ready';
            this.zone.className   = 'reflex-zone ready';
            instr.textContent     = 'CLICK NOW!';
            this._startTime       = performance.now();
            AudioManager.tick();
        }, delay);
    }

    _onAction() {
        if (this.state === 'idle') return;

        if (this.state === 'waiting') {
            clearTimeout(this._waitTimeout);
            this.state = 'tooearly';
            this.zone.className = 'reflex-zone tooearly';
            document.getElementById('reflex-instruction').textContent = 'TOO EARLY! PENALTY...';
            AudioManager.wrong();
            this.times.push(999);
            setTimeout(() => { this.current++; this._checkEnd(); }, 1500);
            return;
        }

        if (this.state === 'ready') {
            const rt = Math.round(performance.now() - this._startTime);
            this.state = 'result';
            this.times.push(rt);
            const color = rt < 200 ? '#39ff14' : rt < 350 ? '#ffe600' : '#ff003c';
            document.getElementById('reflex-instruction').style.display = 'none';
            const resultEl = document.getElementById('reflex-result');
            resultEl.style.display = 'flex';
            document.getElementById('reflex-time').textContent  = rt;
            document.getElementById('reflex-time').style.color  = color;
            document.getElementById('reflex-avg').textContent   = this._calcAvg() + 'ms';
            this.zone.className = 'reflex-zone';
            AudioManager.correct();
            this.current++;
            setTimeout(() => this._checkEnd(), 1200);
        }
    }

    _calcAvg() {
        const valid = this.times.filter(t => t < 900);
        if (!valid.length) return '---';
        return Math.round(valid.reduce((a,b) => a+b, 0) / valid.length);
    }

    _checkEnd() {
        if (this.current < this.rounds) {
            this._nextRound();
        } else {
            this._endGame();
        }
    }

    _endGame() {
        this._cleanup();
        const avg    = this._calcAvg();
        // Store raw ms — lower is better. Use inverted storage so standard 'higher=better' logic works.
        const rawAvg = typeof avg === 'number' ? avg : 9999;
        const isNew  = StorageManager.setHighScore('reflex', 9999 - rawAvg);
        const chips  = this.times.map((t,i) => {
            const cls = t < 200 ? 'great' : t < 350 ? 'ok' : 'slow';
            const lbl = t >= 900 ? 'MISS' : `${t}ms`;
            return `<div class="reflex-result-chip ${cls}">R${i+1}: ${lbl}</div>`;
        }).join('');
        document.getElementById('reflex-results-list').innerHTML = chips;
        document.getElementById('reflex-final-avg').textContent  = avg === '---' ? '---' : avg;
        document.getElementById('reflex-high-msg').style.display  = isNew ? 'block' : 'none';
        document.getElementById('reflex-gameover').style.display  = 'flex';
        StorageManager.updateStats({ gamesPlayed:1 });
        AchievementSystem.check('first_blood');
        if (avg !== '---' && avg < 200) AchievementSystem.check('lightning_reflex');
        App.refreshHub();
    }

    _cleanup() {
        this.state = 'idle';
        clearTimeout(this._waitTimeout);
        if (this._clickHandler) this.zone.removeEventListener('click', this._clickHandler);
        if (this._keyHandler)   document.removeEventListener('keydown', this._keyHandler);
    }

    destroy() { this._cleanup(); }
}
