# 04. UI, UX & Responsiveness Guidelines

## Visual Direction (The "Testing Site" Standard)
The entire customer website must use a **LIGHT THEME** (No dark-theme-first designs).
- **Style**: Premium, elegant, minimal, fashion/lifestyle oriented.
- **Palette**: White/off-white backgrounds, soft neutral surfaces, dark charcoal typography. Use the centralized Tailwind CSS variables from the previous iteration.
- **Avoid**: Generic bootstrap looks, cheap gradients, excessive rounded cards, or cluttered layouts.

## Mobile-First "App-Like" Experience
The mobile website must NOT simply be a shrunk desktop website. When opened on a phone, it should feel close to a modern shopping application.
- **Bottom Navigation**: Sticky bottom navigation (Home, Shop, Search, Cart, Account). Must respect mobile safe areas.
- **Swipeable Galleries**: Use CSS scroll-snap (`snap-x`) or Framer Motion for large, swipeable image galleries on mobile.
- **Filters**: On mobile, filters should open as a drawer/bottom sheet, NOT consume the entire page.
- **Interactions**: Do not require mouse hover for important actions on mobile. Use large touch targets.

## Desktop Experience
- Premium header with logo, navigation, search, and cart.
- Responsive max-width container (Do not stretch content across ultra-wide 1920px screens unnecessarily).

## Image & Asset Handling
- Products must support multiple images.
- Include the **"Printed Inside the Photo" Watermark Logic**: The backend (Laravel Intervention Image) must stamp newly uploaded images diagonally in the center with a low-opacity white/drop-shadow text (e.g., Playfair Display) to prevent image theft.
- **Anti-Theft Frontend**: Prevent right-clicks (`oncontextmenu`), dragging, and use invisible overlays.

## Responsive Targets
Test structurally at:
- **Mobile**: 320px, 360px, 375px, 390px, 412px, 430px+
- **Tablet**: 768px, 820px, 1024px
- **Desktop**: 1280px, 1440px, 1920px

No horizontal scrolling, overflowing text, or broken grids allowed.
