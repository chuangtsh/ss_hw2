// Game Over screen — attach to GameOverRoot node in GameOver scene.
cc.Class({
    extends: cc.Component,

    properties: {
        // ── Background nodes (show one depending on win/lose) ─────────
        winBackground:  { default: null, type: cc.Node },
        loseBackground: { default: null, type: cc.Node },

        // ── Title + summary labels ────────────────────────────────────
        titleLabel:  { default: null, type: cc.Label },
        scoreLabel:  { default: null, type: cc.Label },
        coinsLabel:  { default: null, type: cc.Label },
        livesLabel:  { default: null, type: cc.Label },
        worldLabel:  { default: null, type: cc.Label },
        timeLabel:   { default: null, type: cc.Label },

        // ── Retry button label ────────────────────────────────────────
        retryLabel:  { default: null, type: cc.Label },

        // ── Inline leaderboard labels (wire Rank1-Rank5 nodes here) ──
        rank1: { default: null, type: cc.Label },
        rank2: { default: null, type: cc.Label },
        rank3: { default: null, type: cc.Label },
        rank4: { default: null, type: cc.Label },
        rank5: { default: null, type: cc.Label },
    },

    onLoad: function () {
        var gm   = GameManager.instance;
        var snap = GameManager.snapshot;
        if (!gm && !snap) { cc.warn('[GameOverScreen] no game data'); return; }
        this._populateSummary(gm, snap);
        this._initLeaderboard();
    },

    _populateSummary: function (gm, snap) {
        var score    = gm ? gm.score    : snap.score;
        var coins    = gm ? gm.coins    : snap.coins;
        var lives    = gm ? gm.lives    : snap.lives;
        var world    = gm ? gm.world    : snap.world;
        var level    = gm ? gm.level    : snap.level;
        var timeLeft = gm ? gm.timeLeft : snap.timeLeft;
        var won      = gm ? gm.getState() === gm.STATE_CLEAR : snap.won;

        // Show the matching background, hide the other.
        if (this.winBackground)  this.winBackground.active  = won;
        if (this.loseBackground) this.loseBackground.active = !won;

        if (this.titleLabel)  this.titleLabel.string  = won ? 'COURSE CLEAR!' : 'GAME OVER';
        if (this.scoreLabel)  this.scoreLabel.string  = 'SCORE  ' + this._pad(score, 6);
        if (this.coinsLabel)  this.coinsLabel.string  = 'COINS  x' + this._pad(coins, 2);
        if (this.livesLabel)  this.livesLabel.string  = 'LIVES  ' + lives;
        if (this.worldLabel)  this.worldLabel.string  = 'WORLD  ' + world + '-' + level;
        if (this.timeLabel)   this.timeLabel.string   = 'TIME   ' + this._pad(timeLeft, 3);

        if (this.retryLabel) {
            this.retryLabel.string = won ? 'RETRY' : (lives > 0 ? 'CONTINUE' : 'RETRY');
        }
    },

    _initLeaderboard: function () {
        if (!window.leaderboard) return;
        var gm   = GameManager.instance;
        var snap = GameManager.snapshot;
        var data = gm || snap;
        if (data) {
            window.leaderboard.submit({
                score:    data.score    || 0,
                coins:    data.coins    || 0,
                world:    data.world    || 1,
                level:    data.level    || 1,
                timeLeft: data.timeLeft || 0,
            });
        }
        var runData = data ? {
            score:    data.score    || 0,
            coins:    data.coins    || 0,
            world:    data.world    || 1,
            level:    data.level    || 1,
            timeLeft: data.timeLeft || 0,
        } : null;
        // Always use the DOM overlay — CC bitmap fonts can't render mixed alphanumeric text
        setTimeout(function () { window.leaderboard.show(runData); }, 800);
    },

    // ── Button handlers ───────────────────────────────────────────────

    retry: function () {
        var gm = GameManager.instance;
        if (gm) {
            if (gm.lives > 0) gm.resetForNewLevel();
            else              gm.resetAll();
        } else if (GameManager.snapshot) {
            GameManager.snapshot = null;
        }
        cc.director.loadScene('Game');
    },

    mainMenu: function () {
        var gm = GameManager.instance;
        if (gm) gm.resetAll();
        GameManager.snapshot = null;
        cc.director.loadScene('MainMenu');
    },

    _pad: function (n, len) {
        return String(n).padStart(len, '0');
    },
});
