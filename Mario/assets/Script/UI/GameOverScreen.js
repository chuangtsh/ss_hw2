// Game Over screen — attach to Canvas root node in GameOver scene.
cc.Class({
    extends: cc.Component,

    properties: {
        scoreLabel:  { default: null, type: cc.Label },
        coinsLabel:  { default: null, type: cc.Label },
        livesLabel:  { default: null, type: cc.Label },
        retryLabel:  { default: null, type: cc.Label },
    },

    onLoad: function () {
        var gm = GameManager.instance;
        if (!gm) return;

        if (this.scoreLabel) this.scoreLabel.string = 'SCORE  ' + this._pad(gm.score, 6);
        if (this.coinsLabel) this.coinsLabel.string = 'COINS  ' + this._pad(gm.coins, 2);
        if (this.livesLabel) this.livesLabel.string = 'LIVES  ' + gm.lives;

        // Change retry button text depending on whether a continue is possible.
        if (this.retryLabel) {
            this.retryLabel.string = gm.lives > 0 ? 'CONTINUE' : 'TRY AGAIN';
        }
    },

    // Wired to the Retry / Continue button's Click Event.
    retry: function () {
        var gm = GameManager.instance;
        if (gm && gm.lives > 0) {
            gm.resetForNewLevel();
            cc.director.loadScene('Game');
        } else {
            if (gm) gm.resetAll();
            cc.director.loadScene('Game');
        }
    },

    // Wired to the Main Menu button's Click Event.
    mainMenu: function () {
        var gm = GameManager.instance;
        if (gm) gm.resetAll();
        cc.director.loadScene('MainMenu');
    },

    _pad: function (n, len) {
        return String(n).padStart(len, '0');
    },
});
