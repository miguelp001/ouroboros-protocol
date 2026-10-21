# OUROBOROS PROTOCOL: VAULT ZERO

## Master Game Design Document (v6.0 - Definitive AI Ingestion Blueprint)

## 1. EXECUTIVE SUMMARY & CORE PILLARS

**Title:** Ouroboros Protocol (Working Title)
**Genre:** Post-Collapse Noir Tactical RPG / Quality-Based Narrative (QBN)
**Perspective:** First-Person Point-and-Click (Diegetic HUD via Handheld Slate)
**Core Experience:** A blend of *Fallen London* (text-driven, QBN storylets) and *Powered by the Apocalypse* (2d6 narrative resolution).
**Premise:** As Agent 0, you unearth a cracked, AI-powered slate ("Ouroboros") and an iron key that opens an impossible 1860s taproom from any door. You must rebuild a clandestine Agency, manage a roster of 15 mortal operatives, manipulate a living faction ecosystem, and secure three world-altering keys.

## 2. AUDIO-VISUAL DIRECTION & ASSET GENERATION

### 2.1 Visual Style: Gritty Noir (*Sin City* filter)

* **Monochrome Foundation:** True ink-blacks (`#0a0a0c`) and stark chalk-whites (`#f4f4f5`). High-contrast, single-source key lighting. Heavy 35mm film grain, moisture, rain streaks, and physical textures. *Crucial: NO comic speedlines, no halftones, no cartoon borders.*
* **The Hazard Amber Accent:** `#facc15` (Phosphorus Yellow). The *only* color. Used diegetically for the slate's UI, vintage gas lamps, anomaly pings, and critical text.
* **Diegetic Interface:** UI elements are heavily angled (-4 to -7 degrees) to match the perspective of Agent 0 holding the physical slate. HUD elements look stenciled or projected, maintaining scene depth.

### 2.2 Audio & Soundscape (Google Lyria & Foley)

* **Ambient Music (Dynamic by Sector):**
  * *The Sink:* Hollow synths, rhythmic water sloshing, foghorns.
  * *The Heights:* Oppressive pulsing bass, synthetic choral hums.
  * *Old Town:* Frantic, broken scrap-metal percussion.
  * *The Redoubt:* Militaristic snare cadences swallowed by radio static.
  * *The Scorch:* Desolate howling wind, distorted analog drone.
* **The Threshold Bar (Sanctuary):** Absolute isolation. All external audio cuts out. Replaced strictly by a ticking 1860s grandfather clock, hearth crackle, and glass clinking.
* **SFX:** Diegetic UI clicks, CRT boot-ups, and dial-up static for the Slate. Heavy physical foley for world interactions. PbtA rolls feature actual physical dice clattering against wood followed by a heavy impact sound.

## 3. CORE MECHANICS & CHARACTER RESOLUTION

### 3.1 Agent 0 stats & Character Generation

Before the game begins, the player selects a Background Profile. This assigns a fixed array (`+2, +1, 0, -1`) to the four core stats:
* **SCRAP:** Violence, physical force, and endurance.
* **COVER:** Stealth, deception, and agility.
* **RECKON:** Analysis, tech manipulation, and logic.
* **TETHER:** Anomalous attunement, willpower, and empathy.

### 3.2 The Action Economy & Shifts

* **Shifts:** DAWN, DUSK, NIGHT. 1 Major Field Action = 1 Shift.
* **The Night Shift Dilemma:** Resting at Night inside the Bar clears Fatigue. Pushing through the Night into the field inflicts `[FATIGUED]` (-1 Forward to rolls).
* **Persistent Dispatch (Safehouse):** Action economy micromanagement is removed. When an un-deployed agent is assigned to a safehouse workstation (Forge, Infirmary) or an automated field scout mission, they are *locked in*. They remain on that task until it is completed or escalating threat forces an abort.

### 3.3 Powered by the Apocalypse (PbtA) Resolution

All risk is resolved via `2d6 + Stat`.
* **10+ (Clean Hit):** Perfect execution.
* **7-9 (Costly Advance):** Success with a complication (injury, collateral damage, heat spike).
* **6- (Miss):** Critical Blunder. Triggers an immediate "Interrupt Card" (see 4.1).

