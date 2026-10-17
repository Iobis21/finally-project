# პრაქტიკული დავალება 13 — არქიტექტურული რეფაქტორიზაცია და მოდულურობა

**პროექტი:** WMS · **კოდი:** [wms-app/src/](../wms-app/src/)

---

## 1. ფაილური სტრუქტურა

```
src/
├── components/          ← ვიზუალური, მრავალჯერადი კომპონენტები (UI)
│   ├── ui/
│   │   ├── Button/      ← ზოგადი ღილაკი (variant: primary / secondary / danger)
│   │   └── Modal/       ← ზოგადი მოდალი (createPortal + children)
│   ├── ItemForm/        ← ნივთის ფორმა + FormField
│   ├── ConfirmDialog/   ← დადასტურების შიგთავსი
│   ├── StatusBadge/     ← სტატუსის ნიშანი + პულსი
│   ├── Layout/ Header/ Sidebar/ Footer/
│   ├── StatCard/ ProductCard/ EmptyState/ Loader/
├── hooks/               ← ბიზნეს-ლოგიკა და მონაცემების მართვა
│   ├── useItems.ts            ← წამოღება, დამატება, რედაქტირება, წაშლა
│   ├── useInventoryFilters.ts ← ძებნა, ფილტრი, სორტირება
│   ├── useDebounce.ts         ← დაყოვნება
│   └── useEventDelegation.ts  ← ერთი მსმენელი მშობელზე
├── services/            ← API მოთხოვნები (ადრე: api/)
│   ├── apiClient.ts     ← ერთი request() ფუნქცია: GET / POST / PATCH / DELETE
│   └── itemService.ts   ← getItems, createItem, updateItem, deleteItem
├── types/               ← TypeScript ინტერფეისები (Item, NewItem, Role ...)
├── schemas/             ← Zod ვალიდაცია
├── pages/
│   └── inventory/
│       ├── InventoryPage.tsx      ← მხოლოდ აერთიანებს ნაწილებს
│       └── components/            ← InventoryFilters, InventoryTable, InventoryCards, RowActions
├── context/  routes/  utils/
```

---

## 2. SOLID პრინციპები

### S: Single Responsibility (ერთი პასუხისმგებლობა)

**ადრე:** `InventoryPage.tsx` დაახლოებით 250 ხაზი იყო და ერთად აკეთებდა ყველაფერს: მონაცემების წამოღებას, 5 state-ს, ფილტრაციას, სორტირებას, ცხრილს, ბარათებს და ფილტრების ფორმას.

**ახლა:**

| ფაილი | ერთი ამოცანა |
|---|---|
| `useItems` | მონაცემები სერვერიდან (და ცვლილებები) |
| `useInventoryFilters` | ძებნა, ფილტრი, სორტირება |
| `InventoryFilters` | ფილტრების ველების ჩვენება |
| `InventoryTable` | ცხრილის ჩვენება (დესკტოპი) |
| `InventoryCards` | ბარათების ჩვენება (მობილური) |
| `RowActions` | ✏️ / 🗑 ღილაკები |
| `InventoryPage` | მხოლოდ აერთიანებს ზემოთ ჩამოთვლილებს და მართავს მოდალს |

მონაცემების დამუშავება (Fetching / Filtering) **hooks-შია**, ვიზუალი კი **კომპონენტებში**.

### O: Open/Closed (ღიაა გაფართოებისთვის, დახურულია შეცვლისთვის)

**Modal** შიგთავსს `children`-ით იღებს, ამიტომ ახალი შიგთავსისთვის Modal-ის კოდის შეცვლა საჭირო არ არის:

```tsx
<Modal title="ახალი ნივთი" ...>  <ItemForm ... />      </Modal>
<Modal title="ნივთის წაშლა" ...> <ConfirmDialog ... /> </Modal>
```

**Button** ფერს `variant`-ით იღებს, დანარჩენ ატრიბუტებს კი (`onClick`, `type`, `disabled`) პირდაპირ `<button>`-ს გადასცემს (`...rest`):

```tsx
<Button variant="danger" isLoading={isLoading} onClick={confirm}>წაშლა</Button>
```

### I: Interface Segregation (მხოლოდ საჭირო props)

თითო კომპონენტი იღებს მხოლოდ იმას, რაც მართლა სჭირდება:

