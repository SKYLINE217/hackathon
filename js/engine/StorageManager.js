/**
 * StorageManager — LocalStorage wrapper for Neon Arcade
 */
const StorageManager = {
    PREFIX: 'neonarcade_',

    get(key, fallback = null) {
        try {
            const val = localStorage.getItem(this.PREFIX + key);
            return val !== null ? JSON.parse(val) : fallback;
        } catch { return fallback; }
    },

    set(key, value) {
        try {
            localStorage.setItem(this.PREFIX + key, JSON.stringify(value));
        } catch (e) { console.warn('Storage write failed:', e); }
    },

    getHighScore(game) {
        return this.get(`hs_${game}`, 0);
    },

    setHighScore(game, score) {
        const current = this.getHighScore(game);
        if (score > current) {
            this.set(`hs_${game}`, score);
            return true; // new high score
        }
        return false;
    },

    getStats() {
        return this.get('stats', { gamesPlayed: 0, totalScore: 0, totalTime: 0 });
    },

    updateStats(delta) {
        const stats = this.getStats();
        if (delta.gamesPlayed) stats.gamesPlayed += delta.gamesPlayed;
        if (delta.totalScore)  stats.totalScore  += delta.totalScore;
        if (delta.totalTime)   stats.totalTime   += delta.totalTime;
        this.set('stats', stats);
        return stats;
    },

    getUnlockedAchievements() {
        return this.get('achievements', []);
    },

    unlockAchievement(id) {
        const unlocked = this.getUnlockedAchievements();
        if (!unlocked.includes(id)) {
            unlocked.push(id);
            this.set('achievements', unlocked);
            return true;
        }
        return false;
    },

    getSettings() {
        return this.get('settings', { sound: true });
    },

    setSettings(settings) {
        this.set('settings', settings);
    }
};
