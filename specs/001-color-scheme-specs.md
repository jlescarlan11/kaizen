# PRODUCT REQUIREMENTS DOCUMENT (PRD)

## Color Scheme & Theme System Implementation

**Project:** Kaizen - Personal Finance Web App  
**Version:** 1.0  
**Last Updated:** March 2026  
**Owner:** Design & Frontend Team  
**Status:** Ready for Implementation

---

## 1. EXECUTIVE SUMMARY

### 1.1 Objective

Implement a consistent, accessible color scheme across the entire Kaizen web application with support for both light and dark modes. The system should provide a cohesive visual experience while maintaining WCAG AA accessibility standards.

### 1.2 Background

Currently, the app lacks a unified color system. This PRD establishes the color palette, theme modes, and implementation guidelines to ensure visual consistency across all components and screens.

### 1.3 Success Criteria

- ✅ All UI components use colors from defined palette
- ✅ Light and dark modes fully implemented
- ✅ Color contrast ratios meet WCAG AA (4.5:1 for text, 3:1 for UI components)
- ✅ User preference persists across sessions
- ✅ Smooth transitions between theme modes
- ✅ No hardcoded colors in components

---

## 2. COLOR PALETTE DEFINITION

### 2.1 Base Colors (Provided)

```
Primary Brand Color (Yellow):   rgb(244, 206, 20)  / #F4CE14
Success/Accent (Green):          rgb(55, 151, 119)  / #379777
Neutral Dark (Text/UI):          rgb(69, 71, 75)    / #45474B
Neutral Light (Background):      rgb(245, 247, 248) / #F5F7F8
```

### 2.2 Extended Palette (Derived)

Based on the base colors, we need to create a complete palette with variations for different UI states.

#### 2.2.1 Yellow (Primary) Scale

```
yellow-50:   #FFFBEB   (Lightest - backgrounds, hover states)
yellow-100:  #FEF3C7
yellow-200:  #FDE68A
yellow-300:  #FCD34D
yellow-400:  #FBBF24
yellow-500:  #F4CE14   ← Base
yellow-600:  #D69E12
yellow-700:  #B87510
yellow-800:  #92400E
yellow-900:  #78350F   (Darkest - text on light backgrounds)
```

#### 2.2.2 Green (Success/Accent) Scale

```
green-50:    #ECFDF5
green-100:   #D1FAE5
green-200:   #A7F3D0
green-300:   #6EE7B7
green-400:   #34D399
green-500:   #379777   ← Base
green-600:   #2D7A61
green-700:   #235D4A
green-800:   #1A4434
green-900:   #0F2B1E
```

#### 2.2.3 Neutral (Gray) Scale

```
gray-50:     #F5F7F8   ← Base Light
gray-100:    #E5E7EB
gray-200:    #D1D5DB
gray-300:    #9CA3AF
gray-400:    #6B7280
gray-500:    #45474B   ← Base Dark
gray-600:    #374151
gray-700:    #1F2937
gray-800:    #111827
gray-900:    #0A0A0B
```

#### 2.2.4 Semantic Colors (Additional)

```
Red (Error/Warning):
red-50:      #FEF2F2
red-100:     #FEE2E2
red-500:     #EF4444   (Error states)
red-600:     #DC2626   (Error text)
red-700:     #B91C1C

Blue (Information):
blue-50:     #EFF6FF
blue-100:    #DBEAFE
blue-500:    #3B82F6   (Info states)
blue-600:    #2563EB   (Links)
blue-700:    #1D4ED8

Orange (Warning):
orange-50:   #FFF7ED
orange-100:  #FFEDD5
orange-500:  #F97316   (Warning states)
orange-600:  #EA580C
```

---

## 3. THEME MODES

### 3.1 Light Mode (Default)

