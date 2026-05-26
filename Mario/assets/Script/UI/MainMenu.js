// Main menu controller — attach to Canvas node in MainMenu scene.
cc.Class({
    extends: cc.Component,

    properties: {
        startButton: { default: null, type: cc.Button },
    },

    onLoad: function () {
        // Guard: if Firebase is loaded and user is not authenticated,
        // show the auth overlay instead of allowing menu use.
        if (typeof firebase !== 'undefined') {
            var user = firebase.auth().currentUser;
            if (!user) {
                var overlay = document.getElementById('auth-overlay');
                if (overlay) overlay.classList.remove('hidden');
                return;
            }
        }

        var gm = GameManager.instance;
        if (gm) gm.resetAll();
    },

    startGame: function () {
        // Require authentication before entering game.
        if (typeof firebase !== 'undefined' && !firebase.auth().currentUser) {
            var overlay = document.getElementById('auth-overlay');
            if (overlay) overlay.classList.remove('hidden');
            return;
        }

        var gm = cc.find('GameManager');
        if (gm) {
            var am = gm.getComponent('AudioManager');
            if (am) am.playSFX(am.sfxPowerUp);
        }
        cc.director.loadScene('Game');
    },
});
