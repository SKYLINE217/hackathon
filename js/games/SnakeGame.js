/**
 * SnakeGame — Neon Snake on HTML5 Canvas
 */
class SnakeGame extends GameEngine {
    constructor() {
        super();
        this.canvas  = document.getElementById('snake-canvas');
        this.ctx     = this.canvas.getContext('2d');
        // Responsive sizing
        const area   = document.getElementById('snake-game-area');
        const maxW   = Math.min(area.clientWidth || 600, 600);
        const maxH   = Math.min(window.innerHeight * 0.55, 480);
        this.CELL    = Math.floor(Math.min(maxW / 25, maxH / 20));
        this.COLS    = Math.floor(maxW / this.CELL);
        this.ROWS    = Math.floor(maxH / this.CELL);
        this.canvas.width  = this.COLS * this.CELL;
        this.canvas.height = this.ROWS * this.CELL;
        this._bindEvents();
    }

    _reset() {
        this.snake    = [{ x:12, y:10 }, { x:11, y:10 }, { x:10, y:10 }];
        this.dir      = { x:1, y:0 };
        this.nextDir  = { x:1, y:0 };
        this.food     = this._spawnFood();
        this.powerup  = null;
        this.score    = 0;
        this.length   = 3;
        this.speed    = 1;
        this.timer    = 0;
        this.interval = 150; // ms per step
        this.activePowerup = null;
        this.powerupTimer  = 0;
        this.noPowerupRun  = true;
        this._updateUI();
    }

    _bindEvents() {
        this._keyHandler = (e) => {
            const map = {
                ArrowUp:'U', ArrowDown:'D', ArrowLeft:'L', ArrowRight:'R',
                w:'U', s:'D', a:'L', d:'R',
                W:'U', S:'D', A:'L', D:'R'
            };
            const d = map[e.key];
            if (!d) return;
            e.preventDefault();
            const dirs = { U:{x:0,y:-1}, D:{x:0,y:1}, L:{x:-1,y:0}, R:{x:1,y:0} };
            const nd = dirs[d];
            // Prevent 180° reversal
            if (nd.x !== -this.dir.x || nd.y !== -this.dir.y) {
                this.nextDir = nd;
                AudioManager.turn();
            }
        };
        document.addEventListener('keydown', this._keyHandler);
    }

    _spawnFood() {
        let pos;
        do {
            pos = { x: Math.floor(Math.random() * this.COLS), y: Math.floor(Math.random() * this.ROWS) };
        } while (this.snake && this.snake.some(s => s.x === pos.x && s.y === pos.y));
        return pos;
    }

    _spawnPowerup() {
        if (this.powerup) return;
        const types = ['speed', 'ghost', 'multi'];
        const type  = types[Math.floor(Math.random() * types.length)];
        let pos;
        do {
            pos = { x: Math.floor(Math.random() * this.COLS), y: Math.floor(Math.random() * this.ROWS) };
        } while (this.snake.some(s => s.x === pos.x && s.y === pos.y));
        this.powerup = { ...pos, type };
        this.powerupGlowTimer = 0;
    }

    update(delta) {
        this.timer += delta;
        if (this.powerup) { this.powerupGlowTimer = (this.powerupGlowTimer || 0) + delta; }
        if (this.activePowerup) {
            this.powerupTimer -= delta;
            if (this.powerupTimer <= 0) this._deactivatePowerup();
        }
        if (this.timer < this.interval) return;
        this.timer -= this.interval;
        this.dir = { ...this.nextDir };

        const head = { x: this.snake[0].x + this.dir.x, y: this.snake[0].y + this.dir.y };

        // Wall collision (ghost mode passes through)
        if (this.activePowerup !== 'ghost') {
            if (head.x < 0 || head.x >= this.COLS || head.y < 0 || head.y >= this.ROWS) return this._die();
            if (this.snake.some(s => s.x === head.x && s.y === head.y)) return this._die();
        } else {
            head.x = (head.x + this.COLS) % this.COLS;
            head.y = (head.y + this.ROWS) % this.ROWS;
        }

        this.snake.unshift(head);

        // Food check
        if (head.x === this.food.x && head.y === this.food.y) {
            const pts = this.activePowerup === 'multi' ? 20 : 10;
            this.score += pts;
            this.length++;
            AudioManager.eat();
            const rect = this.canvas.getBoundingClientRect();
            ParticleSystem.burst(rect.left + head.x * this.CELL, rect.top + head.y * this.CELL, '#39ff14', 8);
            ParticleSystem.scoreFloat(rect.left + head.x * this.CELL, rect.top + head.y * this.CELL, `+${pts}`, '#39ff14');
            this.food = this._spawnFood();
            // Speed up every 5 food
            if (this.length % 5 === 0) {
                this.interval = Math.max(60, this.interval - 10);
                this.speed = parseFloat((150 / this.interval).toFixed(1));
            }
            // Maybe spawn powerup
            if (Math.random() < 0.25 && !this.powerup) this._spawnPowerup();
        } else {
            this.snake.pop();
        }

        // Powerup check
        if (this.powerup && head.x === this.powerup.x && head.y === this.powerup.y) {
            this._activatePowerup(this.powerup.type);
            this.powerup = null;
            this.noPowerupRun = false;
        }

        this._updateUI();
        this._checkAchievements();
    }

