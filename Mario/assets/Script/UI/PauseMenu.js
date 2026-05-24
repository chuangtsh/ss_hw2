// Pause overlay — attach to a PauseMenu node (active=false by default).
// Toggled by pressing ESC. Buttons call resume / restart / mainMenu.
cc.Class({
    extends: cc.Component,

    onLoad: function () {
        this.node.active = false;
        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_DOWN, this._onKey, this);
    },

    _onKey: function (e) {
        if (e.keyCode === cc.macro.KEY.escape) this.toggle();
    },

    toggle: function () {
        var gm = GameManager.instance;
        if (!gm) return;
        if (this.node.active) {
            this.node.active = false;
            gm.resume();
        } else {
            this.node.active = true;
            gm.pause();
        }
    },

    resume: function () {
        this.node.active = false;
        var gm = GameManager.instance;
        if (gm) gm.resume();
    },

    restart: function () {
        var gm = GameManager.instance;
        if (gm) { gm.resetForNewLevel(); gm.resume(); }
        cc.director.loadScene('Game');
    },

    mainMenu: function () {
        var gm = GameManager.instance;
        if (gm) { gm.resetAll(); gm.resume(); }
        cc.director.loadScene('MainMenu');
    },

    onDestroy: function () {
        cc.systemEvent.off(cc.SystemEvent.EventType.KEY_DOWN, this._onKey, this);
    },
});
