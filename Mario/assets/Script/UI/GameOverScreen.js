// Game Over screen — attach to Canvas in GameOver scene.
cc.Class({
    extends: cc.Component,

    properties: {
        scoreLabel: { default: null, type: cc.Label },
    },

    onLoad: function () {
        var gm = GameManager.instance;
        if (gm && this.scoreLabel) {
            this.scoreLabel.string = 'Score: ' + gm.score;
        }
    },

    restart: function () {
        var gm = GameManager.instance;
        if (gm) {
            if (gm.lives > 0) {
                gm.resetForNewLevel();
                cc.director.loadScene('Game');
            } else {
                gm.resetAll();
                cc.director.loadScene('MainMenu');
            }
        } else {
            cc.director.loadScene('MainMenu');
        }
    },

    mainMenu: function () {
        var gm = GameManager.instance;
        if (gm) gm.resetAll();
        cc.director.loadScene('MainMenu');
    },
});
