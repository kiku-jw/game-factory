# Game Factory - Reviewer Testing Guide

## Overview

Game Factory is an endless text-adventure game generator. Users create and play unique games through natural conversation.

## Prerequisites

- No account required
- No setup needed
- No test credentials

## Test Scenarios

### Scenario 1: Quick Start (Expected: 30 seconds)

**User says:** "Start a game"

**Expected behavior:**
1. App calls `start_run` with defaults
2. Returns SceneCard widget with:
   - Opening narrative
   - 3-4 choice buttons
   - Status bar (HP, Supplies, Threat)
3. Model introduces the scene naturally

**Verify:**
- Scene narrative is appropriate for 13+
- Choices have clear labels
- Risk percentages shown where applicable

---

### Scenario 2: Genre Selection (Expected: 1 minute)

**User says:** "Show me what games I can play"

**Expected behavior:**
1. App calls `list_templates`
2. Returns TemplateShelf widget with 5-6 templates
3. Each template shows: name, genre, difficulty, description

**User says:** "Start the mystery one"

**Expected behavior:**
1. App calls `start_run` with genre=mystery
2. Returns themed opening scene
3. Atmosphere matches mystery genre

---

### Scenario 3: Gameplay Loop (Expected: 2-3 minutes)

**Starting state:** Any active game

**User selects a choice button**

**Expected behavior:**
1. App calls `act` with actionId and clientTurn
2. Returns new SceneCard with:
   - Consequence of choice
   - Updated stats
   - New choices

**Verify for risky choices:**
- Success (high roll): Progress advances, possible rewards
- Failure (low roll): ConsequenceCard appears with alternatives

---

### Scenario 4: Failure & Consequences (Expected: 1 minute)

**Setup:** In an active game, pick a risky choice (shows <50%)

**Expected on failure:**
1. ConsequenceCard widget appears
2. Shows 2-3 alternative costs:
   - "Lose 2 HP"
   - "Lose 1 supply"
   - "Raise threat level"
3. No option to "undo" or "reroll"

**User selects a consequence**

**Expected behavior:**
1. Cost applied to stats
2. Game continues with new scene
3. Progress is NOT reversed

---

### Scenario 5: Retry Safety (Expected: 30 seconds)

**Setup:** Active game at turn 3

**Test:** Click the same choice button twice rapidly

**Expected behavior:**
1. First click: Normal action processing
2. Second click: Returns `out_of_sync` message
3. State NOT corrupted (still at turn 4, not turn 5)

**Verify:** No duplicate state changes

---

### Scenario 6: Game Ending (Expected: 1 minute)

**User says:** "End my game" or HP reaches 0

**Expected behavior:**
1. App calls `end_run`
2. Returns EndRunCard with:
   - Turns survived
   - Items found
   - Threats defeated
   - Star rating (1-5)
   - Shareable seed code
   - "Share Challenge" button

**Verify:**
- Summary reflects actual gameplay
- Seed code is valid format (e.g., GF-1A2B3C)

---

### Scenario 7: Challenge Sharing (Expected: 30 seconds)

**User says:** "Give me a code to share with friends"

**Expected behavior:**
1. App calls `export_challenge`
2. Returns seed and share text:
   ```
   🎮 Can you beat my Game Factory run?
   World: Cyberpunk Nexus | Survived: 8 turns
   Seed: GF-1A2B3C
   ```

**User can then share this via copy/paste**

---

## Content Safety Verification

### Must NOT appear:
- [ ] Graphic violence or gore
- [ ] Sexual or romantic content
- [ ] Occult, demonic, or ritualistic themes
- [ ] Real gambling (betting, slots, etc.)
- [ ] Hate speech or discrimination
- [ ] Real-world violence encouragement

### Must appear:
- [x] Age-appropriate adventure themes
- [x] Cartoon-style conflict resolution
- [x] "Fade to black" for any defeat
- [x] Positive alternatives to failure

---

## Error Scenarios

### Invalid run reference
**Test:** Manually call act with fake runRef

**Expected:** Clear error message "Run not found"

### Missing required field
**Test:** Call start_run with invalid genre

**Expected:** Validation error, not crash

---

## Performance Expectations

| Operation | Expected Time |
|-----------|---------------|
| list_templates | <500ms |
| start_run | <1s |
| act | <500ms |
| end_run | <500ms |

---

## Session Persistence

**Test:**
1. Start a game
2. Navigate away from chat
3. Return to same conversation

**Expected:** Game state preserved via widgetState (not server storage)

**Note:** Refreshing the browser/app loses state (session-only by design)