### 3.4 Companions & "Help Out"

* **Field Deployment:** Agent 0 takes 1 active Field Partner.
* **Help Out Mechanic:** When Agent 0 rolls, the companion can "Help Out" by rolling `2d6 + Stat`. On a 7+, they grant Agent 0 a flat `+1` modifier to the primary roll.

### 3.5 Heat, Catastrophic Extraction & Fail States

* **Heat:** Represents local hostility. High Heat makes Factions progress faster. Reduced mechanically by specific actions (e.g., bribing Redoubt patrols).
* **Permadeath:** Companions face permanent death. Their seats at the bar remain empty.
* **Catastrophic Extraction Protocol:** If Agent 0's HP hits zero, they do *not* die. Ouroboros burns massive Heat to emergency-vent Agent 0 back to the Threshold Bar. The companion deployed with Agent 0 is automatically killed covering the retreat. 
* **True Game Over:** A Game Over requiring a save reload *only* occurs if Agent 0 is deployed entirely solo and falls, or if the entire 15-person roster is wiped out.

## 4. QUALITY-BASED NARRATIVE (QBN) & WAKES

### 4.1 The Deck & The Interrupt Engine

The React engine uses a pure QBN system. Every node has a deck of potential Storylets (JSON objects) filtered by active global qualities.
* **The Interrupt Deck:** When a player rolls a `6-`, the current hand of node options is instantly cleared. The engine forces a single, unavoidable consequence card (`"isInterrupt": true`) from the Interrupt Deck (e.g., *The Rippers Corner You*). This immediate crisis must be resolved before standard traversal repopulates.

### 4.2 The Epitaph Ledger & The Wake Tollgate

The engine silently logs context arrays for every operative (victories, collateral damage, cause of death).
* **The Queue & Tollgate:** Deaths are logged into a `pendingWakes` queue. Wakes do not consume field shifts. Instead, the next time Agent 0 returns to the Threshold Bar, the UI locks down.
* **The Choice:** The player is forced to either **Attend the Wake** (dynamic string-building dialogue mourning the agent, restoring Morale, cutting a notch in the bar) or **Blow it Off** (skips the scene, severe Morale penalty, damages trust with surviving members).

## 5. FACTION AI: PbtA FRONT CLOCKS

Factions operate via **PbtA Front Clocks**, simulating living agendas without the overhead of A* GOAP pathfinding.
* **Stats:** `FORCE`, `COGNITION`, `GUILE`, `ZEAL`.
* **Daily Resolution Phase:** Factions *do not roll every shift*. They roll `2d6 + Stat` once per day at the DAWN phase against their current objective clock (e.g., a 6-segment clock).
* **The Heat Throttle:** District Heat dictates faction effectiveness. If Heat is low, the faction rolls with a penalty (-1). If Agent 0 has driven Heat high, the faction rolls with advantage (+1).
  * **10+:** Advance clock by 2 segments.
  * **7-9:** Advance clock by 1 segment.
  * **6-:** Setback/delay.
* **Suspicion:** Separate from District Heat. If Suspicion hits 4/4, they actively hunt Agent 0.

## 6. ANOMALIES & THE THREE KEYS

### 6.1 Anomaly Ecology

* **Tier 1-2:** Spatial loops, residual objects.
* **Tier 3-4:** Mobile, sapient entities (Vampires, Shapeshifters). Can migrate map nodes.
* **Tier 5:** Systemic reality tears. Spreads if uncontained.

### 6.2 The Three Keys

1. **Threshold Key:** Prologue item. Evacuates party to the 1860s Bar from any door.
2. **Skeleton Key:** Bypasses physical tumblers, vaults, and deadbolts.
3. **Ghost Key:** The ultimate digital skeleton key. Slices through biometric scanners, corporate ICE, and digital megastructure locks.

### 6.3 Vault Zero (Endgame)

Contains the **Cryo-Founder** (join or wander based on ending states), the **Three-Drop Vial** (grants cellular immortality but risks eternal capture), and the **All-Cutting Edge**. Post-game unlocks Director Mode for infinite procedural node management across multiple 2-agent cells.

