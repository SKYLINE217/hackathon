/**
 * TriviaGame — Cyberpunk Trivia Blitz
 * Fixed:
 *  - _correctDisplayPos initialized in constructor (no undefined crash)
 *  - start() made synchronous (no async/await race)
 *  - Null guard on timer fill element
 *  - Category pool fallback if filter yields < 5 questions
 *  - Proper destroy() clears both timeout and pending nextQuestion setTimeout
 *  - answered flag reset is atomic with timer start
 */
class TriviaGame {
    constructor() {
        this.questions        = [];
        this.current          = 0;
        this.score            = 0;
        this.streak           = 0;
        this.bestStreak       = 0;
        this.correct          = 0;
        this.total            = 10;
        this.timerDur         = 15000;
        this.timerStart       = 0;
        this._timerTimeout    = null;  // the 15s countdown timeout
        this._nextTimeout     = null;  // the 1.2s "next question" timeout
        this.answered         = false;
        this.category         = 'all';
        this._correctDisplayPos = -1; // always initialized
    }

    setCategory(cat) { this.category = cat; }

    // ---- Question Bank (synchronous — no async needed) ----
    _getAllQuestions() {
        return [
            // SCIENCE
            {q:'What is the chemical symbol for Gold?',                   opts:['Au','Ag','Fe','Cu'],                                         ans:0, cat:'science'},
            {q:'How many bones are in the adult human body?',             opts:['206','208','196','214'],                                      ans:0, cat:'science'},
            {q:'What planet is closest to the Sun?',                      opts:['Mercury','Venus','Mars','Earth'],                             ans:0, cat:'science'},
            {q:'What gas do plants absorb from the atmosphere?',          opts:['CO₂','O₂','N₂','H₂'],                                        ans:0, cat:'science'},
            {q:'What is the speed of light (approx) in km/s?',           opts:['300,000','150,000','450,000','100,000'],                       ans:0, cat:'science'},
            {q:'DNA stands for?',                                          opts:['Deoxyribonucleic Acid','Diribose Nuclear Acid','Dinucleotide Acid','None'], ans:0, cat:'science'},
            {q:'What is the powerhouse of the cell?',                     opts:['Mitochondria','Nucleus','Ribosome','Golgi'],                   ans:0, cat:'science'},
            {q:'What force keeps planets in orbit?',                      opts:['Gravity','Magnetism','Friction','Inertia'],                    ans:0, cat:'science'},
            {q:'What is the atomic number of Carbon?',                    opts:['6','8','12','14'],                                            ans:0, cat:'science'},
            {q:'Water boils at what temperature (°C) at sea level?',     opts:['100','90','80','110'],                                         ans:0, cat:'science'},
            // TECH
            {q:'What does CPU stand for?',                                 opts:['Central Processing Unit','Core Parallel Unit','Central Program Utility','Compute Process Unit'], ans:0, cat:'tech'},
            {q:'What language runs natively in browsers?',                 opts:['JavaScript','Python','Java','C++'],                           ans:0, cat:'tech'},
            {q:'What does HTTP stand for?',                                opts:['HyperText Transfer Protocol','High Transfer Text Protocol','HyperText Transport Program','None'], ans:0, cat:'tech'},
            {q:'Which company created the iPhone?',                        opts:['Apple','Samsung','Google','Sony'],                            ans:0, cat:'tech'},
            {q:'What year was the World Wide Web invented?',               opts:['1989','1992','1985','1995'],                                  ans:0, cat:'tech'},
            {q:"What is 'RAM' primarily used for?",                        opts:['Temporary storage','Permanent storage','Processing','Display'],ans:0, cat:'tech'},
            {q:'Which protocol assigns IP addresses automatically?',        opts:['DHCP','DNS','FTP','SMTP'],                                   ans:0, cat:'tech'},
            {q:'Python was created by?',                                    opts:['Guido van Rossum','Linus Torvalds','Dennis Ritchie','James Gosling'], ans:0, cat:'tech'},
            {q:'What does CSS stand for?',                                  opts:['Cascading Style Sheets','Computer Style Syntax','Creative Style System','Code Style Sheets'], ans:0, cat:'tech'},
            {q:'Which data structure uses LIFO order?',                     opts:['Stack','Queue','Heap','Tree'],                               ans:0, cat:'tech'},
            // GAMING
            {q:"In what game do you 'build' with blocks and survive nights?",opts:['Minecraft','Terraria','Roblox','Fortnite'],                 ans:0, cat:'gaming'},
            {q:"Who is Mario's brother?",                                   opts:['Luigi','Wario','Waluigi','Toad'],                            ans:0, cat:'gaming'},
            {q:'What is the best-selling video game of all time?',          opts:['Minecraft','Tetris','GTA V','Wii Sports'],                   ans:0, cat:'gaming'},
            {q:'League of Legends is developed by?',                        opts:['Riot Games','Valve','Blizzard','Epic Games'],                ans:0, cat:'gaming'},
            {q:'In Pokémon, what type is effective against Water?',          opts:['Electric','Fire','Ground','Both Electric & Grass'],         ans:3, cat:'gaming'},
            {q:"What game features 'The Cake is a Lie'?",                  opts:['Portal','Half-Life',"Mirror's Edge",'Bioshock'],             ans:0, cat:'gaming'},
            {q:"Which character says 'Stay a while and listen'?",          opts:['Deckard Cain','Tyrael','Diablo','Belial'],                    ans:0, cat:'gaming'},
            {q:'Fortnite was developed by?',                               opts:['Epic Games','EA','Riot Games','Ubisoft'],                     ans:0, cat:'gaming'},
            {q:'In what game do you play as Master Chief?',                opts:['Halo','Doom','Gears of War','Mass Effect'],                   ans:0, cat:'gaming'},
            {q:'What is the name of Link\'s sword in Zelda?',              opts:['Master Sword','Excalibur','Soul Edge','Buster Sword'],        ans:0, cat:'gaming'},
            // HISTORY
            {q:'In what year did World War II end?',                       opts:['1945','1944','1943','1946'],                                  ans:0, cat:'history'},
            {q:'Who was the first US President?',                          opts:['George Washington','Abraham Lincoln','Thomas Jefferson','John Adams'], ans:0, cat:'history'},
            {q:'The Great Wall of China was primarily built to protect against?', opts:['Mongol invasions','Japanese attacks','Flooding','Trade disputes'], ans:0, cat:'history'},
            {q:'What ancient wonder was located in Alexandria?',           opts:['The Lighthouse','The Colossus','The Pyramids','The Hanging Gardens'], ans:0, cat:'history'},
            {q:'Who painted the Mona Lisa?',                              opts:['Leonardo da Vinci','Michelangelo','Raphael','Botticelli'],     ans:0, cat:'history'},
            {q:'The Berlin Wall fell in?',                                 opts:['1989','1991','1985','1993'],                                  ans:0, cat:'history'},
            {q:'In which country did World War I begin?',                  opts:['Austria-Hungary','Germany','France','Russia'],                ans:0, cat:'history'},
            {q:'Who was the first man to walk on the Moon?',               opts:['Neil Armstrong','Buzz Aldrin','Yuri Gagarin','Alan Shepard'],  ans:0, cat:'history'},
            // POP CULTURE
            {q:'Who played Iron Man in the MCU?',                         opts:['Robert Downey Jr.','Chris Evans','Mark Ruffalo','Chris Hemsworth'], ans:0, cat:'popculture'},
            {q:"'The Simpsons' family lives in which city?",              opts:['Springfield','Shelbyville','Ogdenville','North Haverbrook'],   ans:0, cat:'popculture'},
            {q:'What is the highest-grossing film of all time?',           opts:['Avatar','Avengers: Endgame','Titanic','Star Wars'],           ans:0, cat:'popculture'},
            {q:"Who sang 'Shape of You'?",                                 opts:['Ed Sheeran','Justin Bieber','Sam Smith','Bruno Mars'],        ans:0, cat:'popculture'},
            {q:'Breaking Bad is set in which US city?',                   opts:['Albuquerque','El Paso','Phoenix','Las Vegas'],                 ans:0, cat:'popculture'},
            {q:"'Winter is Coming' is the motto of which Game of Thrones house?", opts:['Stark','Lannister','Targaryen','Baratheon'],          ans:0, cat:'popculture'},
            {q:'Which actor plays Jack Sparrow in Pirates of the Caribbean?', opts:['Johnny Depp','Orlando Bloom','Geoffrey Rush','Keira Knightley'], ans:0, cat:'popculture'},
            {q:'How many seasons does Breaking Bad have?',                 opts:['5','4','6','3'],                                             ans:0, cat:'popculture'},
        ];
    }

