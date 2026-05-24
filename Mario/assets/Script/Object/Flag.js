// Level-end flag pole. Trigger sensor detects player, starts clear sequence.
cc.Class({
    extends: cc.Component,

    properties: {
        poleHeight:     { default: 200 },
        _triggered:     { default: false, visible: false },
    },

    onLoad: function () {
        this.node.group = 'trigger';
    },

    onBeginContact: function (contact, selfCol, otherCol) {
        if (this._triggered) return;
        if (otherCol.node.group !== 'player') return;
        this._triggered = true;
        this._startClearSequence(otherCol.node);
    },

    _startClearSequence: function (playerNode) {
        // Disable player input
        var rb = playerNode.getComponent(cc.RigidBody);
        if (rb) {
            rb.linearVelocity = cc.v2(0, 0);
            rb.type = cc.RigidBodyType.Static;
        }

        // Walk Mario to the base of the flag then trigger level complete
        cc.tween(playerNode)
            .to(0.6, { x: this.node.x + 30 })
            .call(function () {
                var gm = GameManager.instance;
                var am = cc.find('GameManager') && cc.find('GameManager').getComponent('AudioManager');
                if (am) am.playSFX(am.sfxLevelClear);
                if (gm) gm.triggerLevelComplete();
            })
            .start();
    },
});
