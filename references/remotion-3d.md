# Remotion 3D engine (Three.js) — `templates/remotion/`

The second engine of this skill. Use it when the user picks a **3D look** (gallery 12 `3d-pop`, 13 `3d-premium`) or one of the Remotion 2D looks (14–16), or asks for real 3D objects (a phone that turns, a padlock that closes, a coin that flies). Everything else stays with the plan.json engine, which is faster to iterate.

The template is the full Remotion project of the NiasLogin voice-over edit (41.8 s, audio only). It is a **worked example to adapt**, not a parameterised component: the timing, objects and choreography belong to that video. For a new video you keep the infrastructure (fonts, look context, materials, overlay layers, audio mix, render commands) and rewrite the story files.

## Start a project

```bash
python <skill>/scripts/remotion_init.py "<workdir>" --audio "<voice.mp3|video>" [--install]
```

It copies `templates/remotion/` to `<workdir>/remotion/`, copies the user's fonts (Hasti, Peyda from `assets/fonts/user/`, never published) to `public/pop3d/fonts/`, converts the voice to `public/audio.mp3`, and with `--install` runs `npm install`. Then run `analyze.py` as usual for the transcript.

## File map (`src/pop3d/`)

| file | what it holds | rewrite per video? |
|---|---|---|
| `timing.ts` | `FPS`, `DURATION_S`, helpers (`prog`, `keys`, `presence`, easings, `rand`, `fa` Persian digits), `SEGMENTS` (Whisper words, spelling fixed), `T` key moments | **yes**: duration, SEGMENTS, T |
| `fonts.ts` | `loadFont` for Hasti/Peyda + `delayRender` until `document.fonts.ready`; `useCanvasTexture`, `roundRect`, `faText` (RTL text on a canvas) | no |
| `look.tsx` | `LookProvider` / `useLook()` → `{premium, back, c, head}`: one code path, two looks. `PREMIUM_MAP` turns toy colours into grown-up ones | add a new look here |
| `materials.tsx` | `Glossy`, `Metal`, `Matte` (premium → satin: roughness ≥ .42, clearcoat .35), `gearGeometry`, `checkGeometry` | rarely |
| `Phone.tsx` | 3D phone whose screen is a per-frame `CanvasTexture` (shop → form → call → OTP screens) | screens yes |
| `objects.tsx` | QuestionMark, Parcel, Track, House, Gears, Card, Toggle, Padlock, CheckCoin, Confetti (premium: light rings), Shop, TroubleBall, CommentBubble, OtpTile | reuse / add |
| `World.tsx` | camera dolly + shake, lights, floor shadow, choreography of every object by `t` | **yes** |
| `Overlay.tsx` | HTML layers: background colour wipes / `PremiumBackground`, `HEADS` (headlines with per-word `at` + `fx`: glitch, shake, strike, stamp, grow), `Chips`, `Captions`, `Flashes` | **yes**: HEADS, chips, colour keys |
| `Pop3DVideo.tsx` | SFX list `[time, file, vol]`, `SOFT` remap + `SKIP_PREMIUM` for the premium look, voice + music + SFX | SFX list yes |
| `src/Root.tsx` | compositions `Pop3DVideo`, `Premium3DVideo` (`defaultProps={{premium:true}}`) + the 2D ones | ids / duration |

The 2D Remotion styles live in `src/minimal/`, `src/infographic/`, `src/MainVideo.tsx` + `src/scenes/`, `src/components/`.

## Rules that made it work

