// Game Over screen — attach to Canvas root node in GameOver scene.
cc.Class({
    extends: cc.Component,

    properties: {
        // ── Summary labels ────────────────────────────────────────────
        titleLabel:  { default: null, type: cc.Label },
        scoreLabel:  { default: null, type: cc.Label },
        coinsLabel:  { default: null, type: cc.Label },
        livesLabel:  { default: null, type: cc.Label },
        worldLabel:  { default: null, type: cc.Label },
        timeLabel:   { default: null, type: cc.Label },

        // ── Retry / continue button label ─────────────────────────────
        retryLabel:  { default: null, type: cc.Label },

        // ── Leaderboard (placeholder — wire up when backend is ready) ─
        leaderboardPanel: { default: null, type: cc.Node },
        // leaderboardEntries: array of cc.Label nodes, one per rank row
        // leaderboardEntries: { default: [], type: [cc.Label] },
    },

    onLoad: function () {
        var gm = GameManager.instance;
        if (!gm) return;

        this._populateSummary(gm);
        this._initLeaderboard();
    },

    _populateSummary: function (gm) {
        var won = gm.getState() === gm.STATE_CLEAR;

        if (this.titleLabel)  this.titleLabel.string  = won ? 'COURSE CLEAR!' : 'GAME OVER';
        if (this.scoreLabel)  this.scoreLabel.string  = 'SCORE  ' + this._pad(gm.score, 6);
        if (this.coinsLabel)  this.coinsLabel.string  = 'COINS  x' + this._pad(gm.coins, 2);
        if (this.livesLabel)  this.livesLabel.string  = 'LIVES  ' + gm.lives;
        if (this.worldLabel)  this.worldLabel.string  = 'WORLD  ' + gm.world + '-' + gm.level;
        if (this.timeLabel)   this.timeLabel.string   = 'TIME   ' + this._pad(gm.timeLeft, 3);

        if (this.retryLabel) {
            this.retryLabel.string = won ? 'PLAY AGAIN' : (gm.lives > 0 ? 'CONTINUE' : 'TRY AGAIN');
        }
    },

    _initLeaderboard: function () {
        if (!window.leaderboard) return;
        var gm = GameManager.instance;
        if (gm) {
            window.leaderboard.submit({
                score: gm.score,
                coins: gm.coins,
                world: gm.world,
                level: gm.level,
            });
        }
        // Slight delay so RTDB write can land before we fetch top-10
        setTimeout(function () { window.leaderboard.show(); }, 600);
    },

    // ── Button handlers ───────────────────────────────────────────────

    retry: function () {
        var gm = GameManager.instance;
        if (gm && gm.lives > 0) {
            gm.resetForNewLevel();
        } else if (gm) {
            gm.resetAll();
        }
        cc.director.loadScene('Game');
    },

    mainMenu: function () {
        var gm = GameManager.instance;
        if (gm) gm.resetAll();
        cc.director.loadScene('MainMenu');
    },

    _pad: function (n, len) {
        return String(n).padStart(len, '0');
    },
});
