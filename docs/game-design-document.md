# Technical Design Document: Next.js Fruit Ninja Clone

## 1. Core Philosophy & Performance Targets
- **Performance First**: The active gameplay loop runs entirely decoupled from React. React will only manage high-level states (Menus, Settings, HUD Overlays) via Zustand.
- **Garbage Collection Optimization**: Zero object allocation in the hot loop. All fruits, particles, floating texts, and trail segments use a strict Object Pooling pattern.
- **Rendering**: `pixi.js` for WebGL hardware-accelerated 2D rendering, providing buttery smooth 60fps even with hundreds of particles.
- **Physics**: Custom 2D Euler physics (parabolic arcs, line-segment collision). Removing bulky rigid-body engines like `matter-js` allows for instant pool resets and massive performance gains.

## 2. Architecture Layers
### A. The Shell (Next.js & React)
- **App Router**: `app/page.tsx` will host the game.
- **Canvas Mount**: A single React component (`<GameContainer />`) mounts the Pixi application and attaches pointer events. Disables SSR for this component.
- **UI & HUD**: Built with Tailwind CSS and Framer Motion for aesthetic, glassmorphic overlays (Score, Lives, Combo alerts, Pause Menu).

### B. Core Game Loop (`/game/core`)
- **Game Engine**: Manages the `Pixi.Ticker`. Each tick calculates `deltaTime` and calls `update(dt)` on all active systems.
- **Object Pools**: Generic `Pool<T>` class pre-allocating 50 Fruits, 500 Particles, 10 Bombs, and 10 Trail segments. 

### C. Game Systems (`/game/systems`)
- **Input & Trail System**: Captures pointer coordinates into a history buffer. Uses interpolation (splines or line distance) to ensure that fast swipes don't leave gaps in the trail or miss collisions.
- **Physics System**: Loops through active entities applying `velocity += gravity * dt` and `position += velocity * dt`.
- **Collision System**: Line-to-Circle intersection math. The "swipe" line segments are checked against fruit/bomb bounding radii.
- **Spawner System**: Controls waves, fruit types (standard, bonus, hazard), and scales difficulty seamlessly via a `DifficultyStrategy`.

### D. Audio & Effects (`/game/effects`)
- **Howler.js**: Preloads spatial/multi-channel audio: `slash-1`, `slash-2`, `splat`, `bomb-fuse`, `explosion`.
- **Particle Emitters**: Slicing a fruit triggers an explosion of colored `Particle` entities (based on fruit type) that fade and fall.
- **Screen Shake**: Applied to the main Pixi container or CSS transform when a bomb detonates or a massive combo is hit.

## 3. Implementation Phases

### Phase 1: Foundation & Dependencies
- `pnpm i pixi.js zustand framer-motion howler lucide-react`
- Setup Next.js directory structure (`/game`, `/store`, `/components/ui`).
- Implement the Zustand `useGameStore` (score, lives, combo, gameState).

### Phase 2: Core Loop & Engine
- Implement `Pool<T>` utility.
- Build `Game.ts` which initializes the Pixi Application.
- Create the `<GameCanvas>` React component that safely mounts the Pixi instance and binds resize observers.

### Phase 3: Input & Trail
- Implement multi-touch / mouse drag detection on the canvas.
- Build the `TrailSystem` rendering a dynamic Pixi `Graphics` mesh that fades over time.
- Implement interpolation to ensure fast swipes create continuous, smooth arcs.

### Phase 4: Physics & Slicing
- Build the `Fruit` class. Render placeholder graphics (circles). Use custom 2D gravity math.
- Implement the `CollisionSystem`. Detect when the interpolated swipe line intersects a fruit's radius.
- Implement slicing: Split the fruit into two smaller halved meshes, apply diverging velocity, and add points.

### Phase 5: Spawner & Difficulty
- Implement the `SpawnerSystem`. Spawn fruits from the bottom edge with randomized velocities, accounting for screen width limits.
- Implement Waves: e.g., "Left-to-Right cascade", "Center burst".
- Add `Bomb` entities. Slice a bomb -> Game Over. Let fruit fall -> Lose 1 Life.

### Phase 6: Particles & Audio (The "Juice")
- Integrate `howler.js` and map sounds to interactions.
- Build the `ParticleSystem` for juice drops and slice impacts. Pooled and extremely fast.
- Add Combo multipliers (slicing 3+ fruits in rapid succession) triggering floating text "+10 Combo!".

### Phase 7: UI & Polish
- Implement Main Menu, Game Over Screen, and Pause Screen using Framer Motion.
- Add LocalStorage persistence for Best Score and Settings.
- Perform final performance profiling on mobile emulators.

## 4. Testing & QA Checklist
- [ ] Memory Allocation Profile: Ensure sawtooth pattern in DevTools is minimal (Pooling check).
- [ ] Swipes: Moving the mouse abruptly fast registers collisions without "teleporting" through fruits.
- [ ] Resize: Changing browser size cleanly scales the game area and bounds.
- [ ] Pause/Resume: Tab visibility API correctly halts the engine loop and sounds.
- [ ] Mobile Touch: `touchstart`, `touchmove` handles exactly like mouse dragging.
