# Web Mario — Assignment 02
**Student ID:** 113030002  
**Course:** System Software (Spring 2026)  
**Engine:** Cocos Creator 2.4.8 (JavaScript)  
**Deployed URL:** https://sshw2-c74c3.web.app

---

## Project Overview

A browser-based Super Mario Bros. clone built with Cocos Creator 2.4.8 and Box2D physics, deployed on Firebase Hosting. The game features full player movement, enemies, collectibles, power-ups, a HUD, a game-over/course-clear screen, and a **real-time online leaderboard** backed by Firebase Realtime Database.

---

## Features Implemented

### Player
- Left / Right movement (A/D or arrow keys), hold Shift to run
- Jump (Space / W / Up arrow) with ground detection via foot sensor collider
- Fall-death detection: losing a life and respawning at the start position with invincibility flash
- Invincibility flash after taking damage (sprite blinks for ~1.4 seconds)
- Camera follows Mario, clamped to level bounds; HUD stays fixed on screen

### Power-ups
- **Mushroom** — Mario grows to 1.5× scale when collected; shrinks back on hit
- Mushrooms are spawned from Question Blocks (`?` blocks) when bumped from below
- Power-up slides out of the block and moves horizontally, reversing on walls

### Enemies
- **Goomba** — patrols platforms, reverses on walls; stomp to kill (bounce reward)

### Collectibles & Objects
- **Coins** — trigger-sensor coins; collecting 100 grants an extra life
- **Question Blocks** — bump from below to release coin or mushroom
- **Flag** — touching the end-of-level flag triggers the Course Clear sequence

### Game State & HUD
- Score, coins, lives, world, and countdown timer displayed in HUD
- Timer counts down; reaching 0 triggers game over
- Lives system: 3 lives; losing all triggers game over

### Audio
- BGM plays and loops throughout the level
- Sound effects: jump, coin collect, stomp, power-up, power-down, level clear, game over
- SFX use a separate audio channel — they never interrupt the BGM

### Game Over / Course Clear Screen
- Displays score, coins, lives, world, and time remaining
- Different background shown for win (Course Clear) vs. lose (Game Over)
- Retry / Continue / Main Menu buttons

---

## Firebase Integration

### Authentication
- Email + password sign-up and login via **Firebase Authentication**
- Username stored in **Firebase Realtime Database** under `/users/{uid}`
- Auth overlay shown before the game starts; dismissed on successful login

### Leaderboard (Firebase Realtime Database)
- Score submitted to `/leaderboard/{uid}` after every game session (best score kept)
- Each entry stores: username, score, coins, world, level, time remaining, timestamp
- Top-10 leaderboard fetched and displayed in a styled DOM overlay on the Game Over screen
- Columns: Rank, Name, Score, Coins, World, Time
- Current player's row is highlighted in gold
- Firebase security rules enforce that each user can only write their own entry; all authenticated users can read

---

## File Structure

```
Mario/
├── assets/
│   └── Script/
│       ├── Player/Player.js          — movement, jump, fire, stomp, hurt, camera
│       ├── Enemy/EnemyBase.js        — base patrol + wall-reverse + stomp death
│       ├── Enemy/Goomba.js           — extends EnemyBase
│       ├── Enemy/Turtle.js           — shell mechanic
│       ├── Enemy/Flower.js           — tween rise/hide cycle
│       ├── Object/Coin.js            — trigger sensor, collect()
│       ├── Object/PowerUp.js         — item group, slide-out after spawn
│       ├── Object/QuestionBlock.js   — bump from below → spawn content
│       ├── Object/Flag.js            — level-end trigger → clear sequence
│       ├── Object/Fireball.js        — launched by Player or Flower
│       ├── Manager/GameManager.js    — singleton: score/coins/lives/timer/state
│       ├── Manager/AudioManager.js   — BGM + SFX playback
│       ├── Manager/UIManager.js      — scene transition fades
│       ├── UI/HUD.js                 — score/coins/lives/timer labels
│       ├── UI/PauseMenu.js           — ESC toggle
│       ├── UI/GameOverScreen.js      — game over / course clear summary + leaderboard
│       └── UI/LevelCompleteUI.js     — in-scene level complete overlay
├── build/web-desktop/
│   └── index.html                    — patched entry point (Firebase + leaderboard injected)
├── patch-build.js                    — post-build script: injects Firebase SDK + auth + leaderboard
├── firebase.json                     — Firebase Hosting + Database rules config
├── database.rules.json               — Firebase RTDB security rules (with score index)
└── README.md                         — this file
```

---

## How to Build & Deploy

1. Build in Cocos Creator: **Project → Build → Web Desktop**
2. Run: `node patch-build.js` (injects Firebase auth + leaderboard into index.html)
3. Deploy: `firebase deploy`
