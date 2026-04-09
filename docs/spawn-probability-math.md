# Spawn Probability Mathematics
> **Source of truth** — all constants are read directly from `game/config/ModeConfig.ts` and `game/systems/SpawnerSystem.ts`.  
> Last updated: 2026-04-09

---

## Table of Contents

1. [Bomb Spawn Probability](#1-bomb-spawn-probability)
2. [Bomb Popup Logic](#2-bomb-popup-logic)
3. [Fruit Spawn Probability](#3-fruit-spawn-probability)
4. [Group Count Distribution](#4-group-count-distribution)
5. [Spawn Interval Ramp](#5-spawn-interval-ramp)
6. [Per-Mode Override Table](#6-per-mode-override-table)

---

## 1. Bomb Spawn Probability

### 1.1 Current Bomb Chance Formula

The bomb chance for a given wave is computed once per wave:

$$
p_{\text{bomb}}(s, w) = \min\!\left(p_{\max},\; p_0 + \alpha_s \cdot s + \alpha_w \cdot w\right)
$$

| Symbol | Name | Default Value |
|--------|------|---------------|
| $p_0$ | `baseBombChance` | $0.15$ |
| $p_{\max}$ | `maxBombChance` | $0.25$ |
| $\alpha_s$ | `scoreBombChanceScale` | $0.001$ |
| $\alpha_w$ | `waveBombChanceScale` | $0.001$ |
| $s$ | current score | — |
| $w$ | wave number (0-indexed) | — |

### 1.2 Progression Table

| Score $s$ | Wave $w$ | $p_{\text{bomb}}$ | Ratio (1 in N waves) |
|-----------|----------|-------------------|----------------------|
| 0         | 0        | 0.150             | 1 in 6.7             |
| 50        | 30       | 0.230             | 1 in 4.3             |
| 100       | 60       | 0.250 *(capped)*  | 1 in 4.0             |
| 200       | 100      | 0.250 *(capped)*  | 1 in 4.0             |

> **Cap reached at:** $w^* = \dfrac{p_{\max} - p_0 - \alpha_s \cdot s}{\alpha_w}$  
> At $s = 0$: $w^* = \dfrac{0.25 - 0.15}{0.001} = \mathbf{100\ \text{waves}}$

### 1.3 Modes with Lower Bomb Caps

| Mode | $p_0$ | $p_{\max}$ | Rationale |
|------|--------|------------|-----------|
| Classic / all default | 0.15 | 0.25 | Standard |
| Arcade | 0.10 | 0.15 | Bombs stay on screen — no accumulation |
| Frenzy | 0.10 | 0.15 | Fast spawn + no game-over |
| Combo Master | 0.08 | 0.15 | Timed mode, focus on combos |
| Chaos | 0.06 | 0.12 | 6.67 waves/sec + game-ending bombs |
| Zen | 0.00 | 0.00 | No bombs allowed |

---

## 2. Bomb Popup Logic

### 2.1 Decision Flow Per Wave

```
spawnWave() called
      │
      ▼
Compute p_bomb(s, w)          ← once per wave
      │
      ▼
roll = Math.random()
      │
      ├── roll < p_bomb  ──►  bombSlot = ⌊Math.random() × count⌋
      │                            Only slot bombSlot spawns a bomb.
      │                            All other slots spawn fruit.
      │
      └── roll ≥ p_bomb  ──►  bombSlot = -1
                                   All slots spawn fruit.
```

### 2.2 Guarantee: At Most One Bomb Per Wave

$$
\Pr(\text{bomb in wave} \mid \text{group size } n) = p_{\text{bomb}}(s,w) \quad \forall n \geq 1
$$

Key property: group size $n$ does **not** affect bomb probability.  
The bug that was fixed: the old per-object roll gave $\Pr(\text{any bomb}) = 1-(1-p)^n$, which at $n=6, p=0.15$ yielded **62.5%** instead of 15%.

| Group size $n$ | **Old** (per-object) $1-(1-0.15)^n$ | **New** (per-wave) |
|---------------|--------------------------------------|---------------------|
| 1             | 15.0%                                | 15.0%               |
| 2             | 27.8%                                | 15.0%               |
| 3             | 38.6%                                | 15.0%               |
| 4             | 47.8%                                | 15.0%               |
| 5             | 55.6%                                | 15.0%               |
| 6             | 62.5%                                | 15.0%               |

### 2.3 Hitbox Asymmetry (Collision System)

The **displayed** bomb radius and **collision** radius differ intentionally:

$$
r_{\text{collision}} = r_{\text{display}} - 4\;\text{px}
$$

This creates the original Fruit Ninja "fair but unfair" feel — a bomb partially hidden behind a fruit cannot be hit unless the player's blade centre passes within the reduced radius.

### 2.4 Bomb Hit Consequences by Mode

| Mode | On bomb hit |
|------|-------------|
| Classic, Memory, Risk, Precision, Tsunami, Time Freeze, Chaos | Game over immediately |
| Arcade, Frenzy, Combo Master | Score penalty (−10 pts) + **screen-wipe** (all active fruits cleared without points) |
| Zen | Bombs never spawn |

---

## 3. Fruit Spawn Probability

### 3.1 Weighted Object Pool

Each fruit type carries a weight $w_i$. The probability of selecting fruit $i$ is:

$$
\Pr(\text{fruit}_i) = \frac{w_i}{\displaystyle\sum_{j} w_j}
$$

**Default object set** total weight $W = 5 \times 3 + 7 \times 2 + 7 \times 1 = 36$

| Tier | Fruits | $w_i$ | $\Pr(\text{select})$ |
|------|--------|--------|----------------------|
| Common (weight 3) | strawberry, cherry, grape, blueberry, raspberry | 3 | $3/36 \approx 8.3\%$ each |
| Uncommon (weight 2) | orange, peach, plum, kiwi, lemon, lime, mango | 2 | $2/36 \approx 5.6\%$ each |
| Rare (weight 1) | watermelon, pineapple, coconut, banana, dragonfruit, starfruit, pomegranate | 1 | $1/36 \approx 2.8\%$ each |

**Khmer Songkran set** (Frenzy, Songkran, Tsunami):  
Total weight $W = 3 \times 3 = 9$, each fruit $= 1/3 \approx 33.3\%$.

| Fruit | $w_i$ | $\Pr$ |
|-------|--------|--------|
| numAnsom | 3 | 33.3% |
| numKrok | 3 | 33.3% |
| numKum | 3 | 33.3% |

### 3.2 Fruit vs Bomb Split Per Object Slot

Given a wave with $n$ slots and bomb chance $p_b$:

$$
\Pr(\text{slot}_i = \text{fruit}) = 1 - \frac{p_b}{n}
$$

$$
\Pr(\text{slot}_i = \text{bomb}) = \frac{p_b}{n}
$$

At early game ($p_b = 0.15$, $n = 1$): $\Pr(\text{fruit}) = 85\%$, $\Pr(\text{bomb}) = 15\%$.

---

## 4. Group Count Distribution

### 4.1 Max Group Size Thresholds

| Score $s$ | Max group size $N_{\max}(s)$ |
|-----------|------------------------------|
| $0 \leq s < 50$   | 1 |
| $50 \leq s < 100$  | 2 |
| $100 \leq s < 200$ | 3 |
| $200 \leq s < 350$ | 4 |
| $s \geq 350$       | 5 |

### 4.2 Right-Skewed Count Formula

Group count is **not** drawn from a uniform distribution. Instead:

$$
\text{count} = \max\!\left(1,\; \left\lceil U_1 \cdot U_2 \cdot N_{\max} \right\rceil\right)
\quad U_1, U_2 \sim \mathcal{U}(0,1)
$$

The product $U_1 \cdot U_2$ follows a **triangular-like distribution** on $[0,1]$ with PDF:

$$
f(x) = -2\ln(x), \quad 0 < x \leq 1
$$

This concentrates mass near $x = 0$, making small groups far more likely.

### 4.3 Simulated Size Probabilities

> Computed analytically via $\Pr\!\left(k-1 < U_1 U_2 N \leq k\right)$ using the CDF $F(x) = x(1 - \ln x)$.

$$
\Pr(\text{count} = k \mid N_{\max}) = F\!\left(\tfrac{k}{N_{\max}}\right) - F\!\left(\tfrac{k-1}{N_{\max}}\right)
$$

where $F(x) = x(1 - \ln x)$ for $0 < x \leq 1$ and $F(0) = 0$.

**When $N_{\max} = 5$ (score ≥ 350):**

| Count $k$ | $\Pr(k)$ | Approx ratio |
|-----------|----------|--------------|
| 1         | 53.7%    | 1 in 1.9     |
| 2         | 24.8%    | 1 in 4.0     |
| 3         | 13.1%    | 1 in 7.6     |
| 4         | 6.0%     | 1 in 16.7    |
| 5         | 2.4%     | 1 in 41.7    |

**When $N_{\max} = 2$ (score 50–99):**

| Count $k$ | $\Pr(k)$ |
|-----------|----------|
| 1         | 75.0%    |
| 2         | 25.0%    |

**When $N_{\max} = 1$ (score < 50):**

| Count $k$ | $\Pr(k)$ |
|-----------|----------|
| 1         | 100%     |

### 4.4 Expected Group Size

$$
\mathbb{E}[\text{count}] = N_{\max} \cdot \mathbb{E}[U_1 U_2] = N_{\max} \cdot \left(\mathbb{E}[U]\right)^2 = N_{\max} \cdot \frac{1}{4}
$$

| $N_{\max}$ | $\mathbb{E}[\text{count}]$ |
|------------|-----------------------------|
| 1          | 1.00                        |
| 2          | 1.25 (≈ effectively 1.0 after ceil) |
| 3          | 1.50                        |
| 4          | 1.75                        |
| 5          | 2.00                        |

> This matches the original Fruit Ninja feel: even at max difficulty you see more singles than groups.

---

## 5. Spawn Interval Ramp

The interval between waves decreases with score and wave count:

$$
\Delta t(s, w) = \max\!\left(\Delta t_{\min},\; \Delta t_0 - \beta_s \cdot s - \beta_w \cdot w\right)
$$

| Symbol | Name | Value |
|--------|------|-------|
| $\Delta t_0$ | `baseIntervalMs` | 1600 ms |
| $\Delta t_{\min}$ | `minIntervalMs` | 600 ms |
| $\beta_s$ | `scoreIntervalReduction` | 3 ms/pt |
| $\beta_w$ | `waveIntervalReduction` | 1 ms/wave |

**Score to reach minimum** (at $w = 0$): $s^* = \dfrac{\Delta t_0 - \Delta t_{\min}}{\beta_s} = \dfrac{1000}{3} \approx \mathbf{333\ \text{pts}}$

**Progression:**

| Score | Wave | $\Delta t$ (ms) | Waves/sec |
|-------|------|-----------------|-----------|
| 0     | 0    | 1600            | 0.63      |
| 50    | 30   | 1420            | 0.70      |
| 100   | 60   | 1240            | 0.81      |
| 200   | 100  | 900             | 1.11      |
| 333   | 167  | 600 *(min)*     | 1.67      |

---

## 6. Per-Mode Override Table

| Mode | $\Delta t_0$ (ms) | $\Delta t_{\min}$ (ms) | $p_0$ | $p_{\max}$ | Bomb ends game | Screen-wipe on bomb |
|------|-------------------|------------------------|--------|------------|----------------|---------------------|
| Classic | 1600 | 600 | 0.15 | 0.25 | ✅ | ❌ |
| Arcade | 1600 | 600 | 0.10 | 0.15 | ❌ | ✅ |
| Zen | 1600 | 600 | — | — | ❌ | ❌ |
| Songkran | 1400 | 600 | 0.15 | 0.25 | ✅ | ❌ |
| Frenzy | 900 | 337.5 | 0.10 | 0.15 | ❌ | ✅ |
| Risk | 1400 | 600 | 0.15 | 0.25 | ✅ | ❌ |
| Memory | 1600 | 600 | 0.15 | 0.25 | ✅ | ❌ |
| Combo Master | 1000 | 375 | 0.08 | 0.15 | ❌ | ✅ |
| Tsunami | 1200 | 600 | 0.15 | 0.25 | ✅ | ❌ |
| Precision | 1600 | 600 | 0.15 | 0.25 | ✅ | ❌ |
| Chaos | 600 | 150 | 0.06 | 0.12 | ✅ | ❌ |
| Time Freeze | 1600 | 600 | 0.15 | 0.25 | ✅ | ❌ |

---

*Generated from `ModeConfig.ts` · `SpawnerSystem.ts` · `CollisionSystem.ts` · `ObjectConfig.ts`*
