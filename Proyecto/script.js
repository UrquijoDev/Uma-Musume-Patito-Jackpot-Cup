/* --- AUDIO --- */
const mamboSound = new Audio('assets/SFX/MamboSound.mp3');
const mainTheme = new Audio('assets/SFX/MainTheme.mp3');
const miniGameMusic = new Audio('assets/SFX/MF.mp3');
const shopMusic = new Audio('assets/SFX/Shop.mp3');

// Configurar volumen (0.3 = 30% del volumen original)
mamboSound.volume = 0.3;
mainTheme.volume = 0.3;
miniGameMusic.volume = 0.3;
shopMusic.volume = 0.3;

// Configurar los audios para que se repitan en bucle
mainTheme.loop = true;
miniGameMusic.loop = true;
shopMusic.loop = true;

// Variable para llevar el control de la música actual
let currentMusic = null;

function playMusic(music) {
    // Si ya está sonando esa música, no hacemos nada
    if (currentMusic === music) return;

    // Pausar todas las músicas
    if (currentMusic) {
        currentMusic.pause();
        currentMusic.currentTime = 0;
    }

    // Reproducir la nueva música
    music.currentTime = 0;
    music.play().catch(e => console.log("No se pudo reproducir la música:", e));
    currentMusic = music;
}

function stopMusic() {
    if (currentMusic) {
        currentMusic.pause();
        currentMusic.currentTime = 0;
        currentMusic = null;
    }
}

/* --- GAME STATE --- */
const app = {
    carrots: 100,
    debt: 50000,
    paid: 0,
    inventory: { helmet: 0, glasses: 0, insurance: 0 },

    init: function () {
        this.updateUI();
        // Reproducir música principal inmediatamente
        playMusic(mainTheme);
        story.play('intro');
    },

    updateUI: function () {
        document.getElementById('ui-carrots').textContent = this.carrots;
        document.getElementById('ui-debt').textContent = this.debt;
        const totalCapacidad = this.paid + this.carrots;
        document.getElementById('ui-paid').textContent = totalCapacidad;
        const pct = Math.min(100, (totalCapacidad / this.debt) * 100);
        document.getElementById('ui-progress').style.width = pct + '%';
    },

    showMenu: function () {
        hideAllViews();
        document.getElementById('view-menu').classList.remove('hidden');
        host.showCorner(); // Mambo vuelve
        playMusic(mainTheme);
    },

    showShop: function () {
        hideAllViews();
        document.getElementById('view-shop').classList.remove('hidden');
        host.hideCorner();
        this.updateShopUI();
        playMusic(shopMusic);
    },

    updateShopUI: function () {
        document.getElementById('btn-pay-debt').textContent = (this.debt - this.paid) + "🥕";
    },

    gameOver: function () {
        if (this.inventory.insurance > 0) {
            this.inventory.insurance--;
            this.carrots = 100;
            alert("¡El seguro te salvó! Recuperas 100 zanahorias.");
            this.updateUI();
            return;
        }
        stopMusic(); // Detener música durante gameover
        story.play('gameover');
    },

    resetGame: function () {
        this.carrots = 100;
        this.debt = Math.floor(this.debt * 1.1); // Interés por fallar
        this.paid = 0;
        this.updateUI();
        this.showMenu();
    },

    showAlert: function (title, msg) {
        document.getElementById('result-title').textContent = title;
        document.getElementById('result-msg').textContent = msg;
        document.getElementById('result-overlay').classList.remove('hidden');
    }
};

function hideAllViews() {
    document.querySelectorAll('[id^="view-"]').forEach(el => el.classList.add('hidden'));
}

/* --- MAMBO HOST LOGIC --- */
const host = {
    quotes: [
        "¡Recuerda que los 1 no quitan puntos!",
        "Si tienes dudas, ¡mejor retírate con lo ganado!",
        "¡El rojo suele dar suerte hoy!",
        "¡Vamos a pagar esa deuda!",
        "¿Un descanso? ¡Jamás!",
        "¡Cuidado con las nubes de lluvia!"
    ],
    showCorner: function () {
        document.getElementById('host-corner').classList.remove('hidden');
    },
    hideCorner: function () {
        document.getElementById('host-corner').classList.add('hidden');
    },
    randomQuote: function () {
        // Reproducir sonido
        mamboSound.currentTime = 0;
        mamboSound.play().catch(e => console.log("No se pudo reproducir el sonido:", e));

        const idx = Math.floor(Math.random() * this.quotes.length);
        const bubble = document.getElementById('host-bubble');
        bubble.textContent = this.quotes[idx];
        bubble.classList.add('show');
        setTimeout(() => bubble.classList.remove('show'), 3000);
    }
};

