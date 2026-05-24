// Goomba enemy — walks, reverses on walls, squishes on stomp.
// Requires EnemyBase.js to be loaded first (add it before Goomba in build order
// or use cc.loader; in practice Cocos Creator loads by dependency order).
cc.Class({
    extends: EnemyBase,

    properties: {
        moveSpeed:  { default: 60,  override: true },
        scoreValue: { default: 100, override: true },
    },

    onStomp: function () {
        if (this._dead) return;
        this._dead = true;
        var gm = GameManager.instance;
        if (gm) gm.addScore(this.scoreValue);

        // Disable physics so it stays flat
        var rb = this.getComponent(cc.RigidBody);
        if (rb) rb.enabled = false;

        var anim = this.getComponent(cc.Animation);
        var self = this;
        if (anim) {
            anim.play('die');
            anim.once('finished', function () { self.node.destroy(); });
        } else {
            setTimeout(function () { self.node.destroy(); }, 400);
        }
    },
});