```css
/* Light Mode Color Mapping */
--color-background: rgb(245, 247, 248) /* gray-50 */ --color-surface: #ffffff
  /* White */ --color-surface-secondary: rgb(245, 247, 248) /* gray-50 */
  --color-border: #e5e7eb /* gray-100 */ --color-border-strong: #d1d5db
  /* gray-200 */ --color-text-primary: rgb(69, 71, 75) /* gray-500 */
  --color-text-secondary: #6b7280 /* gray-400 */ --color-text-tertiary: #9ca3af
  /* gray-300 */ --color-text-inverse: #ffffff /* White */
  --color-primary: rgb(244, 206, 20) /* yellow-500 */
  --color-primary-hover: #d69e12 /* yellow-600 */
  --color-primary-active: #b87510 /* yellow-700 */
  --color-primary-light: #fef3c7 /* yellow-100 */
  --color-success: rgb(55, 151, 119) /* green-500 */
  --color-success-hover: #2d7a61 /* green-600 */ --color-success-light: #d1fae5
  /* green-100 */ --color-error: #ef4444 /* red-500 */
  --color-error-hover: #dc2626 /* red-600 */ --color-error-light: #fee2e2
  /* red-100 */ --color-warning: #f97316 /* orange-500 */
  --color-warning-light: #ffedd5 /* orange-100 */ --color-info: #3b82f6
  /* blue-500 */ --color-info-light: #dbeafe /* blue-100 */;
```

### 3.2 Dark Mode

```css
/* Dark Mode Color Mapping */
--color-background: #0a0a0b /* gray-900 */ --color-surface: #1f2937
  /* gray-700 */ --color-surface-secondary: #111827 /* gray-800 */
  --color-border: #374151 /* gray-600 */ --color-border-strong: rgb(69, 71, 75)
  /* gray-500 */ --color-text-primary: #f5f7f8 /* gray-50 */
  --color-text-secondary: #d1d5db /* gray-200 */ --color-text-tertiary: #9ca3af
  /* gray-300 */ --color-text-inverse: rgb(69, 71, 75) /* gray-500 */
  --color-primary: #fcd34d /* yellow-300 (lighter in dark) */
  --color-primary-hover: #fbbf24 /* yellow-400 */
  --color-primary-active: #fde68a /* yellow-200 */
  --color-primary-light: #92400e /* yellow-800 (inverted) */
  --color-success: #6ee7b7 /* green-300 (lighter in dark) */
  --color-success-hover: #34d399 /* green-400 */ --color-success-light: #1a4434
  /* green-800 (inverted) */ --color-error: #fca5a5 /* red-300 (lighter) */
  --color-error-hover: #f87171 /* red-400 */ --color-error-light: #7f1d1d
  /* red-900 (inverted) */ --color-warning: #fdba74 /* orange-300 */
  --color-warning-light: #7c2d12 /* orange-900 */ --color-info: #93c5fd
  /* blue-300 */ --color-info-light: #1e3a8a /* blue-900 */;
```

### 3.3 Special Cases

#### Budget Colors (Always consistent regardless of theme)

```css
--color-budget-safe: rgb(55, 151, 119) /* green-500 */
  --color-budget-warning: #f97316 /* orange-500 */
  --color-budget-danger: #ef4444 /* red-500 */;
```

#### Income/Expense Indicators

```css
/* Light Mode */
--color-income: rgb(55, 151, 119) /* green-500 */ --color-expense: #ef4444
  /* red-500 */ /* Dark Mode */ --color-income: #6ee7b7 /* green-300 */
  --color-expense: #fca5a5 /* red-300 */;
```

---

## 4. IMPLEMENTATION APPROACH

### 4.1 Technology Stack

**CSS Custom Properties (CSS Variables)**

- Define all colors as CSS variables in root
- Use `prefers-color-scheme` media query for default detection
- Allow manual override via class or data attribute

**Tailwind CSS Configuration**

- Extend Tailwind theme with custom colors
- Map CSS variables to Tailwind utilities
- Use `darkMode: 'class'` strategy

### 4.2 File Structure

```
src/
├── styles/
│   ├── globals.css                 # Global styles with CSS variables
│   ├── themes/
│   │   ├── light.css              # Light mode variables
│   │   ├── dark.css               # Dark mode variables
│   │   └── index.ts               # Theme type definitions
│   └── colors.css                 # Color palette constants
├── hooks/
│   └── useTheme.ts                # Theme toggle hook
└── providers/
    └── ThemeProvider.tsx          # Theme context provider
```

