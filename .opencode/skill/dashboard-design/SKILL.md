---
name: dashboard-design
description: Use when redesigning, modernizing, or creating new dashboard UIs and data-visualization components. Covers Recharts v3 + Tailwind v4 patterns, card-based layouts, chart best practices, responsive grids, loading/empty states, and color systems. Triggers on keywords: dashboard, redesign, chart, visualization, modernize UI, data display, summary cards, KPI widgets.
---

# Dashboard Design with Recharts v3 + Tailwind CSS v4

## Design System

### Color Palette (BillFlow Tokens)

```
Primary:     hsl(169 76% 28%)  →  #0d9488  teal
Background:  hsl(210 20% 98%)  →  light gray-blue
Foreground:  hsl(220 28% 12%)  →  near-black
Border:      hsl(214 18% 84%)  →  light gray
Muted:       hsl(215 16% 46%)  →  medium gray
Destructive: hsl(0 72% 48%)    →  red
```

### Chart Color Palettes

Use distinct, accessible palettes per chart type:

**Categorical (Pie/Donut)** — 8 colors, visually distinct:
```
#0d9488 (teal/primary)  #2563eb (blue)     #d97706 (amber)
#dc2626 (red)           #7c3aed (violet)   #059669 (emerald)
#db2777 (pink)          #52525b (slate)
```

**Sequential (Bar/Area)** — monochromatic gradient:
```
Single: fill="#0d9488" (primary teal)
Multi-series: primary teal + blue + amber
```

**Status (Badges/indicators):**
```
Paid/Success:  bg-primary/10 text-primary border-primary/20
Pending:       bg-background text-muted border-border
Warning:       bg-yellow-50 text-yellow-700 border-yellow-200
Overdue/Error: bg-destructive/10 text-destructive border-destructive/20
```

## Card System

### Summary KPI Card Pattern

```tsx
<Card>
  <div className="flex items-center gap-3">
    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
      <Icon size={20} className="text-primary" />
    </div>
    <div>
      <p className="text-sm text-muted">Label</p>
      <p className="text-xl font-bold">$Value</p>
    </div>
  </div>
</Card>
```

Variations:
- **Trend card**: Add `↑12%` or `↓5%` with `text-primary`/`text-destructive` color
- **Sparkline card**: Include a tiny `AreaChart` (height: 40px) inside the card
- **Progress card**: Add a progress bar with `bg-primary` fill

### Dashboard Layout Grid

```
┌──────────────────────────────────────────────────┐
│  [KPI 1]    [KPI 2]    [KPI 3]    [KPI 4]      │  grid-cols-4
├──────────────────────┬───────────────────────────┤
│   Category Pie       │   Monthly Bar Chart       │  grid-cols-2
├──────────────────────┼───────────────────────────┤
│   Upcoming Bills     │   AI Insights / Sidebar   │  grid-cols-3 (2+1)
├──────────────────────┴───────────────────────────┤
│   Bill List / Table                               │  full width
└──────────────────────────────────────────────────┘
```

Spacing: `mt-6` between sections, `gap-6` within grid rows.

## Recharts Patterns

### Required Imports

```tsx
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie,
  Cell, Legend, AreaChart, Area, LineChart, Line
} from "recharts";
```

### SSR Safety (MUST DO for all chart components)

```tsx
const [mounted, setMounted] = useState(false);
useEffect(() => setMounted(true), []);

if (!mounted) return <Card><CardHeader><CardTitle>Title</CardTitle></CardHeader><div className="h-64" /></Card>;
```

### BarChart Template

```tsx
<ResponsiveContainer width="100%" height="100%">
  <BarChart data={data}>
    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
    <YAxis tick={{ fontSize: 12 }} />
    <Tooltip
      contentStyle={{ borderRadius: "8px", border: "1px solid #e5e7eb" }}
      formatter={(value: number) => `$${value.toLocaleString()}`}
    />
    <Bar dataKey="value" fill="#0d9488" radius={[4, 4, 0, 0]} />
  </BarChart>
</ResponsiveContainer>
```

### Donut Chart Template