    _activatePowerup(type) {
        this.activePowerup = type;
        this.powerupTimer  = 5000;
        AudioManager.powerup();
        const rect = this.canvas.getBoundingClientRect();
        const colors = { speed:'#ffe600', ghost:'#bf00ff', multi:'#ff2d95' };
        ParticleSystem.burst(rect.left + this.canvas.width/2, rect.top + this.canvas.height/2, colors[type], 16);
    }

    _deactivatePowerup() {
        if (this.activePowerup === 'speed') this.interval += 0; // speed kept
        this.activePowerup = null;
        this.powerupTimer  = 0;
        this._updateUI();
    }

    _die() {
        this.stop();
        AudioManager.gameOver();
        if (typeof ReactionSystem !== 'undefined') ReactionSystem.mistake();
        const isNew = StorageManager.setHighScore('snake', this.score);
        document.getElementById('snake-final-score').textContent = this.score;
        document.getElementById('snake-high-msg').style.display  = isNew ? 'block' : 'none';
        document.getElementById('snake-gameover').style.display  = 'flex';
        StorageManager.updateStats({ gamesPlayed:1, totalScore: this.score });
        AchievementSystem.check('first_blood');
        if (this.score >= 500)           AchievementSystem.check('snake_charmer');
        if (this.noPowerupRun && this.score >= 200) AchievementSystem.check('untouchable');
        const stats = StorageManager.getStats();
        if (stats.totalScore >= 10000) AchievementSystem.check('high_roller');
        this._checkAllGamesPlayed();
        App.refreshHub();
    }

    _checkAchievements() {}

    _checkAllGamesPlayed() {
        const games = ['snake','memory','trivia','reflex','typeracer'];
        const allPlayed = games.every(g => StorageManager.getHighScore(g) > 0 ||
            (g === 'reflex' && StorageManager.get('hs_reflex', 9999) < 9999));
        if (allPlayed) AchievementSystem.check('arcade_veteran');
    }

    _updateUI() {
        document.getElementById('snake-score').textContent  = this.score;
        document.getElementById('snake-length').textContent = this.length;
        document.getElementById('snake-speed').textContent  = this.speed + 'x';
        document.getElementById('snake-powerup').textContent = this.activePowerup
            ? `${this.activePowerup.toUpperCase()} ${Math.ceil(this.powerupTimer/1000)}s`
            : 'NONE';
    }

    render() {
        const { ctx, CELL, COLS, ROWS } = this;
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Grid
        ctx.strokeStyle = 'rgba(0,240,255,0.04)';
        ctx.lineWidth = 1;
        for (let x = 0; x <= COLS; x++) {
            ctx.beginPath(); ctx.moveTo(x*CELL,0); ctx.lineTo(x*CELL,ROWS*CELL); ctx.stroke();
        }
        for (let y = 0; y <= ROWS; y++) {
            ctx.beginPath(); ctx.moveTo(0,y*CELL); ctx.lineTo(COLS*CELL,y*CELL); ctx.stroke();
        }

        // Food
        ctx.shadowBlur  = 15;
        ctx.shadowColor = '#39ff14';
        ctx.fillStyle   = '#39ff14';
        ctx.beginPath();
        ctx.arc(this.food.x*CELL+CELL/2, this.food.y*CELL+CELL/2, CELL/2-2, 0, Math.PI*2);
        ctx.fill();

        // Powerup
        if (this.powerup) {
            const colors = { speed:'#ffe600', ghost:'#bf00ff', multi:'#ff2d95' };
            const emojis = { speed:'⚡', ghost:'👻', multi:'✖' };
            ctx.shadowColor = colors[this.powerup.type];
            ctx.shadowBlur  = 18 + Math.sin((this.powerupGlowTimer || 0) / 200) * 8;
            ctx.fillStyle   = colors[this.powerup.type];
            ctx.fillRect(this.powerup.x*CELL+2, this.powerup.y*CELL+2, CELL-4, CELL-4);
            ctx.shadowBlur = 0;
            ctx.fillStyle  = '#000';
            ctx.font = `${CELL-6}px sans-serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(emojis[this.powerup.type], this.powerup.x*CELL+CELL/2, this.powerup.y*CELL+CELL/2+1);
        }

        // Snake
        const snakeColor = this.activePowerup === 'ghost' ? '#bf00ff' :
                           this.activePowerup === 'speed' ? '#ffe600' :
                           this.activePowerup === 'multi' ? '#ff2d95' : '#00f0ff';
        this.snake.forEach((seg, i) => {
            const alpha = Math.max(0.3, 1 - i * 0.04);
            ctx.shadowBlur  = i === 0 ? 20 : 8;
            ctx.shadowColor = snakeColor;
            ctx.fillStyle   = i === 0 ? snakeColor : `rgba(0,240,255,${alpha})`;
            ctx.fillRect(seg.x*CELL+1, seg.y*CELL+1, CELL-2, CELL-2);
        });

        ctx.shadowBlur = 0;
    }

    destroy() {
        super.destroy();
        document.removeEventListener('keydown', this._keyHandler);
    }
}
