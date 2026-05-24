// Manages BGM and SFX using cc.audioEngine (Cocos Creator 2.x API).
cc.Class({
    extends: cc.Component,

    properties: {
        bgmClips:        { default: [], type: [cc.AudioClip] },
        sfxJump:         { default: null, type: cc.AudioClip },
        sfxCoin:         { default: null, type: cc.AudioClip },
        sfxStomp:        { default: null, type: cc.AudioClip },
        sfxKick:         { default: null, type: cc.AudioClip },
        sfxPowerUp:      { default: null, type: cc.AudioClip },
        sfxPowerDown:    { default: null, type: cc.AudioClip },
        sfxGameOver:     { default: null, type: cc.AudioClip },
        sfxLevelClear:   { default: null, type: cc.AudioClip },
    },

    playBGM: function (clipOrIndex) {
        var clip = (typeof clipOrIndex === 'number')
            ? this.bgmClips[clipOrIndex]
            : clipOrIndex;
        if (!clip) return;
        cc.audioEngine.playMusic(clip, true);
    },

    stopBGM: function () {
        cc.audioEngine.stopMusic();
    },

    playSFX: function (clip) {
        if (!clip) return;
        cc.audioEngine.playEffect(clip, false);
    },
});
