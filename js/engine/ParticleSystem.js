/**
 * ParticleSystem — lightweight canvas-free CSS particle bursts
 */
const ParticleSystem = {
    burst(x, y, color = '#00f0ff', count = 12) {
        for (let i = 0; i < count; i++) {
            const p = document.createElement('div');
            p.style.cssText = `
                position:fixed; left:${x}px; top:${y}px;
                width:4px; height:4px; border-radius:50%;
                background:${color}; pointer-events:none;
                z-index:9999; box-shadow:0 0 6px ${color};
            `;
            const angle  = (i / count) * Math.PI * 2;
            const speed  = 60 + Math.random() * 80;
            const dx     = Math.cos(angle) * speed;
            const dy     = Math.sin(angle) * speed;
            document.body.appendChild(p);
            p.animate([
                { transform: 'translate(0,0)', opacity: 1 },
                { transform: `translate(${dx}px,${dy}px)`, opacity: 0 }
            ], { duration: 600 + Math.random() * 400, easing: 'cubic-bezier(0,0,0.2,1)' })
            .onfinish = () => p.remove();
        }
    },

    scoreFloat(x, y, text, color = '#39ff14') {
        const el = document.createElement('div');
        el.textContent = text;
        el.style.cssText = `
            position:fixed; left:${x}px; top:${y}px;
            font-family:'Orbitron',sans-serif; font-size:1.2rem; font-weight:900;
            color:${color}; text-shadow:0 0 8px ${color};
            pointer-events:none; z-index:9999; white-space:nowrap;
            line-height: 1.2; padding: 0.1em;
        `;
        document.body.appendChild(el);
        el.animate([
            { transform:'translateY(0)', opacity:1 },
            { transform:'translateY(-60px)', opacity:0 }
        ], { duration: 900, easing:'ease-out' })
        .onfinish = () => el.remove();
    }
};