### 4.3 Implementation Code

#### 4.3.1 globals.css

```css
/* src/styles/globals.css */

/* Light Mode (Default) */
:root {
  /* Background */
  --color-background: rgb(245, 247, 248);
  --color-surface: #ffffff;
  --color-surface-secondary: rgb(245, 247, 248);

  /* Borders */
  --color-border: #e5e7eb;
  --color-border-strong: #d1d5db;

  /* Text */
  --color-text-primary: rgb(69, 71, 75);
  --color-text-secondary: #6b7280;
  --color-text-tertiary: #9ca3af;
  --color-text-inverse: #ffffff;

  /* Primary (Yellow) */
  --color-primary: rgb(244, 206, 20);
  --color-primary-hover: #d69e12;
  --color-primary-active: #b87510;
  --color-primary-light: #fef3c7;
  --color-primary-dark: #92400e;

  /* Success (Green) */
  --color-success: rgb(55, 151, 119);
  --color-success-hover: #2d7a61;
  --color-success-light: #d1fae5;
  --color-success-dark: #1a4434;

  /* Error (Red) */
  --color-error: #ef4444;
  --color-error-hover: #dc2626;
  --color-error-light: #fee2e2;
  --color-error-dark: #7f1d1d;

  /* Warning (Orange) */
  --color-warning: #f97316;
  --color-warning-light: #ffedd5;
  --color-warning-dark: #7c2d12;

  /* Info (Blue) */
  --color-info: #3b82f6;
  --color-info-light: #dbeafe;
  --color-info-dark: #1e3a8a;

  /* Semantic */
  --color-income: rgb(55, 151, 119);
  --color-expense: #ef4444;

  /* Shadows */
  --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1);
  --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1);
}

/* Dark Mode */
.dark,
[data-theme="dark"] {
  /* Background */
  --color-background: #0a0a0b;
  --color-surface: #1f2937;
  --color-surface-secondary: #111827;

  /* Borders */
  --color-border: #374151;
  --color-border-strong: rgb(69, 71, 75);

  /* Text */
  --color-text-primary: #f5f7f8;
  --color-text-secondary: #d1d5db;
  --color-text-tertiary: #9ca3af;
  --color-text-inverse: rgb(69, 71, 75);

  /* Primary (Yellow - lighter in dark) */
  --color-primary: #fcd34d;
  --color-primary-hover: #fbbf24;
  --color-primary-active: #fde68a;
  --color-primary-light: #92400e;
  --color-primary-dark: #fffbeb;

  /* Success (Green - lighter in dark) */
  --color-success: #6ee7b7;
  --color-success-hover: #34d399;
  --color-success-light: #1a4434;
  --color-success-dark: #ecfdf5;

  /* Error (Red - lighter in dark) */
  --color-error: #fca5a5;
  --color-error-hover: #f87171;
  --color-error-light: #7f1d1d;
  --color-error-dark: #fef2f2;

  /* Warning (Orange - lighter in dark) */
  --color-warning: #fdba74;
  --color-warning-light: #7c2d12;
  --color-warning-dark: #fff7ed;

  /* Info (Blue - lighter in dark) */
  --color-info: #93c5fd;
  --color-info-light: #1e3a8a;
  --color-info-dark: #eff6ff;

  /* Semantic */
  --color-income: #6ee7b7;
  --color-expense: #fca5a5;

  /* Shadows (lighter for dark mode) */
  --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.3);
  --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.4);
  --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.5);
}

/* System preference detection */
@media (prefers-color-scheme: dark) {
  :root:not(.light):not([data-theme="light"]) {
    /* Apply dark mode variables */
    --color-background: #0a0a0b;
    --color-surface: #1f2937;
    /* ... (same as .dark above) */
  }
}

/* Base styles */
body {
  background-color: var(--color-background);
  color: var(--color-text-primary);
  transition:
    background-color 0.3s ease,
    color 0.3s ease;
}
```