/* --- DEFINICIÓN DE IMÁGENES DE MAMBO --- */
const mamboSprites = {
    normal: "assets/img/mamboIdleSF.png",
    sad: "assets/img/mambosadSF.png",
    happy: "assets/img/WinningMamboSF.png",
    shock: "assets/img/DizzyMamboSF.png"
};

/* --- STORY ENGINE --- */
const story = {
    queue: [],
    step: 0,

    scenes: {
        intro: [
            { text: "¡Entrenador! (Snif) Metí la pata horrible...", emotion: "sad" },
            { text: "Entré pensando que era un buffet… y pues… comí como si fuera la última cena.", emotion: "sad" },
            { text: "Resulta que era un casino clandestino y ahora les debo 50,000 zanahorias. ¡Cincuenta mil!", emotion: "shock" },
            { text: "Si no pago antes de la carrera final… me van a mandar a trabajar como poni de carga.", emotion: "sad" },
            { text: "¡Por favor! Ayúdame a recuperar las zanahorias en los juegos. Yo te iré guiando.", emotion: "normal" }
        ],
        gameover: [
            { text: "¡No queda nada! (Llorando)", emotion: "sad" },
            { text: "Supongo que este es mi fin.", emotion: "sad" },
            { text: "... Espera, nos dan otra oportunidad.", emotion: "normal" },
            { text: "¡Pero aumentó la deuda! ¡Cuidado!", emotion: "shock" }
        ],
        win: [
            { text: "¡LO LOGRAMOS! (Saltando)", emotion: "happy" },
            { text: "¡Gracias entrenador! ¡Eres el mejor!", emotion: "happy" }
        ]
    },

    play: function (sceneKey) {
        this.queue = this.scenes[sceneKey];
        this.step = 0;
        if (!this.queue) return;
        document.getElementById('story-overlay').classList.add('visible');
        host.hideCorner();
        this.render();
    },

    render: function () {
        const current = this.queue[this.step];

        // Texto
        document.getElementById('story-text').textContent = current.text;

        // Imagen
        const imgUrl = mamboSprites[current.emotion] || mamboSprites['normal'];
        document.getElementById('story-sprite').src = imgUrl;

        // Clases para animaciones CSS
        document.getElementById('story-sprite').className = 'character-sprite sprite-' + current.emotion;
    },

    next: function () {
        this.step++;
        if (this.step >= this.queue.length) {
            document.getElementById('story-overlay').classList.remove('visible');
            if (this.queue === this.scenes.gameover) {
                app.resetGame();
                playMusic(mainTheme); // Reanudar música
            } else if (this.queue === this.scenes.win) {
                app.showMenu();
            } else {
                app.showMenu();
            }
        } else {
            this.render();
        }
    }
};

/* --- SHOP LOGIC --- */
const shop = {
    buy: function (item, cost) {
        if (app.carrots >= cost) {
            app.carrots -= cost;
            if (item === 'helmet' || item === 'glasses' || item === 'insurance') {
                app.inventory[item] = (app.inventory[item] || 0) + (item === 'helmet' ? 5 : 1);
                alert(`¡Comprado! Tienes ${app.inventory[item]} usos.`);
            }
            app.updateUI();
        } else {
            alert("No tienes suficientes zanahorias...");
        }
    },
    payDebt: function () {
        const remaining = app.debt - app.paid;
        if (app.carrots >= remaining) {
            app.carrots -= remaining;
            app.paid = app.debt;
            app.updateUI();
            story.play('win');
        } else {
            if (app.carrots > 0) {
                const pay = app.carrots;
                app.carrots = 0;
                app.paid += pay;
                app.updateUI();
                alert(`Abonaste ${pay} zanahorias. Faltan ${app.debt - app.paid}.`);
                if (app.carrots === 0 && app.paid < app.debt) app.gameOver();
            } else {
                alert("¡Estás en bancarrota!");
            }
        }
    }
};