## 7. GEOGRAPHY & TRANSIT ROUTES (VIGNELLI MAP DATA)

The map is a strict Vignelli-style SVG network.
* **Line A (The Tower Artery - Heights):** H-01 Apex Concourse -> H-02 Bio-Farm Hub -> H-03 Mid-Tier Transit -> C-04 Central Merge.
* **Line B (The Submerged Spur - Sink):** S-01 Pontoon Junction -> S-02 The Drowned Depot -> S-03 Coastal Refinery.
* **Line C (The Cut - Old Town):** OT-01 The Sprawl Edge -> OT-02 Tenement Turnstile -> OT-03 The Meat Market -> OT-04 Dead Iron Yard.
* **Line F (Redoubt Express):** R-01 Checkpoint Alpha -> R-02 The Armory Spoke -> R-03 Command Sub-Level.
* **Line S (Scorch Feeder):** X-01 Slag Crossing -> X-02 Toxic Basin -> X-03 Terminus Zero.
* **Off-Grid:** The Threshold Bar (Floating Keyhole Icon).

## 8. THE PROLOGUE SCRIPT (FIRST 10 MINUTES)

1. **Beat 1 (Culvert Chase):** Agent 0 sprints through flooded Sector Zero, hunted by a Tier 3 Shifting Hound.
2. **Beat 2 (The Slate):** Agent 0 trips over a dead operative, triggering biometric handshake on the cracked Ouroboros slate.
3. **Beat 3 (The Roll):** `[SCRAP: Fire sidearm]` or `[COVER: Drop flare]`. Datapad registers anomaly and highlights extraction vector.
4. **Beat 4 (The Door):** Recover the **Threshold Key** from the corpse. Slam it into a dead-end iron door.
5. **Beat 5 (Sanctuary):** Fall into the 1860s Taproom. Audio cuts out. The Bartender introduces mechanics.

## 9. THE ROSTER (15 BESPOKE AGENTS)

*(Full 15-character profiles detailed in section 5 of previous addendum: Silas Vance, Cora Ramos, Dr. Aris Voss, "Nail" Reyes, Sister Maren, Lyra, Jax "Tinker", Elias Thorne, "Brick", Kaelen, Sgt. Graves, Valerius, Dr. Lin, "Ghost", Elara).*

## 10. TECHNICAL ARCHITECTURE (REACT / ZUSTAND STATE)

```typescript
interface GameEngineState {
  // Agent 0 Stats & Qualities
  agentZero: {
    stats: { scrap: number; cover: number; reckon: number; tether: number };
    background: string;
    hp: number;
  };
  qualities: Record<string, number | boolean | string>;
  economy: { digitalCred: number; chipCred: number; heat: Record<string, number> };
  
  // Time & Progression
  time: { day: number; shift: 'DAWN' | 'DUSK' | 'NIGHT'; fatigued: boolean; };
  agency: { level: 1 | 2 | 3 | 4; keys: string[]; };
  
  // QBN Storylet Engine
  activeDeck: Array<Storylet>; // Filtered hand currently dealt
  isInterrupt: boolean; // Locks UI to a consequence card on a 6-
  
  // Roster & Wakes
  roster: Array<{
    id: string;
    status: 'ACTIVE' | 'DEAD' | 'MUTINIED';
    hp: number;
    morale: number;
    activeAssignment: { type: 'FIELD' | 'FORGE' | 'INFIRMARY' | 'SCOUT'; target: string; progress: number } | null;
    epitaphLedger: Array<string>;
  }>;
  pendingWakes: Array<string>; // Queue of dead agent IDs waiting for a Tollgate Bar return

  // Faction PbtA Front Clocks (Evaluated Daily at Dawn)
  factions: Record<string, {
    stats: { force: number; cognition: number; guile: number; zeal: number };
    activeFronts: Array<{ id: string; name: string; progress: number; max: number }>;
    suspicionLevel: number; // 0 to 4
  }>;
}

interface Storylet {
  id: string;
  isInterrupt?: boolean;
  requirements: Record<string, any>; 
  branches: Array<StoryletBranch>;
}
```

*End of Document.*