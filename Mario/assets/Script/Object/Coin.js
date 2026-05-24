// Floating coin — collected on player contact.
// node.group = 'trigger', sensor collider so it doesn't block movement.
cc.Class({
    extends: cc.Component,

    properties: {
        _collected: { default: false, visible: false },
    },

    onLoad: function () {
        this.node.group = 'trigger';
        // Spin animation plays automatically if Animation component is present
        var anim = this.getComponent(cc.Animation);
        if (anim) anim.play('spin');
    },

    collect: function () {
        if (this._collected) return;
        this._collected = true;

        var gm = GameManager.instance;
        if (gm) gm.addCoin();

        var am = this._getAM();
        if (am) am.playSFX(am.sfxCoin);

        // Pop-up score label (+100)
        this._showScorePopup();
        this.node.destroy();
    },

    _showScorePopup: function () {
        var label = new cc.Node('score_popup');
        var lc    = label.addComponent(cc.Label);
        lc.string = '+100';
        lc.fontSize = 24;
        label.color = cc.Color.YELLOW;
        label.setPosition(this.node.x, this.node.y);
        this.node.parent.addChild(label);
        cc.tween(label)
            .to(0.6, { y: this.node.y + 60, opacity: 0 })
            .call(function () { label.destroy(); })
            .start();
    },

    _getAM: function () {
        var gm = cc.find('GameManager');
        return gm ? gm.getComponent('AudioManager') : null;
    },
});