#### 4.3.2 tailwind.config.ts

```typescript
// tailwind.config.ts
import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class", // Use class strategy for dark mode
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Map CSS variables to Tailwind utilities
        background: "var(--color-background)",
        surface: {
          DEFAULT: "var(--color-surface)",
          secondary: "var(--color-surface-secondary)",
        },
        border: {
          DEFAULT: "var(--color-border)",
          strong: "var(--color-border-strong)",
        },
        text: {
          primary: "var(--color-text-primary)",
          secondary: "var(--color-text-secondary)",
          tertiary: "var(--color-text-tertiary)",
          inverse: "var(--color-text-inverse)",
        },
        primary: {
          DEFAULT: "var(--color-primary)",
          hover: "var(--color-primary-hover)",
          active: "var(--color-primary-active)",
          light: "var(--color-primary-light)",
          dark: "var(--color-primary-dark)",
        },
        success: {
          DEFAULT: "var(--color-success)",
          hover: "var(--color-success-hover)",
          light: "var(--color-success-light)",
          dark: "var(--color-success-dark)",
        },
        error: {
          DEFAULT: "var(--color-error)",
          hover: "var(--color-error-hover)",
          light: "var(--color-error-light)",
          dark: "var(--color-error-dark)",
        },
        warning: {
          DEFAULT: "var(--color-warning)",
          light: "var(--color-warning-light)",
          dark: "var(--color-warning-dark)",
        },
        info: {
          DEFAULT: "var(--color-info)",
          light: "var(--color-info-light)",
          dark: "var(--color-info-dark)",
        },
        income: "var(--color-income)",
        expense: "var(--color-expense)",
      },
      boxShadow: {
        sm: "var(--shadow-sm)",
        md: "var(--shadow-md)",
        lg: "var(--shadow-lg)",
      },
    },
  },
  plugins: [],
};

export default config;
```

#### 4.3.3 ThemeProvider.tsx

```typescript
// src/providers/ThemeProvider.tsx
'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  resolvedTheme: 'light' | 'dark';
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('system');
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('light');

  // Initialize theme from localStorage or system preference
  useEffect(() => {
    const stored = localStorage.getItem('kaizen-theme') as Theme | null;
    if (stored) {
      setThemeState(stored);
    }
  }, []);

  // Update resolved theme based on current theme setting
  useEffect(() => {
    const updateResolvedTheme = () => {
      if (theme === 'system') {
        const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
          ? 'dark'
          : 'light';
        setResolvedTheme(systemTheme);
      } else {
        setResolvedTheme(theme);
      }
    };

    updateResolvedTheme();

    // Listen for system theme changes if using system preference
    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handler = () => updateResolvedTheme();
      mediaQuery.addEventListener('change', handler);
      return () => mediaQuery.removeEventListener('change', handler);
    }
  }, [theme]);

  // Apply theme to DOM
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(resolvedTheme);
    root.setAttribute('data-theme', resolvedTheme);
  }, [resolvedTheme]);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem('kaizen-theme', newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, resolvedTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
```

#### 4.3.4 useTheme Hook Usage

```typescript
// Example component using theme
import { useTheme } from '@/providers/ThemeProvider';

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => setTheme('light')}
        className={`px-3 py-2 rounded ${
          theme === 'light' ? 'bg-primary text-white' : 'bg-surface'
        }`}
      >
        Light
      </button>
      <button
        onClick={() => setTheme('dark')}
        className={`px-3 py-2 rounded ${
          theme === 'dark' ? 'bg-primary text-white' : 'bg-surface'
        }`}
      >
        Dark
      </button>
      <button
        onClick={() => setTheme('system')}
        className={`px-3 py-2 rounded ${
          theme === 'system' ? 'bg-primary text-white' : 'bg-surface'
        }`}
      >
        System
      </button>
    </div>
  );
}
```

---

## 5. COMPONENT GUIDELINES

### 5.1 Using Colors in Components

**❌ NEVER hardcode colors:**

```tsx
// BAD
<div style={{ backgroundColor: '#F4CE14' }}>...</div>
<div className="bg-yellow-500">...</div>
```

