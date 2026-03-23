# Category Icon & Color System

## Icon set

The approved icon set is defined in both the backend (`CategoryDesignSystem.ICON_SEQUENCE`) and the frontend (`CATEGORY_ICON_SEQUENCE`). Every category icon used today is sourced from this list:

| Icon name | Description |
|-----------|-------------|
| `home` | Housing / shelter |
| `utensils` | Food / dining |
| `car` | Transport |
| `bolt` | Utilities |
| `heartbeat` | Health |
| `film` | Entertainment |

## Color palette

The shared palette (`CategoryDesignSystem.COLOR_PALETTE` / `CATEGORY_COLOR_PALETTE`) consists of the following hex values:

| Color | Usage notes |
|-------|-------------|
| `#1d4ed8` | Primary blue |
| `#ea580c` | Orange accent |
| `#059669` | Green accent |
| `#b91c1c` | Red accent |
| `#7c3aed` | Purple accent |
| `#0f766e` | Teal accent |
| `#d97706` | Secondary amber (currently fails 3:1 contrast in light mode) |
| `#0f172a` | Deep indigo accent |

No two default categories share the same icon + color pairing per PRD Story 8: each `DEFAULT_CATEGORY_DESIGNS` entry uses a unique combination.

## Assignment mechanism

Custom categories always follow the same cyclic assignment algorithm until PRD Open Question 6 settles whether a picker is required. The first custom category inherits the first icon/color pair, the next uses the second pair, and so on, wrapping when the palette length is reached. This logic lives in:

* Backend: `CategoryDesignSystem.autoAssign(int existingCustomCount)`
* Frontend: `getAutoAssignedCategoryDesign(existingCustomCategories)`

Once a user adds a new category, the `CategoryBadge` component renders the assigned icon and color in any list or transaction context by taking `icon`, `color`, and a configurable `size` prop.

## Contrast ratio audit (light mode background `#f6f8f4`)

All palette colors were tested against the light background and measured as follows (WCAG 2.1 AA non-text minimum 3:1):

| Color | Contrast ratio | Pass / Fail |
|-------|----------------|-------------|
| `#1d4ed8` | 6.27 | Pass |
| `#ea580c` | 3.33 | Pass |
| `#059669` | 3.53 | Pass |
| `#b91c1c` | 6.05 | Pass |
| `#7c3aed` | 5.33 | Pass |
| `#0f766e` | 5.12 | Pass |
| `#d97706` | 2.98 | **Fail** (requires review or a different surface treatment) |
| `#0f172a` | 16.71 | Pass |

## Dark mode extension point

Dark mode contrast requirements are pending PRD Open Question 8. Once confirmed, add the dark-mode palette shards to both the backend and frontend `CategoryDesignSystem` files, and adjust `CategoryBadge`’s `style` hook if necessary.

## Notes

* The `CategoryCreationForm` currently highlights the assigned icon/color pair and clarifies that Instruction 8 defines the palette. Replace that stubbed explanation with a picker if the product decides to support manual selection.  
* Any documentation or API that surfaces category metadata should reference these constants so client and server stay in sync.