| კომპონენტი | props |
|---|---|
| `RowActions` | `{ id, name }`, მხოლოდ ორი ველი და არა მთელი `Item` |
| `StatusBadge` | `{ item }` |
| `InventoryCards` | `{ items, onAction }`, სორტირება არ სჭირდება და არც იღებს |
| `InventoryTable` | `{ items, sortKey, sortAsc, onSort, onAction }` |

ახალი ნივთისთვის ცალკე ტიპია, `NewItem = Omit<Item, 'id'>`: id-ს სერვერი ანიჭებს და ფორმას ეს ველი არ სჭირდება.

### D: Dependency Inversion (UI არ არის მიბმული HTTP-ზე)

```
InventoryPage  →  useItems()  →  itemService  →  apiClient (fetch)
   (UI)            (hook)        (სერვისი)         (HTTP)
```

- კომპონენტებში **არცერთი `fetch` არ არის**: ისინი მხოლოდ `addItem()`, `editItem()` და `removeItem()`-ს იძახებენ;
- თუ json-server-ს Supabase-ით ან სხვა API-ით შევცვლით, შეიცვლება მხოლოდ `services/` და კომპონენტები ხელუხლებელი დარჩება.

---

## 3. DRY და სისუფთავე

| დუბლირება ადრე | ახლა |
|---|---|
| `fetch` + შეცდომის შემოწმება ყოველ ფუნქციაში | ერთი `request()` ფუნქცია `apiClient.ts`-ში |
| სტატუსის ნიშანი 3 ადგილას ცალ-ცალკე (ProductCard, ცხრილი, ბარათები) | ერთი `<StatusBadge />` |
| ლეიბლი + input + შეცდომა ყველა ველზე | ერთი `<FormField />` |
| 3 სორტირებადი სათაური ცალ-ცალკე | `sortableColumns` მასივი + `<SortHeader />` |
| სტატუსების `<option>`-ები ხელით | `Object.keys(statusLabels).map(...)` |
| ცალკე „გასუფთავება“ ღილაკი, რომელიც Empty State-საც ჰქონდა (QA IMP-01) | დარჩა ერთი |

**სახელდება:** კომპონენტები PascalCase-ით (`InventoryTable`, `RowActions`), ფუნქციები და ცვლადები camelCase-ით (`useInventoryFilters`, `handleAction`, `visibleItems`).

**ფორმატირება:** დაემატა **Prettier** (`.prettierrc`) და ბრძანება `npm run format`. მთელი `src/` ერთნაირადაა დაფორმატებული.

---

## 4. Git: ატომური commit-ები

მთელი სამუშაო დაიყო **14 პატარა commit-ად** (Conventional Commits):

| # | commit | რა |
|---|---|---|
| 1 | `refactor: move API requests into services layer` | `api/` → `services/` |
| 2 | `feat: add create, update and delete item services` | POST / PATCH / DELETE |
| 3 | `feat: add item mutations to useItems hook with instant state update` | ცვლილებები Refresh-ის გარეშე |
| 4 | `feat: add reusable Modal (createPortal) and Button components` | ზოგადი UI |
| 5 | `feat: add item form with React Hook Form and Zod validation` | ფორმა |
| 6 | `refactor: split InventoryPage into filters hook and child components` | SRP |
| 7 | `feat: debounce inventory search input (300ms)` | Debounce |
| 8 | `fix: keep modal focus stable between renders` | ბაგის გასწორება |
| 9 | `feat: add, edit and delete items via modal with event delegation` | CRUD + Delegation |
| 10 | `style: add GPU micro-interactions and pulse indicator for critical stock` | ანიმაციები |
| 11 | `feat: improve keyboard navigation and focus-visible states` | a11y |
| 12 | `chore: add prettier config and format script` | Prettier |
| 13 | `style: apply prettier formatting` | ფორმატირება |
| 14 | `fix: ignore db.json in Vite watcher to prevent page reload on save` | ბაგის გასწორება |

**ტიპები:** `feat` ახალი ფუნქციაა · `fix` ბაგის გასწორება · `refactor` კოდის გადაწყობა ქცევის შეცვლის გარეშე · `style` ვიზუალი ან ფორმატირება · `chore` კონფიგურაცია · `docs` დოკუმენტაცია.

ისტორიის სანახავად: `git log --oneline`