**✅ ALWAYS use CSS variables or Tailwind utilities:**

```tsx
// GOOD
<div style={{ backgroundColor: 'var(--color-primary)' }}>...</div>
<div className="bg-primary">...</div>
```

### 5.2 Common Component Patterns

#### Buttons

```tsx
// Primary Button
<button className="bg-primary hover:bg-primary-hover active:bg-primary-active text-text-inverse px-4 py-2 rounded-lg transition-colors">
  Continue with Google
</button>

// Secondary Button
<button className="bg-surface border border-border hover:bg-surface-secondary text-text-primary px-4 py-2 rounded-lg transition-colors">
  Cancel
</button>

// Success Button
<button className="bg-success hover:bg-success-hover text-white px-4 py-2 rounded-lg transition-colors">
  Save Goal
</button>

// Error/Delete Button
<button className="bg-error hover:bg-error-hover text-white px-4 py-2 rounded-lg transition-colors">
  Delete Budget
</button>
```

#### Cards

```tsx
<div className="bg-surface border border-border rounded-lg p-4 shadow-md">
  <h3 className="text-text-primary font-semibold mb-2">Card Title</h3>
  <p className="text-text-secondary">Card content goes here</p>
</div>
```

#### Input Fields

```tsx
<input
  type="text"
  className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
  placeholder="Enter amount"
/>
```

#### Budget Progress Bars

```tsx
// Safe (< 70%)
<div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
  <div className="h-full bg-success" style={{ width: '45%' }} />
</div>

// Warning (70-100%)
<div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
  <div className="h-full bg-warning" style={{ width: '85%' }} />
</div>

// Danger (> 100%)
<div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
  <div className="h-full bg-error" style={{ width: '100%' }} />
</div>
```

#### Transaction Amounts

```tsx
// Income (positive)
<span className="text-income font-semibold">+₱5,000</span>

// Expense (negative)
<span className="text-expense font-semibold">-₱150</span>
```

#### Warning Badges

```tsx
<div className="bg-warning-light border border-warning text-warning-dark px-3 py-2 rounded-lg">
  ⚠️ This will reduce your balance to ₱500
</div>
```

---

## 6. ACCESSIBILITY REQUIREMENTS

### 6.1 Color Contrast Standards

All color combinations MUST meet WCAG AA standards:

- **Normal text (< 18pt):** Minimum contrast ratio of **4.5:1**
- **Large text (≥ 18pt):** Minimum contrast ratio of **3:1**
- **UI components:** Minimum contrast ratio of **3:1**

### 6.2 Contrast Validation

**Light Mode Validation:**

```
✅ Text Primary on Background:      rgb(69,71,75) on rgb(245,247,248)    = 8.2:1  ✓
✅ Text Secondary on Background:     #6b7280 on rgb(245,247,248)         = 5.1:1  ✓
✅ Primary on Surface:               rgb(244,206,20) on #ffffff          = 1.9:1  ✗ (Use darker text)
✅ Success on Surface:               rgb(55,151,119) on #ffffff          = 3.2:1  ✓
✅ Error on Surface:                 #ef4444 on #ffffff                  = 3.9:1  ✓
```

**Dark Mode Validation:**

```
✅ Text Primary on Background:      #f5f7f8 on #0a0a0b                  = 17.8:1 ✓
✅ Text Secondary on Background:     #d1d5db on #0a0a0b                  = 13.1:1 ✓
✅ Primary on Surface:               #fcd34d on #1f2937                  = 7.8:1  ✓
✅ Success on Surface:               #6ee7b7 on #1f2937                  = 8.1:1  ✓
✅ Error on Surface:                 #fca5a5 on #1f2937                  = 6.9:1  ✓
```

### 6.3 Never Rely on Color Alone

Always combine color with:

- **Icons:** ✓ for success, ⚠️ for warning, ✗ for error
- **Text labels:** "Success", "Warning", "Error"
- **Patterns:** Stripes, dots for charts/graphs

Example:

