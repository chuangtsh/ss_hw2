// Mario player controller.
// Requires: cc.RigidBody (Dynamic), two cc.PhysicsBoxCollider (body + foot sensor),
//           cc.Animation, cc.Sprite on the same node.
cc.log('[Player] script parsed OK');
cc.Class({
    extends: cc.Component,

    properties: {
        moveSpeed:      { default: 180 },
        runSpeed:       { default: 300 },
        jumpForce:      { default: 600 },
        fireballPrefab: { default: null, type: cc.Prefab },
        atlasSmall:     { default: null, type: cc.SpriteAtlas },
        atlasBig:       { default: null, type: cc.SpriteAtlas },
        atlasFire:      { default: null, type: cc.SpriteAtlas },
        audioManager:   { default: null, type: cc.Node },
    },

    onLoad: function () {
        this._rb           = this.getComponent(cc.RigidBody);
        this._anim         = this.getComponent(cc.Animation);
        this._sprite       = this.getComponent(cc.Sprite);
        this._formState    = 'small';
        this._onGround     = false;
        this._facingRight  = true;
        this._fireCD       = 0;
        this._keys         = {};
        this._invincible   = false;
        this._camera       = cc.find('Canvas/Main Camera');
        this._hud          = cc.find('Canvas/HUD');
        this._spawnPos     = cc.v2(this.node.x, this.node.y);

        // ── Diagnostics: confirm components were found ────────────
        cc.log('[Player] RigidBody found:',  !!this._rb);
        cc.log('[Player] Animation found:',  !!this._anim);
        cc.log('[Player] Sprite found:',     !!this._sprite);
        // Check these lines in the Cocos Creator console after pressing Play.
        // If any say "false", that component is missing from the Player node.

        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_DOWN, this._onKeyDown, this);
        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_UP,   this._onKeyUp,   this);

        cc.director.getPhysicsManager().enabled = true;
        this.node.group = 'player';

        var colliders = this.getComponents(cc.PhysicsBoxCollider);
        if (colliders.length > 1) {
            this._footCollider = colliders[1];
            this._footCollider.sensor = true;
        }
        cc.log('[Player] Foot collider found:', !!this._footCollider);
    },

    update: function (dt) {
        var gm = GameManager.instance;
        var state = gm ? gm.getState() : null;
        if (state && state !== gm.STATE_PLAYING) return;

        // Guard: nothing works without a RigidBody
        if (!this._rb) {
            cc.warn('[Player] RigidBody missing — add it to the Player node.');
            return;
        }

        this._handleMove(dt);
        this._handleJump();
        this._handleFire(dt);
        this._updateAnimation();
        this._checkFallDeath();
        this._followCamera();
    },

    // ── Collision ─────────────────────────────────────────────────

    onBeginContact: function (contact, selfCol, otherCol) {
        var otherGroup = otherCol.node.group;

        if (selfCol === this._footCollider && otherGroup === 'platform') {
            this._onGround = true;
        }

        if (otherGroup === 'enemy') {
            if (!this._rb) return;
            var vel = this._rb.linearVelocity;
            cc.log('[Player] enemy contact | vel.y:', vel.y, '| node:', otherCol.node.name);
            if (vel.y < -10) {
                // Use class reference so instanceof covers Goomba + Turtle via EnemyBase.
                // Flower does not extend EnemyBase so check it separately.
                var enemy = otherCol.node.getComponent(EnemyBase) ||
                            otherCol.node.getComponent('Flower');
                cc.log('[Player] stomp | enemy found:', !!enemy);
                if (enemy && enemy.onStomp) { enemy.onStomp(); this._bounce(); }
                var am = this._getAM();
                if (am) am.playSFX(am.sfxStomp);
            } else {
                this._getHurt();
            }
        }

        if (otherGroup === 'item') {
            var pu = otherCol.node.getComponent('PowerUp');
            if (pu) pu.applyTo(this);
        }

        if (otherGroup === 'trigger') {
            cc.log('[Player] trigger contact | node:', otherCol.node.name);
            var coin = otherCol.node.getComponent('Coin');
            if (coin) coin.collect();

            var flag = otherCol.node.getComponent('Flag');
            cc.log('[Player] flag component found:', !!flag);
            if (flag) flag.activate(this.node);
        }
    },

    onEndContact: function (contact, selfCol, otherCol) {
        if (selfCol === this._footCollider && otherCol.node.group === 'platform') {
            this._onGround = false;
        }
    },

    // ── Power-up API ──────────────────────────────────────────────

    powerUp: function (type) {
        var am = this._getAM();
        if (type === 'mushroom' && this._formState === 'small') {
            this._formState = 'big';
            if (am) am.playSFX(am.sfxPowerUp);
        } else if (type === 'fireFlower') {
            this._formState = 'fire';
            if (am) am.playSFX(am.sfxPowerUp);
        }
    },

    // ── Private ───────────────────────────────────────────────────

    _handleMove: function (dt) {
        var run   = this._keys[cc.macro.KEY.shift];
        var speed = run ? this.runSpeed : this.moveSpeed;
        var vel   = this._rb.linearVelocity;

        if (this._keys[cc.macro.KEY.left] || this._keys[cc.macro.KEY.a]) {
            this._rb.linearVelocity = cc.v2(-speed, vel.y);
            this._facingRight = false;
            if (this._sprite) this._sprite.node.scaleX = -Math.abs(this._sprite.node.scaleX);
        } else if (this._keys[cc.macro.KEY.right] || this._keys[cc.macro.KEY.d]) {
            this._rb.linearVelocity = cc.v2(speed, vel.y);
            this._facingRight = true;
            if (this._sprite) this._sprite.node.scaleX = Math.abs(this._sprite.node.scaleX);
        } else {
            this._rb.linearVelocity = cc.v2(0, vel.y);
        }
    },

    _handleJump: function () {
        var jumpPressed = this._keys[cc.macro.KEY.space] ||
                          this._keys[cc.macro.KEY.up]    ||
                          this._keys[cc.macro.KEY.w];
        if (jumpPressed && this._onGround) {
            this._rb.linearVelocity = cc.v2(this._rb.linearVelocity.x, this.jumpForce);
            this._onGround = false;
            var am = this._getAM();
            if (am) am.playSFX(am.sfxJump);
        }
    },

    _handleFire: function (dt) {
        this._fireCD = Math.max(0, this._fireCD - dt);
        if (this._formState !== 'fire' || !this.fireballPrefab) return;
        if (this._keys[cc.macro.KEY.z] && this._fireCD <= 0) {
            this._fireCD = 0.4;
            var ball = cc.instantiate(this.fireballPrefab);
            ball.setPosition(this.node.x + (this._facingRight ? 40 : -40), this.node.y);
            this.node.parent.addChild(ball);
            var fb = ball.getComponent('Fireball');
            if (fb) fb.launch(this._facingRight);
        }
    },

    _bounce: function () {
        if (!this._rb) return;
        var v = this._rb.linearVelocity;
        this._rb.linearVelocity = cc.v2(v.x, 350);
    },

    _getHurt: function () {
        if (this._invincible) return;
        var am = this._getAM();
        if (am) am.playSFX(am.sfxPowerDown);
        if (this._formState !== 'small') {
            this._formState = 'small';
        }
        var gm = GameManager.instance;
        if (gm) gm.loseLife();
        // Only flash if still alive (loseLife keeps STATE_PLAYING when lives remain)
        if (!gm || gm.getState() === gm.STATE_PLAYING) {
            this._flashInvincible();
        }
    },

    _flashInvincible: function () {
        if (!this._sprite) return;
        this._invincible = true;
        var count = 0;
        var self  = this;
        var timer = setInterval(function () {
            self._sprite.enabled = !self._sprite.enabled;
            if (++count >= 14) {
                clearInterval(timer);
                self._sprite.enabled = true;
                self._invincible = false;
            }
        }, 100);
    },

    _checkFallDeath: function () {
        if (this.node.y < -400) {
            var gm = GameManager.instance;
            if (!gm || gm.getState() !== gm.STATE_PLAYING) return;
            if (this._invincible) return;
            gm.loseLife();
            // If lives remain, respawn at starting position.
            if (gm.getState() === gm.STATE_PLAYING) this._respawn();
        }
    },

    _respawn: function () {
        this.node.setPosition(this._spawnPos.x, this._spawnPos.y);
        if (this._rb) {
            this._rb.linearVelocity = cc.v2(0, 0);
            if (this._rb.type !== cc.RigidBodyType.Dynamic)
                this._rb.type = cc.RigidBodyType.Dynamic;
        }
        this._flashInvincible();
    },

    _updateAnimation: function () {
        // Skip entirely if no Animation component or no RigidBody
        if (!this._anim || !this._rb) return;

        var vel = this._rb.linearVelocity;
        var state;
        if (!this._onGround) {
            state = 'jump';
        } else if (Math.abs(vel.x) > 10) {
            state = Math.abs(vel.x) > 250 ? 'run' : 'walk';
        } else {
            state = 'idle';
        }
        var clipName = (this._formState === 'big' ? 'big_' : '') + state;

        // Guard: only play the clip if it actually exists
        var clips = this._anim.getClips();
        var exists = clips.some(function (c) { return c && c.name === clipName; });
        if (exists) {
            this._anim.play(clipName);
        }
    },

    _followCamera: function () {
        if (!this._camera) return;
        var halfBg  = 1500;  // half of background width (3000)
        var halfView = 480;  // half of canvas width (960)
        var maxOff  = halfBg - halfView;  // 1020
        // Mario's local x in World equals its canvas x (World is at canvas origin).
        // Setting camera.x to the same value centers the viewport on Mario.
        var targetX = cc.misc.clampf(this.node.x, -maxOff, maxOff);
        this._camera.x = targetX;
        // Keep HUD locked to screen by moving it in sync with the camera.
        if (this._hud) this._hud.x = targetX;
    },

    _getAM: function () {
        if (this.audioManager) return this.audioManager.getComponent('AudioManager');
        return GameManager.instance ? GameManager.instance.node.getComponent('AudioManager') : null;
    },

    _onKeyDown: function (e) {
        this._keys[e.keyCode] = true;
        cc.log('[Player] Key DOWN:', e.keyCode);  // remove after confirming keys work
    },
    _onKeyUp: function (e) {
        this._keys[e.keyCode] = false;
    },

    onDestroy: function () {
        cc.systemEvent.off(cc.SystemEvent.EventType.KEY_DOWN, this._onKeyDown, this);
        cc.systemEvent.off(cc.SystemEvent.EventType.KEY_UP,   this._onKeyUp,   this);
    },
});
