# Implementation Plan: Colorblind Accessible Charts

## Phase 1: Chart Infrastructure & Utilities
- [ ] Task: Define Pattern and Shape Marker constants/types in `src/types` or theme files.
    - [ ] Sub-task: Write unit tests for pattern generation utilities.
    - [ ] Sub-task: Implement pattern definitions and shape marker SVG paths.
- [ ] Task: Create a reusable utility or hook to map data categories/series to patterns and shapes consistently.
    - [ ] Sub-task: Write unit tests ensuring deterministic mapping of category to pattern/shape.
    - [ ] Sub-task: Implement the mapping logic.
- [ ] Task: Conductor - User Manual Verification 'Phase 1: Chart Infrastructure & Utilities' (Protocol in workflow.md)

## Phase 2: Money Flow Analysis & Balance Trends (Line/Bar Charts)
- [ ] Task: Update the line/bar chart components used in Money Flow Analysis and Balance Trends to render patterns.
    - [ ] Sub-task: Write/update component tests to verify pattern props/attributes are passed to chart primitives.
    - [ ] Sub-task: Implement pattern fill logic in the chart components.
- [ ] Task: Update the line chart components to render shape markers on data points.
    - [ ] Sub-task: Write/update component tests to verify shape marker rendering.
    - [ ] Sub-task: Implement shape marker rendering logic.
- [ ] Task: Conductor - User Manual Verification 'Phase 2: Money Flow Analysis & Balance Trends (Line/Bar Charts)' (Protocol in workflow.md)

## Phase 3: Account Breakdowns (Pie/Donut Charts)
- [ ] Task: Update the pie/donut chart components used in Account Breakdowns to render pattern fills.
    - [ ] Sub-task: Write/update component tests for pattern fills in pie charts.
    - [ ] Sub-task: Implement pattern fill logic for pie/donut slices.
- [ ] Task: Implement inline text labels for pie/donut charts to show category/value without relying solely on the legend.
    - [ ] Sub-task: Write/update component tests for inline label rendering.
    - [ ] Sub-task: Implement inline label rendering logic and positioning.
- [ ] Task: Conductor - User Manual Verification 'Phase 3: Account Breakdowns (Pie/Donut Charts)' (Protocol in workflow.md)