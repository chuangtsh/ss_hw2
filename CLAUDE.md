# Mario (Cocos Creator 2.4.8) — Project Context

## Stack
- Cocos Creator 2.4.8, JavaScript (cc.Class), Box2D physics
- Working directory: `c:\kesler\SS\hw2_COCO\Mario`

## Script locations
```
assets/Script/
  Player/Player.js          — movement, jump, fire, stomp, hurt, camera follow
  Enemy/EnemyBase.js        — base patrol + wall-reverse + stomp death (window.EnemyBase)
  Enemy/Goomba.js           — extends EnemyBase, squish-tween death fallback
  Enemy/Turtle.js           — shell mechanic (3 stomp states)
  Enemy/Flower.js           — tween-based rise/hide cycle, optional fireball
  Object/Coin.js            — trigger sensor, collect() → addCoin + score popup
  Object/PowerUp.js         — item group, startMoving() after slide-out
  Object/QuestionBlock.js   — platform group, bump from below → spawn coin/powerup
  Object/Flag.js            — trigger sensor, activate(playerNode) → level complete
  Object/Fireball.js        — launched by Player (fire form) or Flower
  Manager/GameManager.js    — singleton, score/coins/lives/timer/state
  Manager/AudioManager.js   — BGM + SFX playback
  Manager/UIManager.js      — scene transition fades
  UI/HUD.js                 — score/coins/lives/timer labels
  UI/PauseMenu.js           — ESC toggle, resume/restart/mainmenu
```

## Collision groups & matrix
Groups: default, player, enemy, platform, trigger, item
Key matrix entries (all confirmed working):
- player ↔ enemy ✅   player ↔ platform ✅   player ↔ trigger ✅
- player ↔ item ✅    enemy ↔ platform ✅     enemy ↔ enemy ✅

## Key design decisions made this session
- `getComponent(EnemyBase)` (class ref) used instead of string — covers Goomba+Turtle via instanceof
- Goomba/EnemyBase death: checks if 'die' clip exists; falls back to cc.tween squish if not
- QuestionBlock bump: checks `playerRb.linearVelocity.y > 0` (more reliable than contact normal)
- Flag.activate(playerNode) is the public entry point — called from both Player.onBeginContact and Flag.onBeginContact
- Player._keys = {} is cleared on flag contact to freeze input before tween

## Prefabs still needed (editor work)
- [ ] Goomba.prefab  (Sprite + RigidBody Dynamic + PhysicsBoxCollider + Goomba.js)
- [ ] Turtle.prefab  (same pattern + shell/shellSpin anim clips)
- [ ] Flower.prefab  (Sprite + PhysicsBoxCollider sensor + Flower.js, NO RigidBody)
- [ ] Coin.prefab    (Sprite + PhysicsBoxCollider sensor + Coin.js)
- [ ] QuestionBlock.prefab (Sprite + PhysicsBoxCollider solid + QuestionBlock.js)
- [ ] PowerUp.prefab (Sprite + RigidBody Dynamic + PhysicsBoxCollider + PowerUp.js)

## Debug logs still in Player.js (remove when done)
- `[Player] Key DOWN: ...`  — line ~258
- `[Player] enemy contact ...` — in onBeginContact
- `[Player] stomp | enemy found: ...` — in onBeginContact
- `[Player] trigger contact ...` — in onBeginContact
