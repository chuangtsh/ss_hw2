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

    onBeginContact: function (contact, selfCol, otherCol) {
        if (this._used) return;
        if (otherCol.node.group !== 'player') return;

        // Only trigger when player is jumping upward into the block's bottom face.
        var rb = otherCol.node.getComponent(cc.RigidBody);
        if (!rb || rb.linearVelocity.y <= 0) return;

        // Confirm it's a vertical (bottom) hit, not a side hit.
        var wm = contact.getWorldManifold();
        if (Math.abs(wm.normal.y) > Math.abs(wm.normal.x)) {
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
        if (this.contentType === 'coin') {
            var prefab = this.coinPrefab;
            if (prefab) {
                // Spawn real Coin prefab
                var item = cc.instantiate(prefab);
                item.setPosition(this.node.x, this.node.y + this.node.height);
                this.node.parent.addChild(item);
            } else {
                // No prefab linked — still give coin + show floating popup
                var gm = GameManager.instance;
                if (gm) gm.addCoin();
                this._popupCoin();
            }
        } else {
            var puPrefab = this.powerUpPrefab;
            if (!puPrefab) { cc.warn('[QuestionBlock] powerUpPrefab not set'); return; }
            var puItem = cc.instantiate(puPrefab);
            puItem.setPosition(this.node.x, this.node.y + this.node.height);
            this.node.parent.addChild(puItem);
            var pu = puItem.getComponent('PowerUp');
            if (pu) {
                pu.type = this.contentType;
                cc.tween(puItem)
                    .to(0.3, { y: this.node.y + this.node.height + 32 })
                    .call(function () { if (pu) pu.startMoving(); })
                    .start();
            }
        }
    },

    _popupCoin: function () {
        var popup = new cc.Node('coin_popup');
        var lc = popup.addComponent(cc.Label);
        lc.string = '+1 Coin';
        lc.fontSize = 22;
        popup.color = cc.Color.YELLOW;
        popup.setPosition(this.node.x, this.node.y + this.node.height + 10);
        this.node.parent.addChild(popup);
        cc.tween(popup)
            .to(0.7, { y: this.node.y + this.node.height + 60, opacity: 0 })
            .call(function () { popup.destroy(); })
            .start();
    },
});
