// ? Block — bumped from below by the player to release a coin or power-up.
// node.group = 'platform' so Mario lands on it.
// Place a thin sensor trigger child node below the block to detect player bumping.
cc.Class({
    extends: cc.Component,

    properties: {
        // What spawns: 'coin' | 'mushroom' | 'fireFlower'
        contentType:    { default: 'coin' },
        coinPrefab:     { default: null, type: cc.Prefab },
        powerUpPrefab:  { default: null, type: cc.Prefab },
        _used:          { default: false, visible: false },
    },

    onLoad: function () {
        this.node.group = 'platform';

        // Child sensor node detects player bumping from below
        var sensor = this.node.getChildByName('BumpSensor');
        if (sensor) {
            sensor.on(cc.Node.EventType.COLLISION_ENTER, this._onBump, this);
        }
    },

    // Also handle via physics contact directly
    onBeginContact: function (contact, selfCol, otherCol) {
        if (this._used) return;
        if (otherCol.node.group !== 'player') return;
        var normal = contact.getWorldManifold().normal;
        // Normal pointing downward means player hit from below
        if (normal.y < -0.5) {
            this._activate();
        }
    },

    _onBump: function () {
        if (!this._used) this._activate();
    },

    _activate: function () {
        this._used = true;

        // Bump animation
        var origY = this.node.y;
        cc.tween(this.node)
            .to(0.07, { y: origY + 12 })
            .to(0.07, { y: origY })
            .start();

        // Disable ? glyph — swap to used-block sprite frame if needed
        var anim = this.getComponent(cc.Animation);
        if (anim) anim.play('used');

        this._spawnContent();
    },

    _spawnContent: function () {
        var prefab = (this.contentType === 'coin') ? this.coinPrefab : this.powerUpPrefab;
        if (!prefab) return;

        var item = cc.instantiate(prefab);
        item.setPosition(this.node.x, this.node.y + this.node.height);
        this.node.parent.addChild(item);

        if (this.contentType !== 'coin') {
            var pu = item.getComponent('PowerUp');
            if (pu) {
                pu.type = this.contentType;
                // Slide up then start moving
                cc.tween(item)
                    .to(0.3, { y: this.node.y + this.node.height + 32 })
                    .call(function () { if (pu) pu.startMoving(); })
                    .start();
            }
        }
    },
});