/* --- GENERAL GAME MANAGER --- */
const game = {
    currentGame: null,
    difficulty: 1, // 1 (Novice), 2 (Runner), 5 (G1)
    betCost: 0,

    openDifficulty: function (gameType) {
        this.currentGame = gameType;
        hideAllViews();
        host.hideCorner(); // Hide Mambo while playing
        document.getElementById('view-difficulty').classList.remove('hidden');
        const container = document.getElementById('diff-options');
        container.innerHTML = '';

        const options = [
            { label: 'Novato', cost: 10, mult: 1, desc: 'Riesgo bajo. Pocas bombas.' },
            { label: 'Corredor', cost: 50, mult: 2, desc: 'Riesgo medio. Más multiplicadores.' },
            { label: 'G1 Derby', cost: 100, mult: 5, desc: 'RIESGO ALTO. Tablero complejo.' }
        ];

        options.forEach((opt) => {
            const div = document.createElement('div');
            div.className = 'bet-option';
            div.innerHTML = `${opt.label}<br><span style="font-size:0.8rem">${opt.cost}🥕</span>`;
            div.onclick = () => this.selectBet(opt, div);
            if (app.carrots < opt.cost) { div.style.opacity = '0.5'; div.onclick = null; }
            container.appendChild(div);
        });

        document.getElementById('diff-desc').textContent = "Selecciona una apuesta...";
        document.getElementById('btn-start-game').disabled = true;
    },

    selectBet: function (opt, el) {
        document.querySelectorAll('.bet-option').forEach(e => e.classList.remove('selected'));
        el.classList.add('selected');
        document.getElementById('diff-desc').textContent = opt.desc;
        this.betCost = opt.cost;
        this.difficulty = opt.mult;
        document.getElementById('btn-start-game').disabled = false;
    },

    confirmStart: function () {
        app.carrots -= this.betCost;
        app.updateUI();
        hideAllViews();
        // Cambiar a música de minijuegos
        playMusic(miniGameMusic);
        if (this.currentGame === 'flip') flipGame.init();
        if (this.currentGame === 'memory') memoryGame.init();
        if (this.currentGame === 'roulette') rouletteGame.init();
    },

    quit: function (from) {
        app.showMenu();
    },

    finishGame: function (earnings) {
        app.carrots += earnings;
        app.updateUI();
        if (app.carrots <= 0) {
            app.gameOver();
        } else {
            app.showMenu();
        }
    }
};