```tsx
// BAD - Color only
<div className="text-success">Transaction saved</div>

// GOOD - Color + Icon + Text
<div className="flex items-center gap-2 text-success">
  ✓ <span>Transaction saved successfully</span>
</div>
```

---

## 7. THEME TOGGLE UI

### 7.1 Settings Screen Integration

Add theme selector in Settings > Appearance:

```tsx
// Settings > Appearance Section
<div className="bg-surface border border-border rounded-lg p-4">
  <h3 className="text-text-primary font-semibold mb-4">Appearance</h3>

  <div className="space-y-2">
    <label className="text-text-secondary text-sm">Theme</label>

    <div className="grid grid-cols-3 gap-2">
      <button
        onClick={() => setTheme("light")}
        className={`p-3 rounded-lg border transition-colors ${
          theme === "light"
            ? "border-primary bg-primary-light"
            : "border-border bg-surface hover:bg-surface-secondary"
        }`}
      >
        <div className="text-center">
          <div className="text-2xl mb-1">☀️</div>
          <div className="text-sm text-text-primary">Light</div>
        </div>
      </button>

      <button
        onClick={() => setTheme("dark")}
        className={`p-3 rounded-lg border transition-colors ${
          theme === "dark"
            ? "border-primary bg-primary-light"
            : "border-border bg-surface hover:bg-surface-secondary"
        }`}
      >
        <div className="text-center">
          <div className="text-2xl mb-1">🌙</div>
          <div className="text-sm text-text-primary">Dark</div>
        </div>
      </button>

      <button
        onClick={() => setTheme("system")}
        className={`p-3 rounded-lg border transition-colors ${
          theme === "system"
            ? "border-primary bg-primary-light"
            : "border-border bg-surface hover:bg-surface-secondary"
        }`}
      >
        <div className="text-center">
          <div className="text-2xl mb-1">💻</div>
          <div className="text-sm text-text-primary">System</div>
        </div>
      </button>
    </div>

    <p className="text-text-tertiary text-xs mt-2">
      {theme === "system"
        ? `Following system preference (${resolvedTheme})`
        : `Theme set to ${theme} mode`}
    </p>
  </div>
</div>
```

### 7.2 Quick Theme Toggle (Optional)

Add icon button in top navigation for quick toggle:

```tsx
// In Dashboard/Navigation header
<button
  onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
  className="p-2 rounded-lg hover:bg-surface-secondary transition-colors"
  aria-label="Toggle theme"
>
  {resolvedTheme === "dark" ? "☀️" : "🌙"}
</button>
```

---

## 8. MIGRATION PLAN

### 8.1 Phase 1: Setup (Sprint 0 or Sprint 1)

**Effort:** 2-3 days

**Tasks:**

1. Create CSS variable definitions in globals.css
2. Update Tailwind configuration
3. Create ThemeProvider and useTheme hook
4. Add ThemeProvider to app root
5. Add theme toggle to Settings screen

**Deliverables:**

- ✅ CSS variables defined
- ✅ Tailwind config updated
- ✅ Theme system functional
- ✅ User can toggle themes

### 8.2 Phase 2: Component Migration (Sprint 1-2)

**Effort:** 1-2 weeks

**Tasks:**

1. Audit all existing components for hardcoded colors
2. Create migration checklist (spreadsheet of all components)
3. Migrate components in priority order:
   - **Priority 1:** Core UI (Button, Input, Card, Modal)
   - **Priority 2:** Layout (Dashboard, Navigation, Sidebar)
   - **Priority 3:** Feature components (Transaction List, Budget Cards, Goal Cards)
   - **Priority 4:** Settings, Profile, Notifications

**Deliverables:**

- ✅ All components use CSS variables or Tailwind utilities
- ✅ No hardcoded colors remain
- ✅ Components tested in both light and dark modes

### 8.3 Phase 3: Testing & Refinement (Sprint 2)

**Effort:** 3-5 days

**Tasks:**

1. Manual testing on all screens in both modes
2. Automated accessibility testing (contrast ratios)
3. Cross-browser testing (Chrome, Safari, Firefox)
4. Mobile testing (iOS, Android)
5. Fix any contrast issues
6. Refine transitions and animations

