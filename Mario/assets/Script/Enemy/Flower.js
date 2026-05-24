// Piranha Plant — rises from a pipe, optionally shoots fireballs.
// Place this node at the pipe mouth; it animates up/down on a timer.
cc.Class({
    extends: cc.Component,

    properties: {
        riseDistance:   { default: 80 },
        riseDuration:   { default: 1.0 },
        waitDuration:   { default: 2.0 },
        shootsFireball: { default: false },
        fireballPrefab: { default: null, type: cc.Prefab },
        _hidden:        { default: true,  visible: false },
    },

    onLoad: function () {
        this.node.group = 'enemy';
        this._originY   = this.node.y;
        this._cycle();
    },

    _cycle: function () {
        var self = this;
        // Rise up
        cc.tween(this.node)
            .delay(this.waitDuration)
            .to(this.riseDuration, { y: this._originY + this.riseDistance },
                { easing: 'sineInOut' })
            .call(function () {
                self._hidden = false;
                if (self.shootsFireball && self.fireballPrefab) self._shoot();
            })
            .delay(this.waitDuration)
            .to(this.riseDuration, { y: self._originY }, { easing: 'sineInOut' })
            .call(function () { self._hidden = true; self._cycle(); })
            .start();
    },

    _shoot: function () {
        // Find player and shoot toward them
        var player = cc.find('Canvas/World/Player');
        if (!player || !this.fireballPrefab) return;
        var dir = player.getWorldPosition().sub(this.node.getWorldPosition()).normalize();
        var ball = cc.instantiate(this.fireballPrefab);
        ball.setPosition(this.node.x, this.node.y + 30);
        this.node.parent.addChild(ball);
        var fb = ball.getComponent('Fireball');
        if (fb) fb.launchDir(dir);
    },

    // Cannot be stomped while hidden
    onBeginContact: function (contact, selfCol, otherCol) {
        if (this._hidden) return;
        if (otherCol.node.group === 'player') {
            var player = otherCol.node.getComponent('Player');
            if (player) player._getHurt();
        }
    },
});