    _shuffle(arr) {
        const a = [...arr];
        for (let i = a.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [a[i], a[j]] = [a[j], a[i]];
        }
        return a;
    }

    // ---- Public: Start ----
    start() {
        // Synchronous — no async needed since questions are inline
        const all  = this._getAllQuestions();
        let pool   = this.category === 'all' ? all : all.filter(q => q.cat === this.category);

        // Fallback: if category has fewer than 5 questions, use all
        if (pool.length < 5) pool = all;

        this.questions    = this._shuffle(pool).slice(0, this.total);
        this.current      = 0;
        this.score        = 0;
        this.streak       = 0;
        this.bestStreak   = 0;
        this.correct      = 0;
        this._correctDisplayPos = -1;

        this._stopAllTimers();

        const el = id => document.getElementById(id);
        if (el('trivia-gameover')) el('trivia-gameover').style.display = 'none';
        if (el('trivia-score'))    el('trivia-score').textContent = '0';
        if (el('trivia-streak'))   el('trivia-streak').textContent = '🔥 0';
        if (el('trivia-total-q'))  el('trivia-total-q').textContent = this.questions.length;

        this._showQuestion();
    }

    // ---- Question Display ----
    _showQuestion() {
        if (this.current >= this.questions.length) {
            this._endGame();
            return;
        }

        const q = this.questions[this.current];

        const el = id => document.getElementById(id);
        if (el('trivia-current-q'))    el('trivia-current-q').textContent    = this.current + 1;
        if (el('trivia-question-text'))el('trivia-question-text').textContent = q.q;
        if (el('trivia-category'))     el('trivia-category').textContent      = q.cat.toUpperCase();

        // Shuffle which display position each answer goes in
        const indices = this._shuffle([0, 1, 2, 3]);
        const opts    = document.querySelectorAll('.trivia-option');

        indices.forEach((optIdx, displayPos) => {
            const textEl = el(`trivia-opt-${displayPos}`);
            if (textEl) textEl.textContent = q.opts[optIdx];
            if (opts[displayPos]) opts[displayPos].dataset.answer = String(optIdx);
        });

        // Track which display position has the correct answer
        this._correctDisplayPos = indices.indexOf(q.ans);

        // Reset option visual states
        opts.forEach(o => o.classList.remove('correct', 'wrong', 'disabled'));

        this.answered = false;
        this._startTimer();
    }