- **All motion from `useCurrentFrame()`** (`t = frame / FPS`). Never `useFrame` from R3F: renders must be deterministic. `<Sequence>` inside `ThreeCanvas` needs `layout="none"`.
- **Context must be provided twice**: once outside and once *inside* `<ThreeCanvas>` (R3F uses its own reconciler, so React context does not cross it).
- Renderer: `shadows={{type: PCFSoftShadowMap}}`, `ACESFilmicToneMapping`, `RoomEnvironment` + PMREM for reflections, a `shadowMaterial` floor (y −1.55) so objects sit on something.
- Persian text inside 3D (screens, cards): draw it on a canvas with `ctx.direction = "rtl"` through `faText`, use Persian digits (`fa()`), and wait for fonts first.
- Word timing: headlines and object hits use Whisper word times (`SEGMENTS`/`T`), exactly like `w:` anchors in the plan engine. Correct Whisper spellings in `SEGMENTS` (e.g. سبت→ثبت, احراس→احراز, تعیید→تأیید).
- **Safe area** is the same as hard rule 2: headlines top ≥ 300 px, captions ≤ 1500 px, nothing readable at x > 930 for y 1150–1500. Pull the camera back rather than letting the 3D object cover the headline (the first draft had a phone that hid the captions: fixed with scale .85 + camera +1.3).
- Creative moves are still required (hard rule 1): in the template they were the swapped-digit form, the dead-end track that later becomes an open road, the padlock that closes on «قفل» and opens with the «تأیید» coin, and the shield that bounces «دردسر» away.

## Not cartoony: what the premium look changes

The user found the pop look childish. Ask early (interview Q "mood") and default to premium for serious products. The differences, all switched by `useLook().premium`:

| childish (pop) | grown-up (premium) |
|---|---|
| saturated full-screen colour wipes | graphite background, one accent glow that changes with the story (red problem → violet solution → green verified) |
| glossy candy plastic | satin, brushed steel, titanium (`PREMIUM_MAP`, roughness ≥ .42) |
| overshoot / bounce (`easeOutBack`, elastic) | `easeOutCubic`, no overshoot; shake × 0.45 |
| bubbly display font with extruded 3D shadow (Hasti) | Peyda 800, fade + blur + rise, size × .74 |
| confetti, toy shapes | thin light rings, a metal gyroscope on the turning point |
| coloured caption boxes | plain caption with a thin accent underline |
| happy 120 BPM music, loud pops | calm 92 BPM bed, soft SFX (`SOFT` map), fewer hits (`SKIP_PREMIUM`), × .75 volume |

Further steps toward "serious" (offer them): real screenshots of the user's **local** site as the phone/card textures (hard rule 4: `new TextureLoader().load(staticFile("shots/x.png"))` on the screen plane instead of the drawn mock), and a shallow depth of field (`@react-three/postprocessing` `DepthOfField`, focus on the hero object) so the background blurs.

## Music and SFX

- Music is synthesized, original, CC0: `tools/make_music.py` (pop, 120 BPM) and `tools/make_music_premium.py` (pass `premium` for the 92 BPM bed). Set `MUSIC_DUR` (voice length + 0.4) and `MUSIC_DROP` (the turning-point word, e.g. «اما راه حلش») and run `python tools/make_music.py public/pop3d/music.wav` / `python tools/make_music_premium.py public/pop3d/music_premium.wav premium`. `remotion_init.py` does this for you.
- SFX: `public/pop3d/sfx/*.wav` (26 files: whoosh, impact, coin, error, success, click, ding, pop, typing, notify, soft_whoosh, soft_pop, shimmer, soft_tick, air, draw_soft…). Same discipline as the plan engine: one sound per real event, ~1 per 2.5 s at most.

## Render

```bash
cd <workdir>/remotion
npx remotion studio                                                # preview
npx remotion bundle                                                # → build/ (reuse for stills)
npx remotion still build Premium3DVideo f.jpg --frame=738 --gl=angle --scale=0.4   # check frames
npx remotion render build Premium3DVideo "../out.mp4" --gl=angle --codec=h264 --crf=18 --concurrency=4
ffmpeg -i ../out.mp4 -c:v copy -af loudnorm=I=-14:TP=-1.5:LRA=11 "../<name> (final).mp4"
```

`--gl=angle` is required on Windows for WebGL in headless Chrome. Check with a contact sheet like in Step 8, and say honestly that you checked frames, not the sound. Run `npx remotion` from the project folder (it fails from elsewhere).
