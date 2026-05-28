// Singleton game state manager — persists across scenes.
// Access via: cc.find('GameManager').getComponent('GameManager')
cc.log('[GameManager] script parsed OK');
var GameManager = cc.Class({
    extends: cc.Component,

    properties: {
        lives:      { default: 3 },
        score:      { default: 0 },
        coins:      { default: 0 },
        world:      { default: 1 },
        level:      { default: 1 },
        timeLeft:   { default: 300 },

        // State constants exposed for other scripts
        STATE_PLAYING:  { default: 'playing',       visible: false },
        STATE_PAUSED:   { default: 'paused',        visible: false },
        STATE_GAMEOVER: { default: 'gameover',      visible: false },
        STATE_CLEAR:    { default: 'levelComplete', visible: false },
    },

    statics: {
        instance: null,
        snapshot: null,   // survives scene unload; read by GameOverScreen when instance is gone
    },

    onLoad: function () {
        if (GameManager.instance) {
            cc.log('GameManager instance already exists!');
            this.node.destroy();
            return;
        }
        GameManager.instance = this;
        cc.game.addPersistRootNode(this.node);
        this._state = this.STATE_PLAYING;
        this._timer = null;
    },

    // ── Public API ────────────────────────────────────────────────

    startTimer: function () {
        this._stopTimer();
        this._timer = setInterval(() => {
            if (this._state !== this.STATE_PLAYING) return;
            this.timeLeft = Math.max(0, this.timeLeft - 1);
            this.node.emit('time-update', this.timeLeft);
            if (this.timeLeft <= 0) this.triggerGameOver();
        }, 1000);
    },

    addScore: function (points) {
        this.score += points;
        this.node.emit('score-update', this.score);
    },

    addCoin: function () {
        this.coins += 1;
        this.score += 100;
        this.node.emit('coins-update', this.coins);
        this.node.emit('score-update', this.score);
        if (this.coins >= 100) {
            this.coins = 0;
            this.lives += 1;
            this.node.emit('lives-update', this.lives);
        }
    },

    pause: function () {
        if (this._state !== this.STATE_PLAYING) return;
        this._state = this.STATE_PAUSED;
        cc.director.pause();
        this.node.emit('game-paused');
    },

    resume: function () {
        if (this._state !== this.STATE_PAUSED) return;
        this._state = this.STATE_PLAYING;
        cc.director.resume();
        this.node.emit('game-resumed');
    },

    // Lose one life; if lives remain, keep playing. If 0, go to game over.
    loseLife: function () {
        if (this._state !== this.STATE_PLAYING) return;
        this.lives -= 1;
        this.node.emit('lives-update', this.lives);
        if (this.lives <= 0) {
            this.triggerGameOver();
        }
        // Else: state stays STATE_PLAYING so enemies keep moving;
        // Player handles the invincible flash.
    },

    triggerGameOver: function () {
        if (this._state === this.STATE_GAMEOVER) return;
        this._stopTimer();
        this._state = this.STATE_GAMEOVER;
        this._saveSnapshot(false);
        this.node.emit('lives-update', this.lives);
        this.node.emit('game-over', GameManager.snapshot);
        var am = this.node.getComponent('AudioManager');
        if (am) am.playBGM(am.sfxGameOver);
        setTimeout(function () {
            cc.director.loadScene('GameOver');
        }, 2000);
    },

    triggerLevelComplete: function () {
        if (this._state === this.STATE_CLEAR) return;
        this._stopTimer();
        this._state = this.STATE_CLEAR;
        var bonus = this.timeLeft * 50;
        this.addScore(bonus);
        this._saveSnapshot(true);
        this.node.emit('level-complete', bonus);
        setTimeout(function () {
            cc.director.loadScene('GameOver');
        }, 2000);
    },

    resetForNewLevel: function () {
        this.timeLeft   = 300;
        this._state     = this.STATE_PLAYING;
    },

    resetAll: function () {
        this.lives      = 3;
        this.score      = 0;
        this.coins      = 0;
        this.world      = 1;
        this.level      = 1;
        this.timeLeft   = 300;
        this._state     = this.STATE_PLAYING;
    },

    getState: function () { return this._state; },

    // ── Private ───────────────────────────────────────────────────

    _saveSnapshot: function (won) {
        GameManager.snapshot = {
            score:    this.score,
            coins:    this.coins,
            lives:    this.lives,
            world:    this.world,
            level:    this.level,
            timeLeft: this.timeLeft,
            won:      won,
        };
    },

    _stopTimer: function () {
        if (this._timer) { clearInterval(this._timer); this._timer = null; }
    },

    onDestroy: function () {
        this._stopTimer();
        GameManager.instance = null;
    },
});
window.GameManager = GameManager;