**Deliverables:**

- ✅ All screens tested in both modes
- ✅ Accessibility audit passed
- ✅ Cross-browser compatibility verified
- ✅ No visual bugs

### 8.4 Phase 4: Documentation (Sprint 2)

**Effort:** 2 days

**Tasks:**

1. Update component documentation
2. Create color system guide for developers
3. Update design system documentation
4. Add examples to Storybook (if using)

**Deliverables:**

- ✅ Developer guide published
- ✅ Component examples documented
- ✅ Design tokens documented

---

## 9. TESTING CHECKLIST

### 9.1 Visual Testing

Test each screen in both light and dark modes:

**Authentication:**

- [ ] Welcome screen
- [ ] Google OAuth callback

**Onboarding:**

- [ ] Balance setup screen
- [ ] Budget setup prompt
- [ ] Smart budget allocation screen
- [ ] Manual budget creation screen

**Dashboard:**

- [ ] Balance card
- [ ] Budget summary cards
- [ ] Goals summary cards
- [ ] Recent transactions list
- [ ] Held items badge

**Transactions:**

- [ ] Quick Add modal
- [ ] Transaction list (with income/expense colors)
- [ ] Transaction detail screen
- [ ] Edit transaction screen
- [ ] Warning badges
- [ ] Merchant recognition banner

**Budgets:**

- [ ] Budget list with progress bars
- [ ] Add/Edit budget screen
- [ ] Budget detail screen
- [ ] Budget alerts

**Savings Goals:**

- [ ] Goals list with progress
- [ ] Create/Edit goal screen
- [ ] Goal detail screen
- [ ] Add money modal

**Hold Vault:**

- [ ] Hold item modal
- [ ] Countdown timer screen
- [ ] Decision screen
- [ ] Maybe Later archive

**Regrets:**

- [ ] My Regrets screen
- [ ] Summary cards
- [ ] Insights section
- [ ] Regretted transactions list

**Settings:**

- [ ] Settings screen
- [ ] Theme toggle
- [ ] All settings sections

### 9.2 Functional Testing

- [ ] Theme preference persists across sessions
- [ ] Theme toggle works instantly
- [ ] System preference detection works
- [ ] Smooth transitions between themes (no flash)
- [ ] All interactive states work (hover, active, focus, disabled)
- [ ] Colors update correctly in charts and graphs

### 9.3 Accessibility Testing

Run these tools:

- [ ] Axe DevTools (Chrome extension)
- [ ] Lighthouse accessibility audit
- [ ] WAVE (Web Accessibility Evaluation Tool)
- [ ] Manual keyboard navigation test
- [ ] Screen reader test (NVDA or VoiceOver)

Verify:

- [ ] All text meets 4.5:1 contrast ratio
- [ ] All UI components meet 3:1 contrast ratio
- [ ] Focus indicators visible in both modes
- [ ] No information conveyed by color alone

### 9.4 Cross-Browser Testing

Test on:

- [ ] Chrome (latest)
- [ ] Safari (latest)
- [ ] Firefox (latest)
- [ ] Edge (latest)
- [ ] Mobile Safari (iOS)
- [ ] Mobile Chrome (Android)

### 9.5 Performance Testing

- [ ] No layout shift when theme changes
- [ ] Transitions smooth (60fps)
- [ ] CSS variables don't impact render performance
- [ ] Theme toggle responds instantly (<100ms)

---

## 10. COMMON PITFALLS & SOLUTIONS

### 10.1 Flash of Unstyled Content (FOUC)

**Problem:** Brief flash of light theme before dark theme loads

**Solution:**

```tsx
// Add blocking script in app/layout.tsx or index.html
<script
  dangerouslySetInnerHTML={{
    __html: `
      (function() {
        const theme = localStorage.getItem('kaizen-theme') || 'system';
        const resolvedTheme = theme === 'system'
          ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
          : theme;
        document.documentElement.classList.add(resolvedTheme);
        document.documentElement.setAttribute('data-theme', resolvedTheme);
      })();
    `,
  }}
/>
```

