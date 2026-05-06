/**
 * AchievementSystem — tracks and displays achievements
 */
const ACHIEVEMENTS = [
    { id:'first_blood',     icon:'🎮', name:'First Blood',        desc:'Complete any game' },
    { id:'snake_charmer',   icon:'🐍', name:'Snake Charmer',       desc:'Score 500+ in Snake Neon' },
    { id:'perfect_memory',  icon:'🧠', name:'Perfect Memory',      desc:'Clear Memory level 10+' },
    { id:'trivia_master',   icon:'🧩', name:'Trivia Master',       desc:'10/10 correct in Trivia' },
    { id:'lightning_reflex',icon:'⚡', name:'Lightning Reflexes',  desc:'Sub-200ms avg in Reflex' },
    { id:'speed_demon',     icon:'⌨️', name:'Speed Demon',         desc:'80+ WPM in Type Racer' },
    { id:'arcade_veteran',  icon:'🕹️', name:'Arcade Veteran',      desc:'Play all 5 games' },
    { id:'high_roller',     icon:'💰', name:'High Roller',         desc:'10,000 total points' },
    { id:'perfectionist',   icon:'🎯', name:'Perfectionist',       desc:'100% accuracy in Type Racer' },
    { id:'streak_master',   icon:'🔥', name:'Streak Master',       desc:'5+ correct streak in Trivia' },
    { id:'untouchable',     icon:'👻', name:'Untouchable',         desc:'Snake score 200+ without powerups' },
    { id:'speed_reader',    icon:'📖', name:'Speed Reader',        desc:'100+ WPM in Type Racer' },
];

const AchievementSystem = {
    check(id) {
        const ach = ACHIEVEMENTS.find(a => a.id === id);
        if (!ach) return;
        const isNew = StorageManager.unlockAchievement(id);
        if (isNew) {
            this._showToast(ach);
            AudioManager.achievement();
            if (typeof ReactionSystem !== 'undefined') ReactionSystem.achievement();
            App.refreshHub();
        }
    },

    _showToast(ach) {
        const container = document.getElementById('achievement-toast-container');
        const toast = document.createElement('div');
        toast.className = 'achievement-toast';
        toast.innerHTML = `
            <span class="toast-icon">${ach.icon}</span>
            <div class="toast-content">
                <span class="toast-label">ACHIEVEMENT UNLOCKED</span>
                <span class="toast-name">${ach.name}</span>
            </div>
        `;
        container.appendChild(toast);
        setTimeout(() => toast.remove(), 4000);
    },

    renderGrid() {
        const grid = document.getElementById('achievements-grid');
        if (!grid) return;
        const unlocked = StorageManager.getUnlockedAchievements();
        grid.innerHTML = ACHIEVEMENTS.map(a => `
            <div class="achievement-badge ${unlocked.includes(a.id) ? 'unlocked' : 'locked'}" title="${a.name}: ${a.desc}">
                ${a.icon}
                <div class="badge-tooltip">${a.name}</div>
            </div>
        `).join('');
    }
};
