# Yadav Narayan - Portfolio Website Sitemap

## Site Structure

```
yadavnarayan.com (Home)
│
├── Hero Section (#)
│   ├── Navigation Bar
│   │   ├── Logo/Name: "YADAV NARAYAN"
│   │   └── Nav Links: "Projects"
│   │
│   ├── ID Card (Lanyard)
│   │   ├── Portrait Photo
│   │   ├── "EDITOR & MOTION DESIGNER"
│   │   └── "SKILLS NOT REPLACED BY AI (YET)"
│   │
│   ├── Background Text: "YADAV NARAYAN"
│   ├── Greeting: "HELLO! I'M YADAV"
│   ├── Rotating Facts (Mobile + Desktop)
│   │   ├── "I started editing at the age of 12"
│   │   ├── "I love gaming"
│   │   └── "Fun fact: HR(s) love me"
│   │
│   └── Bottom Info: "Currently with HAPPENING DESIGN"
│
├── Orange Statement Section (#about)
│   ├── Scroll-Fill Typography
│   ├── Background Doodles (Fixed)
│   └── Content: Full-screen statement with word-by-word animation
│
├── Selected Works / Projects Section (#work)
│   ├── Header: "Projects that speak for themselves"
│   ├── Category Filter
│   │   ├── All
│   │   ├── Events
│   │   ├── Podcasts
│   │   ├── Gaming
│   │   └── Vlogs
│   │
│   ├── Project Grid (2 per category)
│   │   ├── Project Cards with LiteYouTube Thumbnails
│   │   ├── Click to Open VideoModal
│   │   └── Modal Features:
│   │       ├── Multi-video Navigation
│   │       ├── Keyboard Trap (Tab cycling, ESC close)
│   │       ├── Accessibility (ARIA labels, focus management)
│   │       └── Analytics Event Tracking
│   │
│   └── Featured Projects:
│       ├── UXINDIA 2025 (Events)
│       ├── Building Solana, India Design Power (Podcasts)
│       ├── Yacht Party, Media Team (Vlogs)
│       ├── M56 Scorpion, Dicker Max (Gaming)
│
├── Tools Section (#tools)
│   ├── "My tools to play around with and create magic!"
│   ├── "CLICK & DRAG" Label
│   └── Tool Grid (6 tools):
│       ├── Premiere Pro
│       ├── After Effects
│       ├── DaVinci Resolve (Custom icon)
│       ├── Photoshop
│       ├── Lightroom
│       └── Figma (Custom icon)
│
├── Contact Section (#contact)
│   ├── Form: "Let's work together"
│   ├── Contact Form (Formspree Integration)
│   │   ├── Name Input
│   │   ├── Email Input
│   │   ├── Message Textarea
│   │   ├── Honeypot Field
│   │   └── Magnetic CTA Button
│   │
│   ├── Email: yadavnarayann@gmail.com (Desktop only)
│   └── Social Links (Desktop + Footer)
│
└── Footer
    ├── Copyright: "© 2026 Yadav Narayan"
    └── Social Links:
        ├── YouTube: @BhukaMendak
        ├── LinkedIn: /in/yadavnarayan/
        └── Instagram: @bhukamendak
```

## Key Features & Components

### Navigation
- Sticky header with scroll-aware text color (dark → light background adaptation)
- Logo/name "YADAV NARAYAN"
- Single nav link: "Projects"
- Orange "CONTACT" CTA button linking to #contact

### Hero Section
- 3D tilt ID card (mouse on desktop, gyroscope on mobile via DeviceOrientation API)
- Rotating facts with flipbook animation
- Oversized background name typography
- Grid background texture

### Orange Statement Section
- 300vh tall sticky section
- Word-by-word scroll fill animation (opacity 0.2 → 1.0)
- Fixed doodle background (non-scrollable)
- Scroll-locked until animation completes

### Projects / SelectedWorks
- 5 projects total (2 Events, 2 Podcasts, 2 Gaming, 2 Vlogs)
- Category filter (All, Events, Podcasts, Gaming, Vlogs)
- LiteYouTube lazy thumbnails (cascading resolution fallback)
- VideoModal with multi-video support, keyboard navigation, ARIA labels

### Tools Section
- 6-column responsive grid
- Hover animations (lift, shadow growth)
- Image icons for DaVinci Resolve (PNG) and Figma (SVG)
- Category tags

### Contact Form
- Formspree integration (POST to https://formspree.io/f/mqedqpyn)
- Honeypot spam protection
- Form validation
- Success/error states
- Hidden email section on mobile (avoid duplication with footer)

### Footer
- Copyright text
- 3 social media links with hover effects (orange color transition)
- Responsive layout

## Responsive Design
- **Mobile**: Hero facts visible, gyroscope tilt support, hidden email section, 2-column tool grid
- **Tablet**: Intermediate scaling, touch-optimized
- **Desktop**: Full hover interactions, 6-column tool grid, visible email contact section

## Technical Stack
- **Framework**: Next.js 16 (App Router)
- **Styling**: Tailwind CSS 4 + CSS custom properties (design tokens)
- **Animation**: Framer Motion
- **Forms**: Formspree (email service)
- **Analytics**: Custom event tracking (open/close modal, project views)
- **Fonts**: Geist (sans), Geist Mono (mono)
- **Colors**: Orange accent (#FF5A36), dark/light theme with semantic tokens