    // ---- Timer ----
    _startTimer() {
        this._stopAllTimers();
        this.timerStart = performance.now();

        const fill = document.getElementById('trivia-timer-fill');
        if (fill) {
            fill.style.transition = 'none';
            fill.style.width      = '100%';
            // Force reflow so transition applies fresh
            void fill.offsetWidth;
            fill.style.transition = `width ${this.timerDur}ms linear`;
            fill.style.width      = '0%';
        }

        this._timerTimeout = setTimeout(() => {
            if (!this.answered) this._onTimeout();
        }, this.timerDur);
    }

    _stopAllTimers() {
        clearTimeout(this._timerTimeout);
        clearTimeout(this._nextTimeout);
        this._timerTimeout = null;
        this._nextTimeout  = null;
    }

    // ---- Answer Handling ----
    onAnswer(displayPos) {
        if (this.answered) return;
        // Guard: game might have ended
        if (this.current >= this.questions.length) return;

        this.answered = true;
        this._stopAllTimers();

        const elapsed   = performance.now() - this.timerStart;
        const timeBonus = Math.floor(Math.max(0, (this.timerDur - elapsed) / 100));
        const q         = this.questions[this.current];
        const opts      = document.querySelectorAll('.trivia-option');

        // Validate displayPos
        if (displayPos < 0 || displayPos > 3 || !opts[displayPos]) return;

        const selectedAnswer = parseInt(opts[displayPos].dataset.answer, 10);
        opts.forEach(o => o.classList.add('disabled'));

        if (selectedAnswer === q.ans) {
            opts[displayPos].classList.add('correct');
            const pts = 100 + timeBonus;
            this.score  += pts;
            this.correct++;
            this.streak++;
            this.bestStreak = Math.max(this.bestStreak, this.streak);
            AudioManager.correct();
            const rect = opts[displayPos].getBoundingClientRect();
            ParticleSystem.burst(rect.left + rect.width / 2, rect.top, '#39ff14', 10);
            ParticleSystem.scoreFloat(rect.left + rect.width / 2, rect.top, `+${pts}`, '#39ff14');
        } else {
            opts[displayPos].classList.add('wrong');
            if (this._correctDisplayPos >= 0 && opts[this._correctDisplayPos]) {
                opts[this._correctDisplayPos].classList.add('correct');
            }
            this.streak = 0;
            AudioManager.wrong();
            if (typeof ReactionSystem !== 'undefined') ReactionSystem.mistake();
        }

        const scoreEl  = document.getElementById('trivia-score');
        const streakEl = document.getElementById('trivia-streak');
        if (scoreEl)  scoreEl.textContent  = this.score;
        if (streakEl) streakEl.textContent = `🔥 ${this.streak}`;

        this._nextTimeout = setTimeout(() => {
            this.current++;
            this._showQuestion();
        }, 1200);
    }