/* --- GAME 1: FLIP (Auto Win Logic) --- */
const flipGame = {
    grid: [],
    active: false,
    memo: false,
    pot: 0,
    helmetActive: false,

    init: function () {
        document.getElementById('view-game-flip').classList.remove('hidden');
        this.active = true;
        this.memo = false;
        this.pot = game.betCost;
        this.grid = [];

        this.helmetActive = app.inventory.helmet > 0;
        if (this.helmetActive) {
            app.inventory.helmet--;
            document.getElementById('flip-buff-indicator').classList.remove('hidden');
        } else {
            document.getElementById('flip-buff-indicator').classList.add('hidden');
        }

        let bombCount = 6;
        let multiTarget = 5;

        if (game.difficulty === 2) { bombCount = 8; multiTarget = 8; }
        if (game.difficulty === 5) { bombCount = 10; multiTarget = 12; }

        for (let i = 0; i < 25; i++) this.grid.push({ val: 1, flip: false, memos: [0, 0, 0, 0] });

        let bombsPlaced = 0;
        while (bombsPlaced < bombCount) {
            let idx = Math.floor(Math.random() * 25);
            if (this.grid[idx].val !== 0) { this.grid[idx].val = 0; bombsPlaced++; }
        }

        let mPlaced = 0;
        while (mPlaced < multiTarget) {
            let idx = Math.floor(Math.random() * 25);
            if (this.grid[idx].val === 1) {
                let isThree = game.difficulty === 5 ? (Math.random() > 0.6) : (Math.random() > 0.8);
                this.grid[idx].val = isThree ? 3 : 2;
                mPlaced++;
            }
        }

        if (app.inventory.glasses > 0) {
            app.inventory.glasses--;
            let revealed = 0;
            this.grid.forEach(c => { if (c.val === 0 && revealed < 3) { c.memos[0] = 1; revealed++; } });
            alert("¡Binoculares activos! Bombas marcadas.");
        }

        this.updateBoard();
    },

    calculateSums: function () {
        const rows = [], cols = [];
        for (let i = 0; i < 5; i++) {
            let rSum = 0, rBomb = 0, cSum = 0, cBomb = 0;
            for (let j = 0; j < 5; j++) {
                let rVal = this.grid[i * 5 + j].val;
                rSum += rVal; if (rVal === 0) rBomb++;
                let cVal = this.grid[j * 5 + i].val;
                cSum += cVal; if (cVal === 0) cBomb++;
            }
            rows.push({ sum: rSum, bomb: rBomb });
            cols.push({ sum: cSum, bomb: cBomb });
        }
        return { rows, cols };
    },

    updateBoard: function () {
        const div = document.getElementById('flip-board');
        div.innerHTML = '';
        document.getElementById('flip-pot').textContent = this.pot;
        const sums = this.calculateSums();

        for (let i = 0; i < 25; i++) {
            const c = this.grid[i];
            const el = document.createElement('div');
            el.className = `flip-cell ${c.flip ? 'flipped' : ''}`;

            if (c.flip) {
                if (c.val === 0) el.textContent = '🌧️';
                else if (c.val > 1) { el.textContent = c.val; el.style.color = c.val === 3 ? '#b45309' : '#15803d'; }
                else el.textContent = '1';
            } else {
                if (c.memos[0]) el.innerHTML += `<div class="memo-marker m-0">🌧️</div>`;
                if (c.memos[1]) el.innerHTML += `<div class="memo-marker m-1">1</div>`;
                if (c.memos[2]) el.innerHTML += `<div class="memo-marker m-2">2</div>`;
                if (c.memos[3]) el.innerHTML += `<div class="memo-marker m-3">3</div>`;
            }
            el.onclick = (e) => this.click(i, e);
            div.appendChild(el);

            if ((i + 1) % 5 === 0) {
                const rData = sums.rows[Math.floor(i / 5)];
                const info = document.createElement('div');
                info.className = 'info-cell';
                info.innerHTML = `<span>${rData.sum}</span><span style="border-top:1px solid #fdba74; width:80%"></span><span>🌧️${rData.bomb}</span>`;
                div.appendChild(info);
            }
        }
        for (let c = 0; c < 5; c++) {
            const cData = sums.cols[c];
            const info = document.createElement('div');
            info.className = 'info-cell';
            info.innerHTML = `<span>${cData.sum}</span><span style="border-top:1px solid #fdba74; width:80%"></span><span>🌧️${cData.bomb}</span>`;
            div.appendChild(info);
        }
    },

    click: function (i, e) {
        if (!this.active || this.grid[i].flip) return;

        if (this.memo) {
            const rect = e.target.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            let mIdx = 0;
            if (y < rect.height / 2) mIdx = (x < rect.width / 2) ? 0 : 1;
            else mIdx = (x < rect.width / 2) ? 2 : 3;
            this.grid[i].memos[mIdx] = !this.grid[i].memos[mIdx];
            this.updateBoard();
            return;
        }

        this.grid[i].flip = true;
        if (this.grid[i].val === 0) {
            this.active = false;
            this.updateBoard();
            setTimeout(() => {
                app.showAlert("¡TORMENTA!", "Has perdido todo el progreso de esta ronda.");
                game.finishGame(0);
            }, 500);
        } else {
            if (this.grid[i].val > 1) {
                let mult = this.grid[i].val;
                if (this.helmetActive) mult *= 2;
                this.pot = Math.floor(this.pot * mult);
            }
            this.updateBoard();

            // --- AUTO WIN CHECK ---
            const remainingMultis = this.grid.filter(c => !c.flip && c.val > 1).length;
            if (remainingMultis === 0) {
                this.active = false;
                setTimeout(() => {
                    app.showAlert("¡LIMPIO!", `¡Tablero completado! Cobrando ${this.pot} zanahorias automáticamente.`);
                    game.finishGame(this.pot);
                }, 500);
            }
        }
    },

    toggleMemo: function () {
        this.memo = !this.memo;
        document.getElementById('btn-memo').style.background = this.memo ? '#facc15' : '#f1f5f9';
    },

    cashOut: function () {
        if (!this.active) return;
        game.finishGame(this.pot);
    }
};

