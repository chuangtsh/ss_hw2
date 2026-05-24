// Koopa Turtle — enters shell on first stomp, shell can be kicked.
cc.Class({
    extends: EnemyBase,

    properties: {
        moveSpeed:   { default: 80,  override: true },
        shellSpeed:  { default: 300 },
        scoreValue:  { default: 200, override: true },
        _inShell:    { default: false, visible: false },
        _shellMoving:{ default: false, visible: false },
    },

    onStomp: function () {
        if (this._dead) return;

        if (!this._inShell) {
            // First stomp → enter shell
            this._inShell = true;
            var anim = this.getComponent(cc.Animation);
            if (anim) anim.play('shell');
            var rb = this.getComponent(cc.RigidBody);
            if (rb) rb.linearVelocity = cc.v2(0, rb.linearVelocity.y);
            var gm = GameManager.instance;
            if (gm) gm.addScore(100);
        } else if (this._inShell && !this._shellMoving) {
            // Kick the shell
            this._kickShell();
        } else {
            // Stop the moving shell
            this._shellMoving = false;
            var rb2 = this.getComponent(cc.RigidBody);
            if (rb2) rb2.linearVelocity = cc.v2(0, rb2.linearVelocity.y);
        }
    },

    _kickShell: function () {
        this._shellMoving = true;
        this.moveSpeed = this.shellSpeed;
        var anim = this.getComponent(cc.Animation);
        if (anim) anim.play('shellSpin');
        var gm = GameManager.instance;
        if (gm) gm.addScore(400);

        // Determine kick direction from player position
        var player = cc.find('Canvas/World/Player');
        if (player) {
            this._movingRight = player.x < this.node.x;
        }
    },

    onBeginContact: function (contact, selfCol, otherCol) {
        if (this._inShell && this._shellMoving && otherCol.node.group === 'enemy') {
            var enemy = otherCol.node.getComponent('EnemyBase') ||
                        otherCol.node.getComponent('Goomba')    ||
                        otherCol.node.getComponent('Turtle');
            if (enemy) enemy.onStomp();
        }
        EnemyBase.prototype.onBeginContact.call(this, contact, selfCol, otherCol);
    },
});
