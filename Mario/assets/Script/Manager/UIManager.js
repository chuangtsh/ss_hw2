// Scene transition helper with a simple fade.
cc.Class({
    extends: cc.Component,

    properties: {
        fadeColor: { default: cc.Color.BLACK },
        fadeDuration: { default: 0.4 },
    },

    onLoad: function () {
        this._overlay = this._buildOverlay();
    },

    loadScene: function (sceneName) {
        this._fadeOut(function () {
            cc.director.loadScene(sceneName);
        });
    },

    // ── Private ───────────────────────────────────────────────────

    _buildOverlay: function () {
        var node = new cc.Node('_fade_overlay');
        node.setContentSize(cc.winSize);
        node.setPosition(0, 0);
        node.opacity  = 0;
        node.color    = this.fadeColor;
        var sprite    = node.addComponent(cc.Sprite);
        sprite.spriteFrame = new cc.SpriteFrame();
        var scene = cc.director.getScene();
        if (scene) scene.addChild(node, 9999);
        return node;
    },

    _fadeOut: function (cb) {
        var node = this._overlay;
        if (!node || !node.isValid) { cb(); return; }
        cc.tween(node)
            .to(this.fadeDuration, { opacity: 255 })
            .call(cb)
            .start();
    },
});
