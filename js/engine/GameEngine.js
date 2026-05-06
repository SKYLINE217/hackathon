/**
 * GameEngine — base class for all games
 */
class GameEngine {
    constructor() {
        this.isRunning = false;
        this.lastTime  = 0;
        this._rafId    = null;
    }

    start() {
        this.isRunning = true;
        this.lastTime  = performance.now();
        this._rafId    = requestAnimationFrame(t => this._loop(t));
    }

    _loop(timestamp) {
        if (!this.isRunning) return;
        const delta = Math.min(timestamp - this.lastTime, 100); // cap at 100ms
        this.lastTime = timestamp;
        this.update(delta);
        this.render();
        this._rafId = requestAnimationFrame(t => this._loop(t));
    }

    stop() {
        this.isRunning = false;
        if (this._rafId) {
            cancelAnimationFrame(this._rafId);
            this._rafId = null;
        }
    }

    update(delta) {}
    render() {}
    destroy() { this.stop(); }
}
