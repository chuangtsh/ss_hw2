// Main menu controller — attach to Canvas node in MainMenu scene.
cc.Class({
    extends: cc.Component,

    properties: {
        startButton: { default: null, type: cc.Button },
    },

    onLoad: function () {
        // Reset persistent game state so a fresh run starts clean
        var gm = GameManager.instance;
        if (gm) gm.resetAll();
    },

    startGame: function () {
        // Play button press SFX if AudioManager is present
        var gm = cc.find('GameManager');
        if (gm) {
            var am = gm.getComponent('AudioManager');
            if (am) am.playSFX(am.sfxPowerUp);
        }
        cc.director.loadScene('Game');
    },
});