### 10.2 Inconsistent Colors in Charts

**Problem:** Chart libraries (Recharts) don't automatically adapt to dark mode

**Solution:**

```tsx
import { useTheme } from "@/providers/ThemeProvider";

function BudgetChart() {
  const { resolvedTheme } = useTheme();

  const chartColors = {
    safe: resolvedTheme === "dark" ? "#6ee7b7" : "rgb(55, 151, 119)",
    warning: "#f97316",
    danger: resolvedTheme === "dark" ? "#fca5a5" : "#ef4444",
  };

  return (
    <BarChart data={data}>
      <Bar dataKey="amount" fill={chartColors.safe} />
    </BarChart>
  );
}
```

### 10.3 Third-Party Components

**Problem:** Third-party UI libraries don't respect theme

**Solution:** Wrap or override their styles:

```tsx
// Example: Override modal from library
<Modal
  className="bg-surface text-text-primary border border-border"
  overlayClassName="bg-background/80"
>
  {/* content */}
</Modal>
```

---

## 11. SUCCESS METRICS

### 11.1 Development Metrics

- ✅ 0 hardcoded colors in components
- ✅ 100% of components migrated to theme system
- ✅ 0 accessibility violations (WCAG AA)
- ✅ < 100ms theme toggle response time

### 11.2 User Metrics

- Track theme preference distribution:
  - % users on light mode
  - % users on dark mode
  - % users on system preference

- Monitor user feedback:
  - Theme-related support tickets
  - User satisfaction with dark mode
  - Feature requests for theme customization

### 11.3 Performance Metrics

- Page load time unchanged (< 2s)
- No render performance degradation
- Smooth theme transitions (60fps)

---

## 12. FUTURE ENHANCEMENTS

### 12.1 Phase 2 (Post-Launch)

**Custom Color Themes:**

- Allow users to customize primary color
- Preset theme options (Blue, Purple, Teal)
- User-defined accent colors

**High Contrast Mode:**

- Accessibility enhancement
- Stronger contrast ratios (7:1+)
- For users with visual impairments

**Automatic Theme Switching:**

- Schedule-based (light during day, dark at night)
- Location-based (sunset/sunrise)

### 12.2 Phase 3 (Advanced)

**Per-Feature Theming:**

- Different themes for different sections
- Budget section in green theme
- Goals section in blue theme

**Animation Preferences:**

- Respect prefers-reduced-motion
- Option to disable all animations
- Customize transition speeds

---

## APPENDIX A: Quick Reference

### Color Variable Naming Convention

```
--color-{category}-{variant}

Categories: background, surface, border, text, primary, success, error, warning, info
Variants: DEFAULT (no suffix), hover, active, light, dark, inverse
```

### Tailwind Class Reference

```tsx
// Backgrounds
bg - background;
bg - surface;
bg - surface - secondary;

// Text
text - text - primary;
text - text - secondary;
text - text - tertiary;
text - text - inverse;

// Borders
border - border;
border - border - strong;

// Brand colors
bg - primary / text - primary;
bg - primary - hover;
bg - primary - light;

// Semantic colors
bg - success / text - success;
bg - error / text - error;
bg - warning / text - warning;
bg - info / text - info;

// Financial
text - income;
text - expense;
```

---

## APPENDIX B: Color Accessibility Matrix

| Combination                  | Light Mode Contrast | Dark Mode Contrast | WCAG AA                   |
| ---------------------------- | ------------------- | ------------------ | ------------------------- |
| Text Primary on Background   | 8.2:1               | 17.8:1             | ✅ Pass                   |
| Text Secondary on Background | 5.1:1               | 13.1:1             | ✅ Pass                   |
| Primary on White             | 1.9:1               | N/A                | ❌ Fail (use darker text) |
| Success on White             | 3.2:1               | N/A                | ✅ Pass (large text only) |
| Error on White               | 3.9:1               | 6.9:1              | ✅ Pass                   |
| Warning on White             | 4.1:1               | 7.2:1              | ✅ Pass                   |

---

**END OF PRD**