```tsx
<ResponsiveContainer width="100%" height="100%">
  <PieChart>
    <Pie
      data={data}
      cx="50%"
      cy="50%"
      innerRadius={60}
      outerRadius={90}
      paddingAngle={2}
      dataKey="value"
    >
      {data.map((_, i) => (
        <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
      ))}
    </Pie>
    <Tooltip formatter={(value: number) => `$${value.toLocaleString()}`} />
    <Legend />
  </PieChart>
</ResponsiveContainer>
```

### AreaChart (for trends/sparklines)

```tsx
<ResponsiveContainer width="100%" height="100%">
  <AreaChart data={data}>
    <defs>
      <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
        <stop offset="5%" stopColor="#0d9488" stopOpacity={0.3} />
        <stop offset="95%" stopColor="#0d9488" stopOpacity={0} />
      </linearGradient>
    </defs>
    <Area type="monotone" dataKey="value" stroke="#0d9488" fill="url(#colorValue)" strokeWidth={2} />
  </AreaChart>
</ResponsiveContainer>
```

### Custom Tooltip Component

```tsx
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-border bg-white p-3 shadow-sm">
      <p className="text-xs text-muted">{label}</p>
      <p className="text-sm font-semibold">${payload[0].value.toLocaleString()}</p>
    </div>
  );
}
```

## Loading & Empty States

### Skeleton Loading

```tsx
<div className="animate-pulse">
  <div className="h-4 w-32 rounded bg-border mb-4" />
  <div className="h-64 rounded bg-border/50" />
</div>
```

### Empty State

```tsx
<div className="flex h-64 items-center justify-center text-sm text-muted">
  No data yet
</div>
```

### Error State

```tsx
<div className="flex h-64 flex-col items-center justify-center gap-2">
  <AlertTriangle size={24} className="text-destructive" />
  <p className="text-sm text-muted">Failed to load chart data</p>
  <Button variant="ghost" size="sm">Retry</Button>
</div>
```

## Responsive Patterns

```tsx
{/* KPIs: 1 col mobile → 2 col tablet → 4 col desktop */}
<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

{/* Charts: stacked mobile → side-by-side desktop */}
<div className="grid gap-6 lg:grid-cols-2">

{/* Detail + sidebar: stacked → 2:1 split */}
<div className="grid gap-6 lg:grid-cols-3">
  <div className="lg:col-span-2">{/* Main content */}</div>
  <div>{/* Sidebar content */}</div>
</div>
```

## Typography Scale

```
text-2xl font-semibold   → Page title
text-lg font-semibold     → Section headers
text-xl font-bold         → KPI values
text-base font-semibold   → Card titles
text-sm                   → Body, descriptions
text-sm text-muted        → Secondary info
text-xs text-muted        → Metadata, dates
```

## Animation (tailwindcss-animate plugin)

Available via the already-configured `tailwindcss-animate` plugin:
- Entrance: `animate-in fade-in slide-in-from-bottom-4 duration-300`
- Hover: `transition-all duration-200 hover:scale-[1.02] hover:shadow-md`
- Numbers: `transition-colors` for color changes
- Chart: Recharts has `isAnimationActive` prop (true by default)

## Pro Tips

1. **Always use `$` + `toLocaleString()`** for consistent number formatting in tooltips
2. **Keep chart heights consistent** — 64 (h-64 = 256px) works well for full charts, 40 for sparklines
3. **Grid gap spacing**: 4 (16px) for card grids, 6 (24px) for section grids
4. **Color contrast**: Primary icon in primary/10 background, destructive icon in destructive/10 background
5. **Date formatting**: Use `date-fns` which is already in the project
6. **Never hardcode hex colors** when a design token exists — use `text-primary`, `bg-primary/10`, etc.
7. **Recharts v3 tip**: The `responsive` prop is available on chart components directly, but the `ResponsiveContainer` wrapper pattern is established and reliable
8. **Dark mode readiness**: Use CSS variable tokens (`text-primary` not `text-[#0d9488]`) so switching to dark mode later requires only updating `:root` / `.dark` CSS variables
