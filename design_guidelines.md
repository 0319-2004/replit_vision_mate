# DataFlow Pro - Design Guidelines

## Design Approach
**Selected Approach**: Design System (Material Design) + Reference-Based (Linear/Notion)
**Justification**: Enterprise data tool requiring both functionality and modern appeal to attract technical teams

## Core Design Elements

### Color Palette
**Primary Colors (Dark Mode)**:
- Background: 12 8% 6% (deep charcoal)
- Surface: 220 13% 9% (dark blue-gray)
- Primary: 210 100% 56% (electric blue)
- Text Primary: 0 0% 95% (near white)
- Text Secondary: 0 0% 70% (medium gray)

**Light Mode**:
- Background: 0 0% 98% (off-white)
- Surface: 0 0% 100% (pure white)
- Primary: 210 100% 50% (vivid blue)
- Text Primary: 220 13% 18% (dark blue-gray)

**Accent Colors**:
- Success: 142 71% 45% (emerald green)
- Warning: 38 92% 50% (amber)
- Error: 0 84% 60% (coral red)

### Typography
- **Primary**: Inter (Google Fonts)
- **Monospace**: JetBrains Mono (for code/data)
- Hierarchy: text-xs to text-4xl with consistent line-height

### Layout System
**Spacing Units**: Tailwind 2, 4, 6, 8, 12, 16
- Component padding: p-4, p-6
- Section margins: mb-8, mb-12
- Grid gaps: gap-4, gap-6

### Component Library

**Navigation**:
- Dark sidebar with collapsible sections
- Breadcrumb navigation for deep workflows
- Tab-based interface for data source management

**Data Display**:
- Clean tables with zebra striping
- JSON/CSV preview cards with syntax highlighting
- Real-time status indicators with subtle pulse animations
- Progress bars for scraping operations

**Forms & Controls**:
- Grouped form sections with clear labels
- Toggle switches for boolean settings
- Multi-select dropdowns for data sources
- Code editor components with syntax highlighting

**Dashboard Elements**:
- Metric cards with large numbers and trend indicators
- Log viewers with search and filtering
- API documentation panels
- Integration status cards

### Visual Hierarchy
- Use consistent elevation (shadow-sm, shadow-md)
- Clear section dividers with subtle borders
- Consistent icon usage (Heroicons throughout)
- Strategic use of color to highlight important actions

### Interaction Patterns
- Hover states on interactive elements
- Loading states for async operations
- Toast notifications for feedback
- Modal dialogs for configuration

### Images
No large hero images needed. Focus on:
- Small feature icons in dashboard cards
- Integration logos in connection panels
- Data visualization charts and graphs
- Screenshot thumbnails for scraped content previews

This design balances the technical nature of data tools with modern, approachable aesthetics that technical teams expect from contemporary SaaS products.