    _onTimeout() {
        this.answered = true;
        this._stopAllTimers();
        this.streak = 0;

        const opts = document.querySelectorAll('.trivia-option');
        opts.forEach(o => o.classList.add('disabled'));
        if (this._correctDisplayPos >= 0 && opts[this._correctDisplayPos]) {
            opts[this._correctDisplayPos].classList.add('correct');
        }

        AudioManager.wrong();
        if (typeof ReactionSystem !== 'undefined') ReactionSystem.mistake();
        const streakEl = document.getElementById('trivia-streak');
        if (streakEl) streakEl.textContent = '🔥 0';

        this._nextTimeout = setTimeout(() => {
            this.current++;
            this._showQuestion();
        }, 1200);
    }

    // ---- End Game ----
    _endGame() {
        this._stopAllTimers();
        const isNew = StorageManager.setHighScore('trivia', this.score);
        const acc   = this.questions.length > 0
            ? Math.round((this.correct / this.questions.length) * 100)
            : 0;

        const el = id => document.getElementById(id);
        if (el('trivia-final-score'))  el('trivia-final-score').textContent  = this.score;
        if (el('trivia-accuracy'))     el('trivia-accuracy').textContent      = `${acc}%`;
        if (el('trivia-best-streak'))  el('trivia-best-streak').textContent   = this.bestStreak;
        if (el('trivia-high-msg'))     el('trivia-high-msg').style.display    = isNew ? 'block' : 'none';
        if (el('trivia-gameover'))     el('trivia-gameover').style.display    = 'flex';

        StorageManager.updateStats({ gamesPlayed: 1, totalScore: this.score });
        AchievementSystem.check('first_blood');
        if (this.correct === this.questions.length) AchievementSystem.check('trivia_master');
        if (this.bestStreak >= 5)                   AchievementSystem.check('streak_master');
        const stats = StorageManager.getStats();
        if (stats.totalScore >= 10000) AchievementSystem.check('high_roller');
        App.refreshHub();
    }

    // ---- Cleanup ----
    destroy() {
        this._stopAllTimers();
        this.answered = true; // prevent any pending callbacks from firing
    }
}
