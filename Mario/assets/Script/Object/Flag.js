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

    // Called by Player.onBeginContact (trigger group) and by own onBeginContact.
    activate: function (playerNode) {
        cc.log('[Flag] activate called, already triggered:', this._triggered);
        if (this._triggered) return;
        this._triggered = true;
        this._startClearSequence(playerNode);
    },

    onBeginContact: function (contact, selfCol, otherCol) {
        if (otherCol.node.group !== 'player') return;
        this.activate(otherCol.node);
    },

    _startClearSequence: function (playerNode) {
        var player = playerNode.getComponent('Player');
        if (player) player._keys = {};

        var rb = playerNode.getComponent(cc.RigidBody);
        // Zero velocity is safe inside a contact callback.
        if (rb) rb.linearVelocity = cc.v2(0, 0);
        // b2Body.SetType cannot be called during a contact callback — defer one frame.
        this.scheduleOnce(function () {
            if (rb) rb.type = cc.RigidBodyType.Static;
        });

        var targetX = this.node.x + 30;
        var gm = GameManager.instance;
        var am = GameManager.instance && GameManager.instance.node.getComponent('AudioManager');

        cc.tween(playerNode)
            .to(0.6, { x: targetX })
            .call(function () {
                if (am) am.playSFX(am.sfxLevelClear);
                if (gm) gm.triggerLevelComplete();
            })
            .start();
    },
});
