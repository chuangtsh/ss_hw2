// In-game HUD — attach to the HUD node in Game scene.
// Drag labels and life sprites into Inspector properties.
cc.Class({
    extends: cc.Component,

    properties: {
        scoreLabel:     { default: null, type: cc.Label },
        coinsLabel:     { default: null, type: cc.Label },
        worldLabel:     { default: null, type: cc.Label },
        timerLabel:     { default: null, type: cc.Label },
        lifeCountLabel: { default: null, type: cc.Label },
        lifeIcons:      { default: [], type: [cc.Node] },
    },

    // start() runs after ALL nodes' onLoad — guarantees GameManager.instance exists
    start: function () {
        var gm = GameManager.instance;
        if (!gm) {
            cc.warn('[HUD] GameManager not found. Is GameManager.js attached to GameManager node?');
            return;
        }
        gm.node.on('score-update', this._onScore, this);
        gm.node.on('coins-update', this._onCoins, this);
        gm.node.on('lives-update', this._onLives, this);
        gm.node.on('time-update',  this._onTime,  this);
        this._refresh(gm);
        gm.startTimer();
    },

    _refresh: function (gm) {
        if (this.scoreLabel)     this.scoreLabel.string     = this._padScore(gm.score);
        if (this.coinsLabel)     this.coinsLabel.string     = this._pad2(gm.coins);
        if (this.worldLabel)     this.worldLabel.string     = 'WORLD ' + gm.world;
        if (this.timerLabel)     this.timerLabel.string     = this._pad3(gm.timeLeft);
        if (this.lifeCountLabel) this.lifeCountLabel.string = String(gm.lives);
        this._refreshLives(gm.lives);
    },

    _onScore: function (s) {
        if (this.scoreLabel) this.scoreLabel.string = this._padScore(s);
    },
    _onCoins: function (c) {
        if (this.coinsLabel) this.coinsLabel.string = this._pad2(c);
    },
    _onLives: function (l) {
        this._refreshLives(l);
        if (this.lifeCountLabel) this.lifeCountLabel.string = String(l);
    },
    _onTime:  function (t) {
        if (this.timerLabel) this.timerLabel.string = this._pad3(t);
        if (this.timerLabel) {
            this.timerLabel.node.color = (t <= 100) ? cc.Color.RED : cc.Color.WHITE;
        }
    },

    _refreshLives: function (lives) {
        this.lifeIcons.forEach(function (icon, i) {
            if (icon) icon.active = i < lives;
        });
    },

    // Safe zero-padding without padStart
    _padScore: function (n) {
        var s = String(n);
        while (s.length < 6) s = '0' + s;
        return s;
    },
    _pad2: function (n) {
        var s = String(n);
        return s.length < 2 ? '0' + s : s;
    },
    _pad3: function (n) {
        var s = String(n);
        while (s.length < 3) s = '0' + s;
        return s;
    },

    onDestroy: function () {
        var gm = GameManager.instance;
        if (gm) {
            gm.node.off('score-update', this._onScore, this);
            gm.node.off('coins-update', this._onCoins, this);
            gm.node.off('lives-update', this._onLives, this);
            gm.node.off('time-update',  this._onTime,  this);
        }
    },
});
