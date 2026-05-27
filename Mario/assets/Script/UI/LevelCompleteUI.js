// Level complete overlay — listens for 'level-complete' event from GameManager.
// Attach to a LevelComplete node (active=false by default) inside Game scene Canvas.
cc.Class({
    extends: cc.Component,

    properties: {
        panel:      { default: null, type: cc.Node },
        bonusLabel: { default: null, type: cc.Label },
        nextButton: { default: null, type: cc.Node },
    },

    onLoad: function () {
        if (this.panel) this.panel.active = false;
        var gm = GameManager.instance;
        if (gm) gm.node.on('level-complete', this._onLevelComplete, this);
    },

    _onLevelComplete: function (bonus) {
        if (this.panel) this.panel.active = true;
        if (this.bonusLabel) this.bonusLabel.string = 'Time Bonus: +' + bonus;
        var am = cc.find('GameManager') && cc.find('GameManager').getComponent('AudioManager');
        if (am) am.playSFX(am.sfxLevelClear);
        // Auto-advance after 4 seconds if player doesn't press next
        var self = this;
        setTimeout(function () { self.nextLevel(); }, 4000);
    },

    nextLevel: function () {
        var gm = GameManager.instance;
        var state = gm ? gm.getState() : null;
        // Don't clobber the GameOver scene, and don't double-fire with GM fallback.
        if (state !== gm.STATE_CLEAR) return;
        gm.level += 1;
        gm.resetForNewLevel();
        // For now always reload same scene; extend with multi-level loading as needed
        cc.director.loadScene('Game');
    },

    onDestroy: function () {
        var gm = GameManager.instance;
        if (gm) gm.node.off('level-complete', this._onLevelComplete, this);
    },
});
