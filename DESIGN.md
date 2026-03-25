# Design System Document: Industrial Precision & Edge Intelligence

## 1. Overview & Creative North Star
**Creative North Star: "The Tactical Observer"**

This design system moves away from the "web app" aesthetic and toward a high-fidelity tactical interface. It is designed for the high-stakes world of robotics and edge computing, where information density must be balanced with absolute clarity. We achieve a premium, custom feel by rejecting the standard "boxed" layout in favor of **Architectural Layering**. 

The interface should feel like a piece of precision-engineered hardware: intentional, zero-tolerance, and high-performance. We break the template look through **Monochromatic Depth**—using shifts in slate tones rather than lines to define space—and **Asymmetric Data Weighting**, where critical telemetry is given oversized typographic prominence against a backdrop of dense, technical metadata.

---

### 2. Colors & Surface Logic

The palette is rooted in deep slates (`#0b1326`) to minimize eye strain in industrial environments, punctuated by a high-energy primary blue (`#98cbff`) that signifies "active intelligence."

#### The "No-Line" Rule
Standard 1px borders are strictly prohibited for sectioning. They create visual noise that distracts from critical data. Boundaries must be defined solely through background color shifts. 
*   **Example:** A `surface-container-low` data panel should sit directly on a `surface` background. The eye should perceive the edge via the tonal shift, not a stroke.

#### Surface Hierarchy & Nesting
Treat the UI as a physical stack of machined components.
*   **Base Layer:** `surface` (#0b1326) – The motherboard of the application.
*   **Secondary Zones:** `surface-container-low` (#131b2e) – For grouping related telemetry.
*   **Active Interaction/Highlight Zones:** `surface-container-high` (#222a3d) – For focused work areas or modals.
*   **The "Glass & Gradient" Rule:** To avoid a flat, "dead" look, use `surface-variant` with a `backdrop-blur` of 12px for floating diagnostic overlays. Main CTAs should utilize a subtle linear gradient from `primary` (#98cbff) to `primary-container` (#0097ec) at a 135-degree angle to simulate the glow of an illuminated physical button.

---

### 3. Typography: Technical Authority

We use a dual-typeface system to balance high-tech character with rapid legibility.

*   **Display & Headlines (Space Grotesk):** This typeface provides the "industrial-futurist" personality. Use `display-lg` (3.5rem) for critical system status (e.g., "ONLINE") to create a commanding visual hierarchy.
*   **Data & Body (Inter):** A clean, neutral sans-serif chosen for its exceptional legibility at small scales. All telemetry, logs, and coordinate data must use `body-sm` or `label-md` to maintain a "technical manual" feel.
*   **Monospaced Intent:** While using Inter, ensure numeric data points utilize "tabular lining" figures so that changing values don't cause layout jitter—a hallmark of professional edge computing interfaces.

---

### 4. Elevation & Depth: Tonal Layering

Shadows and borders are secondary to color-value shifts. 

*   **The Layering Principle:** Depth is achieved by "stacking." A `surface-container-lowest` (#060e20) card placed on a `surface-container` (#171f33) section creates a "recessed" look, perfect for input logs.
*   **Ambient Shadows:** For floating elements like robot control "kill switches" or system modals, use a shadow with a 40px blur, 0% spread, and an opacity of 8%. The shadow color must be a tinted version of the background (`#000814`) to ensure it feels like a natural light occlusion rather than a "drop shadow."
*   **The "Ghost Border" Fallback:** If a high-density data table requires separation, use a "Ghost Border": the `outline-variant` (#414754) token set to **15% opacity**. This provides a hint of structure without breaking the seamless aesthetic.

---

### 5. Components

#### Buttons (Machined Controls)
*   **Primary:** Gradient from `primary` to `primary-container`. `0px` border-radius. Typography: `label-md` (All Caps).
*   **Secondary:** `surface-container-highest` background with `on-surface` text. No border.
*   **Tertiary:** Ghost style. `on-surface-variant` text, shifting to `surface-bright` on hover.

#### Data Chips & Status Indicators
*   **Healthy:** `tertiary` (#ffba3f) text on a 10% opacity `tertiary-container` background. *Note: Use Amber for Warning, Red (#ffb4ab) for Critical.*
*   **Structure:** No rounded corners (`0px`). Chips should feel like "tags" in a terminal.

#### Input Fields
*   **State:** Default state is `surface-container-lowest` with a subtle `outline-variant` ghost border. 
*   **Active:** The border disappears and is replaced by a 2px `primary` bottom-bar highlight. This mimics a command-line prompt.

#### Cards & Lists (The Divider-Free Rule)
Forbid the use of divider lines. Separate list items using the spacing scale:
*   Use `spacing-2` (0.4rem) of vertical white space between items.
*   Apply a subtle background shift (`surface-container-low` to `surface-container`) on hover to define the interactive area.

#### Specialized Component: The "Telemetry HUD"
A high-density container using `surface-container-highest` with 20% opacity and a heavy `backdrop-blur`. Used for overlaying real-time robot coordinates or sensor data over video feeds.

---

### 6. Do's and Don'ts

#### Do
*   **Do** use `0px` radius for everything. Sharp corners imply precision and industrial reliability.
*   **Do** use `spacing-8` (1.75rem) or larger to separate major functional blocks. Let the dark space breathe.
*   **Do** use `tertiary` (Amber) for warnings rather than standard yellow to maintain the sophisticated dark-mode palette.

#### Don't
*   **Don't** use icons without labels in critical robotics controls. Ambiguity is a safety hazard.
*   **Don't** use pure black (#000000). It kills the depth of the "Slate" palette. Always use `surface-dim` or `surface-container-lowest`.
*   **Don't** use standard "Material" shadows. They are too soft for an industrial, edge-computing context. Stick to tonal layering.