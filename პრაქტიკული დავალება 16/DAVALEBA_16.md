# პრაქტიკული დავალება 16 — ოპტიმიზაცია და კოდის სისუფთავე

**პროექტი:** WMS · **კოდი:** [wms-app/src/](../wms-app/src/)

---

## 1. React Performance

### useMemo: მძიმე გამოთვლები

| სად | რას ითვლის |
|---|---|
| [useInventoryFilters.ts](../wms-app/src/hooks/useInventoryFilters.ts) | ძებნა + 2 ფილტრი + სორტირება (`visibleItems`) და უნიკალური კატეგორიები |
| [DashboardPage.tsx](../wms-app/src/pages/dashboard/DashboardPage.tsx) | სტატისტიკა: მარაგი სულ (`reduce`), კრიტიკული მარაგი (`filter`) |
| [WriteOffForm.tsx](../wms-app/src/components/WriteOffForm/WriteOffForm.tsx) | Zod სქემა კონკრეტული ნაშთისთვის |

```ts
const stats = useMemo(() => ({
  totalQuantity: items.reduce((sum, item) => sum + item.quantity, 0),
  lowStock: items.filter((item) => item.quantity < item.minQuantity).length,
}), [items])   // ხელახლა ითვლება მხოლოდ მაშინ, როცა items შეიცვლება
```

### useCallback + React.memo: სია

```tsx
// InventoryPage — ფუნქცია არ იქმნება თავიდან ყოველ რენდერზე
const handleAction = useCallback((action, id) => { ... }, [items, canManage, canWriteOff])

// InventoryTable — თითო რიგი memo-შია
const InventoryRow = memo(function InventoryRow({ item, canEdit, canWriteOff }) { ... })
export default memo(InventoryTable)
```

| კომპონენტი | memo |
|---|---|
| `InventoryTable`, `InventoryRow` | ✅ |
| `InventoryCards`, `InventoryCard` | ✅ |
| `InventoryFilters`, `ProductCard`, `StatCard`, `StatusBadge` | ✅ |
| `toggleSort`, `resetFilters`, `handleAction` | `useCallback` |

**შედეგი:** მოდალის გახსნისას ან სხვა state-ის შეცვლისას 12 რიგი და 12 ბარათი ხელახლა აღარ იხატება. ერთი ნივთის რედაქტირებისას გადაიხატება მხოლოდ **ერთი** რიგი.

### Lazy Loading & Code Splitting

**ფაილი:** [App.tsx](../wms-app/src/App.tsx)

```tsx
const DashboardPage = lazy(() => import('./pages/dashboard/DashboardPage'))
const UsersPage = lazy(() => import('./pages/users/UsersPage'))   // მხოლოდ მენეჯერი
...
<Suspense fallback={<SkeletonGrid count={4} />}>
  <Routes>...</Routes>
</Suspense>
```

**Bundle ზომა (`npm run build`):**

| | ოპტიმიზაციამდე | ოპტიმიზაციის შემდეგ |
|---|---|---|
| ფაილები | 1 JS ფაილი | 12 ცალკე ფაილი (chunk) |
| მთავარი ფაილი | **428.97 kB** (gzip 132.7 kB) | **267.17 kB** (gzip 85.4 kB) — **−38%** |
| Dashboard-ის პირველი ჩატვირთვა | 428.97 kB | ≈ 288.7 kB (index + Dashboard + useItems) — **−33%** |
| Zod (121 kB) | ყოველთვის | მხოლოდ ფორმიან გვერდებზე (შესვლა, მარაგები) |
| „თანამშრომლების" გვერდი (3.4 kB) | ყველას | მხოლოდ მენეჯერს, როცა გახსნის |

---

## 2. მედია-ფაილები

### WebP კონვერტაცია

პროექტში სურათები ადრე არ იყო. დავამატე კატეგორიების სურათები: ელექტრონიკა, ავეჯი, საკანცელარიო, შესაფუთი. ორიგინალი 1600×1200 PNG-ია (Python / Pillow-ით შექმნილი სატესტო სურათები). ოპტიმიზაციისას ზომა შემცირდა **480×360**-მდე, რადგან ბარათზე უფრო დიდი არ ჩანს, და გადავიდა **WebP** ფორმატში (ხარისხი 75).

| სურათი | PNG (ოპტიმიზაციამდე) | WebP (ოპტიმიზაციის შემდეგ) | შემცირება |
|---|---:|---:|---:|
| electronics | 2 008 KB | 1.9 KB | 99.9% |
| furniture | 2 311 KB | 2.0 KB | 99.9% |
| stationery | 2 102 KB | 2.5 KB | 99.9% |
| packaging | 2 091 KB | 2.5 KB | 99.9% |
| **სულ** | **8.3 MB** | **8.9 KB** | **~960-ჯერ** |

ფაილები: `wms-app/public/images/categories/*.webp`. ორიგინალები ინახება `პრაქტიკული დავალება 16/images-original/`-ში და Git-ში არ იტვირთება.

### Lazy Loading & SVG

```tsx
<img
  src={getCategoryImage(item.category)}
  width={480} height={360}     // გვერდი არ „ხტება" ჩატვირთვისას
  loading="lazy"               // იტვირთება მხოლოდ ეკრანთან მიახლოებისას
  decoding="async"
  alt=""
/>
```

- **ყველა იკონა SVG-ია** და მოდის `lucide-react`-დან: ძებნა, ფილტრები, სტატუსები, მენიუ;
- PNG ან JPEG იკონები პროექტში არ არის.

---

## 3. Clean Code

### Custom Hooks: რეფაქტორინგის მაგალითები

**მაგალითი 1: InventoryPage**

| ადრე | ახლა |
|---|---|
| `InventoryPage.tsx` დაახლოებით 250 ხაზი: 5 `useState`, ფილტრაცია, სორტირება, `fetch`, ცხრილი, ბარათები | ფილტრაცია და სორტირება → **`useInventoryFilters`**, მონაცემები და CRUD → **`useItems`**, ცხრილი/ბარათები/ფილტრები → ცალკე კომპონენტები. გვერდში დარჩა მხოლოდ UI და მოდალის მართვა |

**მაგალითი 2: useItems**

| ადრე | ახლა |
|---|---|
| ნივთების წამოღება პირდაპირ გვერდში | **`useItems`** აერთიანებს: წამოღებას, ქეშს და ოფლაინ რეჟიმს, დამატება/რედაქტირება/წაშლა/ჩამოწერას, Race Condition-ის დაცვას. გვერდი მხოლოდ `addItem()`, `writeOffItem()` და სხვა ფუნქციებს იძახებს |

**ყველა hook:** `useItems`, `useInventoryFilters`, `useDebounce`, `useEventDelegation`, `useUsers`.

### ფორმები: React Hook Form + Zod

| ფორმა | სქემა |
|---|---|
| შესვლა | `loginSchema` |
| რეგისტრაცია | `registerSchema` (პაროლი, გამეორება, ტელეფონი) |
| ნივთის დამატება/რედაქტირება | `itemSchema` (SKU, შტრიხკოდი, თარო) |
| ჩამოწერა | `createWriteOffSchema(stock)` (ნაშთზე მეტი არა) |

---

## Git commit-ები

```
perf: memoize inventory rows, cards and callbacks with React.memo and useCallback
perf: lazy load route pages with React.lazy and Suspense
perf: add category images as WebP with lazy loading
style: let product image fill card width
```
