/**
 * ReactionSystem — Injects animated SVG characters for brief reactions
 */
const ReactionSystem = {
    init() {
        if (document.getElementById('reaction-styles')) return;
        const style = document.createElement('style');
        style.id = 'reaction-styles';
        style.textContent = `
            .reaction-char {
                position: fixed;
                z-index: 10000;
                pointer-events: none;
                transition: opacity 0.5s ease;
            }
            .reaction-mistake {
                bottom: -150px;
                left: 10%;
                animation: pop-up-mistake 1.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
                filter: drop-shadow(0 0 15px var(--neon-red));
            }
            @keyframes pop-up-mistake {
                0% { bottom: -150px; transform: rotate(-20deg); }
                10% { bottom: 20px; transform: rotate(10deg); }
                15% { transform: rotate(-10deg) translateX(-5px); }
                20% { transform: rotate(0deg) translateX(5px); }
                25% { transform: rotate(0deg) translateX(0); }
                80% { bottom: 20px; }
                100% { bottom: -150px; }
            }

            .reaction-win {
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%) scale(0);
                animation: pop-up-win 2s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
                filter: drop-shadow(0 0 20px var(--neon-yellow));
            }
            @keyframes pop-up-win {
                0% { transform: translate(-50%, -50%) scale(0) rotate(-180deg); opacity: 0; }
                20% { transform: translate(-50%, -50%) scale(1.5) rotate(0deg); opacity: 1; }
                80% { transform: translate(-50%, -50%) scale(1.5) rotate(10deg); opacity: 1; }
                100% { transform: translate(-50%, -50%) scale(0) rotate(180deg); opacity: 0; }
            }

            .reaction-achievement {
                top: 20px;
                right: -150px;
                animation: slide-in-achiev 3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
                filter: drop-shadow(0 0 15px var(--neon-cyan));
            }
            @keyframes slide-in-achiev {
                0% { right: -150px; transform: rotate(45deg); }
                15% { right: 20px; transform: rotate(0deg); }
                85% { right: 20px; transform: rotate(0deg); }
                100% { right: -150px; transform: rotate(45deg); }
            }
        `;
        document.head.appendChild(style);
    },

    _createContainer(className, innerHTML, duration) {
        this.init();
        const el = document.createElement('div');
        el.className = `reaction-char ${className}`;
        el.innerHTML = innerHTML;
        document.body.appendChild(el);
        setTimeout(() => {
            el.style.opacity = '0';
            setTimeout(() => el.remove(), 500);
        }, duration);
    },

    mistake() {
        this._createContainer('reaction-mistake', `
            <svg viewBox="0 0 100 100" width="120" height="120">
                <rect x="20" y="20" width="60" height="60" rx="10" fill="#000" stroke="var(--neon-red)" stroke-width="4"/>
                <!-- X Eyes -->
                <line x1="35" y1="40" x2="45" y2="50" stroke="var(--neon-red)" stroke-width="4"/>
                <line x1="45" y1="40" x2="35" y2="50" stroke="var(--neon-red)" stroke-width="4"/>
                <line x1="65" y1="40" x2="55" y2="50" stroke="var(--neon-red)" stroke-width="4"/>
                <line x1="55" y1="40" x2="65" y2="50" stroke="var(--neon-red)" stroke-width="4"/>
                <!-- Frown -->
                <path d="M 35 70 Q 50 55 65 70" fill="none" stroke="var(--neon-red)" stroke-width="4" stroke-linecap="round"/>
            </svg>
        `, 1500);
    },

    win() {
        this._createContainer('reaction-win', `
            <svg viewBox="0 0 100 100" width="140" height="140">
                <polygon points="50,10 61,35 88,35 66,54 74,80 50,65 26,80 34,54 12,35 39,35" fill="var(--neon-yellow)"/>
                <circle cx="40" cy="45" r="4" fill="#000"/>
                <circle cx="60" cy="45" r="4" fill="#000"/>
                <path d="M 40 60 Q 50 70 60 60" fill="none" stroke="#000" stroke-width="4" stroke-linecap="round"/>
            </svg>
        `, 2000);
    },

    achievement() {
        this._createContainer('reaction-achievement', `
            <svg viewBox="0 0 100 100" width="80" height="80">
                <circle cx="50" cy="50" r="40" fill="#000" stroke="var(--neon-cyan)" stroke-width="4"/>
                <!-- Smiley -->
                <circle cx="35" cy="40" r="5" fill="var(--neon-cyan)"/>
                <circle cx="65" cy="40" r="5" fill="var(--neon-cyan)"/>
                <path d="M 30 60 Q 50 80 70 60" fill="none" stroke="var(--neon-cyan)" stroke-width="4" stroke-linecap="round"/>
            </svg>
        `, 3000);
    }
};
