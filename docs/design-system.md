# NannyRadar Design System

## 🎨 Color Palette

### Primary Colors
- **Hot Pink**: `#FF69B4` - Primary brand color, CTA buttons, active states
- **Light Pink**: `#FFB6C1` - Hover states, secondary elements
- **Medium Violet Red**: `#C71585` - Dark variant for text on pink backgrounds

### Secondary Colors
- **Sky Blue**: `#87CEEB` - Secondary brand color, complementary elements
- **Powder Blue**: `#B0E0E6` - Light variant for backgrounds
- **Steel Blue**: `#4682B4` - Dark variant for contrast

### Neutral Colors
- **White**: `#FFFFFF` - Primary background, cards, buttons
- **Off White**: `#FAFAFA` - App background
- **Dark Blue Gray**: `#2C3E50` - Primary text
- **Medium Gray**: `#7F8C8D` - Secondary text
- **Light Gray**: `#BDC3C7` - Disabled states, borders

### Gradients
- **Pink Gradient**: `#FF69B4` → `#FFB6C1`
- **Blue Gradient**: `#87CEEB` → `#B0E0E6`
- **Mixed Gradient**: `#FF69B4` → `#87CEEB`

## 📝 Typography

### Font Families
- **Primary**: Nunito (rounded, friendly)
- **Secondary**: Poppins (clean, modern)

### Font Sizes
- **xs**: 12px - Small labels, captions
- **sm**: 14px - Body text, form labels
- **base**: 16px - Default body text
- **lg**: 18px - Subheadings
- **xl**: 20px - Section headers
- **2xl**: 24px - Page titles
- **3xl**: 30px - Large headings
- **4xl**: 36px - Hero text

### Font Weights
- **Light**: 300 - Subtle text
- **Normal**: 400 - Body text
- **Medium**: 500 - Emphasized text
- **Semibold**: 600 - Subheadings
- **Bold**: 700 - Headings
- **Extrabold**: 800 - Hero text

## 📐 Spacing System

- **xs**: 4px - Tight spacing
- **sm**: 8px - Small gaps
- **md**: 16px - Default spacing
- **lg**: 24px - Section spacing
- **xl**: 32px - Large gaps
- **2xl**: 48px - Major sections
- **3xl**: 64px - Page sections

## 🔲 Border Radius

- **sm**: 8px - Small elements
- **md**: 12px - Form inputs, cards
- **lg**: 16px - Large cards
- **xl**: 20px - Buttons, major elements
- **full**: 9999px - Circular elements

## 🌟 Shadows

### Small Shadow
```
shadowColor: #000
shadowOffset: { width: 0, height: 2 }
shadowOpacity: 0.1
shadowRadius: 4
elevation: 2
```

### Medium Shadow
```
shadowColor: #000
shadowOffset: { width: 0, height: 4 }
shadowOpacity: 0.15
shadowRadius: 8
elevation: 4
```

### Large Shadow
```
shadowColor: #000
shadowOffset: { width: 0, height: 8 }
shadowOpacity: 0.2
shadowRadius: 16
elevation: 8
```

## 🎭 Component Guidelines

### Buttons
- **Primary**: Pink background, white text, large rounded corners
- **Secondary**: Blue background, white text
- **Outline**: Transparent background, pink border and text
- **Sizes**: Small (36px), Medium (48px), Large (56px)

### Cards
- White background with medium shadow
- 16px border radius
- 20px padding
- Subtle border or shadow for depth

### Form Elements
- 12px border radius
- 16px padding
- 2px border (light gray default, pink on focus)
- Clear labels above inputs

### Icons
- Use emoji or Font Awesome icons
- Consistent sizing within components
- Pink or blue color scheme

## 📱 Screen Specifications

### Landing Page
- Full-screen gradient background (pink to blue)
- Centered logo and tagline
- Hero image/icon in circle
- Two CTA buttons (primary and secondary)
- App store badges
- Feature preview icons

### Authentication
- Clean white background
- Centered logo
- Form with clear labels
- Social login options
- Toggle between login/signup

### Dashboard
- Header with greeting and notifications
- Upcoming booking card with gradient
- Quick action grid (2x2)
- Recent activity list
- Bottom navigation

### Booking Page
- Date picker calendar
- Time slot selection
- Location preview
- Sitter list with photos and ratings
- Sticky "Book Now" button

### Sitter Profile
- Large header image with gradient overlay
- Profile photo and verification badge
- Rating and pricing prominently displayed
- Skills as colored badges
- Action buttons (Message/Book)

### Payment
- Booking summary card
- Payment method selection
- Promo code input
- Secure payment confirmation
- Trust indicators

## ✨ Animation Guidelines

### Durations
- **Fast**: 200ms - Micro-interactions
- **Normal**: 300ms - Standard transitions
- **Slow**: 500ms - Page transitions

### Easing
- **ease-in-out**: Standard transitions
- **ease-out**: Appearing elements
- **spring**: iOS-style bouncy animations

### Common Animations
- Button press: Scale down to 0.95
- Page transitions: Slide left/right
- Modal appearance: Fade in with scale
- Loading states: Gentle pulse or rotation

## 🎯 Accessibility

### Color Contrast
- Ensure 4.5:1 contrast ratio for normal text
- Ensure 3:1 contrast ratio for large text
- Provide alternative indicators beyond color

### Touch Targets
- Minimum 44px touch target size
- Adequate spacing between interactive elements
- Clear visual feedback for interactions

### Typography
- Scalable font sizes
- Clear hierarchy
- Readable line spacing (1.4-1.6)

## 📐 Layout Principles

### Grid System
- 16px base margin/padding
- Consistent spacing multiples
- Responsive breakpoints

### Visual Hierarchy
- Size, color, and spacing to create hierarchy
- Important elements use primary colors
- Secondary elements use muted colors

### Content Organization
- Group related elements
- Use white space effectively
- Maintain consistent alignment
