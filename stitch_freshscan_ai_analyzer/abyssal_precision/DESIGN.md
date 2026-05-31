---
name: Abyssal Precision
colors:
  surface: '#0f1419'
  surface-dim: '#0f1419'
  surface-bright: '#353a3f'
  surface-container-lowest: '#0a0f14'
  surface-container-low: '#171c21'
  surface-container: '#1b2025'
  surface-container-high: '#252a30'
  surface-container-highest: '#30353b'
  on-surface: '#dee3ea'
  on-surface-variant: '#bacac6'
  inverse-surface: '#dee3ea'
  inverse-on-surface: '#2c3137'
  outline: '#859490'
  outline-variant: '#3b4a47'
  surface-tint: '#39ddc8'
  primary: '#44e4cf'
  on-primary: '#003731'
  primary-container: '#00c8b4'
  on-primary-container: '#004e45'
  inverse-primary: '#006b5f'
  secondary: '#adc7ff'
  on-secondary: '#002e68'
  secondary-container: '#0056b6'
  on-secondary-container: '#bdd1ff'
  tertiary: '#afd3e7'
  on-tertiary: '#0c3444'
  tertiary-container: '#93b7cb'
  on-tertiary-container: '#254959'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#60fae4'
  primary-fixed-dim: '#39ddc8'
  on-primary-fixed: '#00201c'
  on-primary-fixed-variant: '#005047'
  secondary-fixed: '#d8e2ff'
  secondary-fixed-dim: '#adc7ff'
  on-secondary-fixed: '#001a41'
  on-secondary-fixed-variant: '#004493'
  tertiary-fixed: '#c3e8fd'
  tertiary-fixed-dim: '#a8cce0'
  on-tertiary-fixed: '#001e2b'
  on-tertiary-fixed-variant: '#274b5c'
  background: '#0f1419'
  on-background: '#dee3ea'
  surface-variant: '#30353b'
  abyssal-black: '#05070A'
  scientific-teal: '#00C8B4'
  hydro-blue: '#0057B8'
  glacial-ice: '#A0C4D8'
  surface-white: '#FFFFFF'
typography:
  display-lg:
    fontFamily: Playfair Display
    fontSize: 72px
    fontWeight: '700'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Playfair Display
    fontSize: 48px
    fontWeight: '700'
    lineHeight: '1.2'
  headline-md:
    fontFamily: Playfair Display
    fontSize: 40px
    fontWeight: '600'
    lineHeight: '1.3'
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.5'
  label-caps:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '500'
    lineHeight: '1.2'
    letterSpacing: 0.1em
  data-mono:
    fontFamily: JetBrains Mono
    fontSize: 14px
    fontWeight: '400'
    lineHeight: '1.4'
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  container-max: 1440px
  gutter: 2rem
  margin-desktop: 4rem
  margin-mobile: 1.5rem
  section-gap: 8rem
---

## Brand & Style

The design system is defined by a "Deep-Sea Scientific" aesthetic, blending the mysterious, cinematic qualities of the ocean's midnight zone with the clinical precision of marine research. The brand personality is authoritative yet ethereal, evoking feelings of discovery, premium quality, and environmental stewardship.

The visual style leans heavily into **Glassmorphism** and **Minimalism**. It utilizes high-contrast typography and vast, dark negative space to create a sense of immersion. UI elements should feel like sophisticated instruments—precise, translucent, and integrated into the fluid environment. Large-scale, centered compositions inspired by cinematic hero sections anchor the experience, providing a sense of scale and impact.

## Colors

The palette is rooted in a "Dark Mode" default, utilizing deep, near-black navies (`#0A0F14`) to represent the ocean depths. 

- **Primary Accent:** Scientific Teal (`#00C8B4`) is used sparingly for critical actions, data highlights, and interactive states. It represents bioluminescence and high-tech instrumentation.
- **Secondary/Tertiary:** Hydro Blue (`#0057B8`) provides depth in gradients, while Glacial Ice (`#A0C4D8`) serves as a high-contrast secondary text color and subtle border tone.
- **Neutral:** The background system uses a tiered approach of near-blacks and deep teals to maintain a cinematic atmosphere without feeling flat.

## Typography

This design system uses a sophisticated tri-font pairing to distinguish between narrative, information, and technical data:

- **Playfair Display (Serif):** Used for headlines and display text. It brings a "Premium Editorial" feel that contrasts beautifully against the technical background.
- **Inter (Sans-Serif):** The workhorse for body copy, chosen for its extreme legibility and neutral character, ensuring that scientific descriptions remain clear.
- **JetBrains Mono (Monospace):** Used for all labels, captions, and technical data points. This reinforces the "Scientific Aesthetic," making every piece of metadata feel like a read-out from a research submersible.

## Layout & Spacing

The layout philosophy follows a **Fixed Grid** model for content containers to maintain a cinematic, centered focus. 

- **Desktop:** A 12-column grid with generous 8rem gaps between sections to allow the dark background and "oceanic" imagery to breathe.
- **Hero Sections:** Always utilize center-alignment for typography and primary calls-to-action, mirroring the bold, symmetrical feel of high-end environmental branding.
- **Responsive Behavior:** On mobile, margins tighten to 1.5rem, and vertical spacing scales down to 4rem. Typography scales aggressively (refer to `display-lg-mobile`) to maintain impact on smaller viewports.

## Elevation & Depth

Depth is achieved through **Glassmorphism** rather than traditional drop shadows. 

- **Panels:** Use a semi-transparent background (e.g., `rgba(10, 15, 20, 0.7)`) with a high-intensity backdrop-blur (20px-30px). 
- **Borders:** "Ghost borders" are essential. Use 1px solid strokes with low-opacity white or Glacial Ice (`#A0C4D8` at 20% opacity) to define edges without breaking the fluid visual flow.
- **Layers:** Higher elevation levels are indicated by increased background transparency and slightly brighter border strokes, simulating objects moving "closer to the surface" of the water.

## Shapes

The design system employs a **Soft** shape language. While the overall aesthetic is technical and precise, slight rounding (0.25rem to 0.75rem) prevents the UI from feeling sharp or aggressive, reflecting the fluid nature of the marine environment.

- **Standard Elements:** 0.25rem (4px) corner radius.
- **Cards/Modals:** 0.75rem (12px) corner radius for a more modern, premium container feel.
- **Interactive Elements:** Buttons maintain a consistent soft radius to match cards, avoiding fully circular pills to stay aligned with the "scientific instrument" theme.

## Components

### Buttons
- **Primary:** Solid Teal (`#00C8B4`) with Navy text. No shadows; high contrast is key.
- **Secondary:** Transparent with a 1px border of Glacial Ice. On hover, the background fills with a subtle 10% white tint.
- **Text:** All-caps JetBrains Mono for a technical, tactical feel.

### Input Fields & Controls
- **Fields:** Dark, semi-transparent backgrounds with a 1px bottom border. Labels should use `label-caps` typography positioned above the field.
- **Checkboxes/Radios:** Square with a 2px radius. When active, they glow with a subtle Teal outer shadow to simulate a powered-on LED.

### Cards & Panels
- **Container:** Glassmorphic panels with `backdrop-filter: blur(20px)`. 
- **Content:** Information should be structured with a clear hierarchy: Playfair Display for the title, Inter for the description, and JetBrains Mono for metadata at the footer.

### Data Visualization
- Graphs and charts should exclusively use Primary Teal and Secondary Blue. Lines should be thin (1px-1.5px) and use small circular points to denote data nodes, emphasizing the "scientific instrument" look.