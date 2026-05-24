// Power-up item (mushroom / fireFlower / star).
// Slides out of a QuestionBlock, then moves horizontally.
// node.group = 'item'
cc.Class({
    extends: cc.Component,

    properties: {
        // Set in Inspector: 'mushroom' | 'fireFlower' | 'star'
        type:       { default: 'mushroom' },
        slideSpeed: { default: 80 },
        _collected: { default: false, visible: false },
        _moving:    { default: false, visible: false },
    },

    onLoad: function () {
        this.node.group = 'item';
        this._rb = this.getComponent(cc.RigidBody);
    },

    // Called by QuestionBlock after the slide-out tween
    startMoving: function () {
        this._moving = true;
    },

    update: function (dt) {
        if (!this._moving || this._collected) return;
        var v = this._rb ? this._rb.linearVelocity : cc.v2();
        if (this._rb) {
            this._rb.linearVelocity = cc.v2(this.slideSpeed, v.y);
        }
    },

    onBeginContact: function (contact, selfCol, otherCol) {
        if (otherCol.node.group === 'platform') {
            // Bounce off walls
            var normal = contact.getWorldManifold().normal;
            if (Math.abs(normal.x) > 0.5) this.slideSpeed *= -1;
        }
        if (otherCol.node.group === 'player') {
            var player = otherCol.node.getComponent('Player');
            if (player) this.applyTo(player);
        }
    },

    // Called externally by Player when contact detected
    applyTo: function (player) {
        if (this._collected) return;
        this._collected = true;
        player.powerUp(this.type);
        var gm = GameManager.instance;
        if (gm) gm.addScore(1000);
        this.node.destroy();
    },
});
