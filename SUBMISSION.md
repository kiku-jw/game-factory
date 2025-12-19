# Game Factory - ChatGPT Store Submission

## App Identity

**Name:** Game Factory

**Subtitle:** Endless AI Text Adventures (27 chars)

**Category:** Games & Entertainment

## Description

### Short Description (for listing)
Create unique text-adventure games instantly. No prompts, registration, or payment required. Just pick a genre and play.

### Full Description
Game Factory is an AI-native endless game generator that creates unique text-adventure experiences in just 2 clicks.

**How It Works:**
1. Choose your genre (Fantasy, Sci-Fi, Mystery, Horror-Lite, Cyberpunk, Surreal)
2. Adjust settings (difficulty, tone, length) or let us surprise you
3. Play! Make choices, manage resources, face consequences

**Core Features:**
- **Instant Play**: No account, no setup, no prompts to craft
- **6 Curated Genres**: Each with unique atmosphere and encounters
- **Deep Mechanics**: Track HP, supplies, inventory, and threat level
- **Fail-Forward Design**: No "game over" - failures offer alternative paths
- **Challenge Sharing**: Export seed codes to challenge friends

**Gameplay Rules:**
- Maintain HP and supplies above zero
- Progress toward 100% completion
- Balance risk/reward on every choice
- Survive escalating threat levels

**Content Safety:**
- Designed for ages 13+
- No graphic violence, horror, or mature themes
- All content filtered for appropriateness

## Logo

See `assets/logo.svg` - 64x64 D20 die with factory gear accent
Colors: #1a1a2e (dark blue), #e94560 (coral accent), #0f3460 (mid blue)

## Screenshots Required

1. **Welcome Screen**: Genre selection cards
2. **Gameplay**: Scene with choices and status bar
3. **Consequence**: Failure with alternative options
4. **End Screen**: Summary with rating and share button

## MCP Connection Details

**Endpoint:** `https://your-deployed-url.com/mcp`
**Transport:** HTTP (POST/GET/DELETE)
**Authentication:** None (session-based gameplay)

## Tools Provided

| Tool | Purpose | Annotations |
|------|---------|-------------|
| `list_templates` | Browse game genres | readOnly=true |
| `start_run` | Begin new game | readOnly=false |
| `act` | Execute player choices | readOnly=false |
| `end_run` | Finish with summary | readOnly=false |
| `export_challenge` | Get shareable seed | readOnly=true |

## Testing Guide for Reviewers

### Quick Test (2 minutes)
1. Say "Start a fantasy game"
2. Make 3-4 choices
3. Say "End the game"

### Full Test (5 minutes)
1. Say "Show me available game templates"
2. Pick a template: "Start the Cyberpunk Nexus template"
3. Play through several turns, including:
   - A safe choice (no risk indicator)
   - A risky choice (shows % success)
4. Intentionally fail (pick low % option)
5. Choose a consequence from alternatives
6. Say "Give me a challenge code to share"
7. Say "End my run"

### Edge Cases to Verify
- Starting with "Surprise me" randomizes everything
- Duplicate actions are safely ignored (retry-safe)
- Closing and reopening continues last session (via widgetState)

### Expected Behaviors
- All content is age-appropriate (13+)
- No gambling mechanics or language
- No real money or transactions
- Fast response times (<2s per turn)

## Country Availability

**Regions:** All supported regions
**Language:** English only (MVP)
**Content Restrictions:** None beyond 13+ age rating

## Privacy & Data

**Privacy Policy URL:** https://kiku-jw.github.io/game-factory/#privacy
**Data Collected:** Game state only (no PII)
**Data Retention:** Session only (4h TTL, no persistence)
**Third-Party Sharing:** None

## Support Contact

**Email:** support@kikuai.dev
**Response Time:** Within 48 hours

## Compliance Checklist

- [x] Clear purpose and reliable functionality
- [x] Tool names are verb-based and descriptive
- [x] Tool annotations correctly applied
- [x] No excessive data collection
- [x] No PII in tool inputs/outputs
- [x] Privacy policy published
- [x] Age-appropriate content (13+)
- [x] No ads or monetization
- [x] No gambling mechanics
- [x] Retry-safe operations
- [x] Clear error messages
- [x] Test credentials: N/A (no auth)

## Version History

- v0.1.0 - Initial submission (December 2025)