/* --- GAME 2: MEMORY --- */
const memoryGame = {
    active: false,
    cards: [],
    flipped: [],
    matches: 0,

    init: function () {
        document.getElementById('view-game-memory').classList.remove('hidden');
        this.active = true;
        this.flipped = [];
        this.matches = 0;

        let pairCount = 6;
        let attempts = 12;

        if (game.difficulty === 2) { pairCount = 8; attempts = 12; }
        if (game.difficulty === 5) { pairCount = 10; attempts = 10; }

        document.getElementById('mem-moves').textContent = attempts;
        this.attemptsLeft = attempts;

        const types = ['🥕', '⚡', '💎', '💊', '🌙', '🔥', '❤️', '⭐', '🍀', '🍎'];
        let selectedTypes = types.slice(0, pairCount);
        let deck = [...selectedTypes, ...selectedTypes].sort(() => Math.random() - 0.5);

        const board = document.getElementById('memory-board');
        board.innerHTML = '';
        board.style.gridTemplateColumns = pairCount > 8 ? 'repeat(5, 1fr)' : 'repeat(4, 1fr)';

        this.cards = deck.map((val, i) => {
            const el = document.createElement('div');
            el.className = 'flip-cell';
            el.style.background = '#60a5fa';
            el.onclick = () => this.click(i);
            board.appendChild(el);
            return { val, el, solved: false };
        });
    },

    click: function (i) {
        if (!this.active || this.cards[i].solved || this.flipped.includes(i) || this.flipped.length >= 2) return;

        const c = this.cards[i];
        c.el.textContent = c.val;
        c.el.style.background = 'white';
        this.flipped.push(i);

        if (this.flipped.length === 2) {
            this.attemptsLeft--;
            document.getElementById('mem-moves').textContent = this.attemptsLeft;

            const [a, b] = this.flipped;
            if (this.cards[a].val === this.cards[b].val) {
                this.cards[a].solved = true;
                this.cards[b].solved = true;
                this.flipped = [];
                this.matches++;

                if (this.matches === this.cards.length / 2) {
                    const win = game.betCost * (3 + game.difficulty);
                    setTimeout(() => {
                        app.showAlert("¡MEMORIA PERFECTA!", `Ganaste ${win} zanahorias.`);
                        game.finishGame(win);
                    }, 500);
                }
            } else {
                if (this.attemptsLeft <= 0) {
                    setTimeout(() => {
                        app.showAlert("SIN INTENTOS", "Te quedaste sin energía...");
                        game.finishGame(0);
                    }, 500);
                    return;
                }
                setTimeout(() => {
                    this.cards[a].el.textContent = ''; this.cards[a].el.style.background = '#60a5fa';
                    this.cards[b].el.textContent = ''; this.cards[b].el.style.background = '#60a5fa';
                    this.flipped = [];
                }, 800);
            }
        }
    }
};

/* --- GAME 3: ROULETTE --- */
const rouletteGame = {
    init: function () {
        document.getElementById('view-game-roulette').classList.remove('hidden');
        document.getElementById('roulette-bet-display').textContent = game.betCost;
    },
    pick: function (choice) {
        const spinEl = document.getElementById('wheel-spinner');
        spinEl.classList.add('animate-spin');
        spinEl.style.transform = `rotate(${Math.random() * 1000}deg)`;
        spinEl.style.transition = "transform 2s";

        setTimeout(() => {
            spinEl.classList.remove('animate-spin');
            const res = Math.random() > 0.1 ? (Math.random() > 0.5 ? 'red' : 'black') : 'green';
            document.getElementById('wheel-res').textContent = res === 'red' ? '🔴' : (res === 'black' ? '⚫' : '🟢');

            let win = 0;
            let title = "PERDISTE";
            let msg = `Salió ${res === 'red' ? 'Rojo' : (res === 'black' ? 'Negro' : 'Verde')}.`;

            if (choice === res) {
                win = game.betCost * (res === 'green' ? 14 : 2);
                title = "¡GANASTE!";
                msg = `¡La suerte está contigo! +${win} zanahorias.`;
            }

            app.showAlert(title, msg);
            game.finishGame(win);
        }, 2000);
    }
};

// START
app.init();