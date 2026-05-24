// Fireball projectile — launched by fire Mario or Piranha Plant.
// Requires: cc.RigidBody (Dynamic), cc.PhysicsCircleCollider (sensor)
cc.Class({
    extends: cc.Component,

    properties: {
        speed:      { default: 400 },
        bounceForce:{ default: 250 },
        _dir:       { default: 1, visible: false },  // 1 = right, -1 = left
        _fromEnemy: { default: false, visible: false },
    },

    onLoad: function () {
        this._rb = this.getComponent(cc.RigidBody);
        this.node.group = 'player';  // hits enemy group
    },

    // Called by Player.js
    launch: function (facingRight) {
        this._dir = facingRight ? 1 : -1;
        this._fromEnemy = false;
        if (this._rb) this._rb.linearVelocity = cc.v2(this.speed * this._dir, -100);
        // Auto-destroy after 4s
        setTimeout(function () { if (this.node && this.node.isValid) this.node.destroy(); }.bind(this), 4000);
    },

    // Called by Flower.js — fires toward player
    launchDir: function (dir) {
        this._fromEnemy = true;
        this.node.group = 'enemy';
        if (this._rb) this._rb.linearVelocity = cc.v2(dir.x * this.speed, dir.y * this.speed);
        setTimeout(function () { if (this.node && this.node.isValid) this.node.destroy(); }.bind(this), 3000);
    },

    onBeginContact: function (contact, selfCol, otherCol) {
        var g = otherCol.node.group;

        if (g === 'platform') {
            // Bounce off floor, destroy on wall
            var normal = contact.getWorldManifold().normal;
            if (normal.y > 0.5) {
                // Floor — bounce
                var v = this._rb.linearVelocity;
                this._rb.linearVelocity = cc.v2(v.x, this.bounceForce);
            } else {
                this.node.destroy();
            }
            return;
        }

        if (!this._fromEnemy && g === 'enemy') {
            var enemy = otherCol.node.getComponent('EnemyBase') ||
                        otherCol.node.getComponent('Goomba')    ||
                        otherCol.node.getComponent('Turtle');
            if (enemy) {
                enemy.onStomp();
                this.node.destroy();
            }
            return;
        }

        if (this._fromEnemy && g === 'player') {
            var player = otherCol.node.getComponent('Player');
            if (player) player._getHurt();
            this.node.destroy();
        }
    },
});
