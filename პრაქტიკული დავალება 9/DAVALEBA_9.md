# პრაქტიკული დავალება 9 — Dashboard ლეიაუთი და პროდუქტების კატალოგი

**კოდი:** [wms-app/src/](../wms-app/src/)

```bash
cd wms-app
npm run dev    # http://localhost:5173
```

## ფაილების სტრუქტურა

```
src/
├── components/
│   ├── Header/        Header.tsx + Header.css         ← Flexbox
│   ├── Sidebar/       Sidebar.tsx + Sidebar.css       ← მენიუ, მობილურზე იმალება
│   ├── StatCard/      StatCard.tsx + StatCard.css     ← Flexbox
│   ├── ProductCard/   ProductCard.tsx + ProductCard.css
│   ├── Footer/        Footer.tsx + Footer.css
│   └── Layout/        Layout.tsx + Layout.css         ← CSS Grid
├── pages/dashboard/   DashboardPage.tsx + .css        ← auto-fit Grid
├── data/items.ts      სატესტო პროდუქტები
├── App.tsx
└── index.css          CSS ცვლადები + reset
```

> `.jsx`-ის ნაცვლად `.tsx` — პროექტი TypeScript-ზეა.

## ნაბიჯი 1: CSS ცვლადები ([index.css](../wms-app/src/index.css))

```css
:root {
  /* ფერები */
  --primary: #2563eb;     /* მთავარი */
  --bg: #f8fafc;          /* ფონი */
  --surface: #ffffff;     /* კარტა */
  --text: #0f172a;        /* ტექსტი */
  --text-muted: #64748b;
  --border: #e2e8f0;

  /* დაშორებები */
  --space-xs: 0.25rem;
  --space-sm: 0.5rem;
  --space-md: 1rem;
  --space-lg: 1.5rem;
  --space-xl: 2rem;

  /* რადიუსი და ჩრდილი */
  --radius-md: 0.75rem;
  --shadow-sm: 0 1px 3px rgb(0 0 0 / 0.08), 0 1px 2px rgb(0 0 0 / 0.04);
}

*, *::before, *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}
```

## ნაბიჯი 2: მაკრო-ლეიაუთი — CSS Grid ([Layout.css](../wms-app/src/components/Layout/Layout.css))

```css
.layout {
  display: grid;
  grid-template-columns: var(--sidebar-width) 1fr;   /* 260px | დანარჩენი */
  grid-template-rows: var(--header-height) 1fr auto;
  grid-template-areas:
    'header  header'
    'sidebar main'
    'sidebar footer';
}

@media (max-width: 768px) {
  .layout {
    grid-template-columns: 1fr;          /* ერთი სვეტი */
    grid-template-areas: 'header' 'main' 'footer';
  }
}
```

მობილურზე Sidebar იმალება (`transform: translateX(-100%)`) და ☰ ღილაკით გამოდის მარცხნიდან.

## ნაბიჯი 3: სტატისტიკის კარტები — auto-fit ([DashboardPage.css](../wms-app/src/pages/dashboard/DashboardPage.css))

```css
.dashboard__stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: var(--space-md);
}
```

4 კარტა: მარაგი სულ · დღეს მიღებული · გზაშია · კრიტიკული მარაგი. ეკრანის დაპატარავებისას თავისით გადადიან ახალ ხაზზე — მედია-ქიერის გარეშე.

პროდუქტების ბადეც იგივე პრინციპითაა (`auto-fill, minmax(240px, 1fr)`).

## ნაბიჯი 4: Flexbox კომპონენტებში

**Header** — ლოგო მარცხნივ, პროფილი მარჯვნივ:
```css
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
```

**StatCard** — იკონა და ტექსტი გვერდიგვერდ, ტექსტი ვერტიკალურად:
```css
.stat-card { display: flex; align-items: center; gap: var(--space-md); }
.stat-card__body { display: flex; flex-direction: column; }
```

## სემანტიკა
`<header>`, `<aside>` + `<nav>`, `<main>`, `<section>`, `<article>` (თითო კარტა), `<footer>` — წინა დავალების პრინციპით.
