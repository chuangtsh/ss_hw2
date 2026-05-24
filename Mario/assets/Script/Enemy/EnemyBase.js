// Base class for all enemies. Extend this with cc.Class({ extends: EnemyBase }).
// Requires: cc.RigidBody (Dynamic, fixedRotation), cc.PhysicsBoxCollider on node.
// node.group = 'enemy'
var EnemyBase = cc.Class({
    extends: cc.Component,

    properties: {
        moveSpeed:   { default: 60 },
        scoreValue:  { default: 100 },
        _dead:       { default: false, visible: false },
        _movingRight:{ default: false, visible: false },
    },

    onLoad: function () {
        this._rb = this.getComponent(cc.RigidBody);
        this.node.group = 'enemy';
    },

    start: function () {
        // Default: move left
        this._movingRight = false;
    },

    update: function (dt) {
        if (this._dead) return;
        var gm = GameManager.instance;
        if (gm && gm.getState() !== gm.STATE_PLAYING) return;

        var v = this._rb.linearVelocity;
        var speed = this._movingRight ? this.moveSpeed : -this.moveSpeed;
        this._rb.linearVelocity = cc.v2(speed, v.y);

        // Flip sprite to face movement direction
        this.node.scaleX = this._movingRight ? 1 : -1;
    },

    onBeginContact: function (contact, selfCol, otherCol) {
        if (otherCol.node.group === 'platform') {
            // Reverse direction when hitting a wall (horizontal contact)
            var normal = contact.getWorldManifold().normal;
            if (Math.abs(normal.x) > 0.5) {
                this._movingRight = !this._movingRight;
            }
        }
    },

    // Called by Player when stomped from above
    onStomp: function () {
        if (this._dead) return;
        this._dead = true;
        var gm = GameManager.instance;
        if (gm) gm.addScore(this.scoreValue);
        this._playDeath();
    },

    _playDeath: function () {
        // Subclasses override for specific death animations
        var self = this;
        var anim = this.getComponent(cc.Animation);
        if (anim) {
            anim.play('die');
            anim.once('finished', function () { self.node.destroy(); });
        } else {
            this.node.destroy();
        }
    },
});

// Make accessible globally so subclasses can extend it
window.EnemyBase = EnemyBase;
