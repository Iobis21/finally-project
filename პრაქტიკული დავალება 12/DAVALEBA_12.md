# პრაქტიკული დავალება 12 — ინტერაქციის ანალიზი, მიკრო-ინტერაქციები და ოპტიმიზაცია

**პროექტი:** WMS · **მოდული:** მარაგების მართვა (`/inventory` და მთავარი გვერდი)

---

## ეტაპი 1: ინტერაქციის ანალიზი

### მიკრო-ინტერაქცია 1: კრიტიკული მარაგის პულსირებადი წერტილი 🔴

| ფაზა | აღწერა |
|---|---|
| **Trigger** | სისტემური: ნივთის რაოდენობა (`quantity`) ჩამოვიდა მინიმუმზე (`minQuantity`) ქვემოთ ან გახდა 0 |
| **Rules** | `getStockStatus()` ამოწმებს რაოდენობას. თუ შედეგია `low_stock` ან `out_of_stock`, სტატუსის ნიშანს ემატება წერტილი |
| **Feedback** | წითელი წერტილი, რომლის გარშემოც ტალღა ფართოვდება და ქრება (`transform: scale` + `opacity`), ნიშნის ტექსტია „კრიტიკული“ ან „ამოწურულია“ |
| **Loops / Modes** | **უწყვეტი ციკლი** (`infinite`), სანამ მარაგი არ შეივსება. მარაგის შევსებისას წერტილი ქრება და მდგომარეობა იცვლება კრიტიკულიდან ნორმალურზე |

### მიკრო-ინტერაქცია 2: ბარათის აწევა (Hover / Focus)

| ფაზა | აღწერა |
|---|---|
| **Trigger** | მაუსის მიტანა პროდუქტის ან სტატისტიკის ბარათზე, ან მასზე Tab-ით გადასვლა |
| **Rules** | ბარათს `.lift` კლასი აქვს. `:hover` და `:focus-within` ცვლის transform-ს და ჩრდილის opacity-ს |
| **Feedback** | ბარათი 4px-ით აიწევა (`translateY(-4px)`) და გაუჩნდება რბილი ჩრდილი (0.2 წამი) |
| **Loops / Modes** | **ერთჯერადი**: მაუსის მოშორებისას უკან ბრუნდება. მდგომარეობას არ ცვლის |

### მიკრო-ინტერაქცია 3: ნივთის წაშლა (დადასტურებით)

| ფაზა | აღწერა |
|---|---|
| **Trigger** | 🗑 ღილაკზე დაჭერა ცხრილის რიგში ან Tab + Enter |
| **Rules** | Event Delegation პოულობს `data-action="delete"`-ს და `data-id`-ს, იხსნება დადასტურების მოდალი. „წაშლა“-ზე იგზავნება `DELETE /items/:id` და ნივთი state-იდან იშლება |
| **Feedback** | ღილაკი hover-ზე წითლდება, დაჭერისას პატარავდება (`scale(0.96)`). მოდალი შემოდის ქვემოდან (`translateY` + `opacity`), ღილაკზე წერია „ინახება...“, ბოლოს რიგი ცხრილიდან ქრება |
| **Loops / Modes** | **ერთჯერადი** მოქმედება, მაგრამ ცვლის მონაცემებს: ნივთი სამუდამოდ იშლება და მრიცხველი („ნაჩვენებია X / Y“) მცირდება |

### მიკრო-ინტერაქცია 4 (დამატებით): ცოცხალი ძებნა

| ფაზა | აღწერა |
|---|---|
| **Trigger** | ძებნის ველში ბეჭდვა |
| **Rules** | Debounce: ძებნა იწყება ბეჭდვის შეწყვეტიდან 300ms-ში |
| **Feedback** | ცხრილი იფილტრება, მრიცხველი ახლდება. თუ ვერაფერი მოიძებნა, ჩანს „ნივთი ვერ მოიძებნა“ |
| **Loops / Modes** | იმეორებს ყოველ ახალ შეყვანაზე. „ფილტრების გასუფთავება“ საწყის მდგომარეობას აბრუნებს |

---

## ეტაპი 2: CSS მიკრო-ინტერაქციები (GPU)

**ფაილი:** [index.css](../wms-app/src/index.css), სექცია „მიკრო-ინტერაქციები“

ყველა ანიმაცია იყენებს **მხოლოდ `transform`-ს და `opacity`-ს**. ამ ორ თვისებას ბრაუზერი GPU-ზე ამუშავებს და გვერდის ხელახალი განლაგება (Layout / Reflow) არ ხდება.

### 1. Interactive Cards: `.lift`

```css
.lift { transition: transform 0.2s ease; }
.lift::after {                       /* ჩრდილი ცალკე ფენაზე */
  box-shadow: 0 12px 24px rgb(15 23 42 / 0.12);
  opacity: 0;
  transition: opacity 0.2s ease;
}
.lift:hover { transform: translateY(-4px); }
.lift:hover::after { opacity: 1; }
```

**ხრიკი:** `box-shadow`-ის ანიმაცია ნელია, რადგან ყოველ კადრზე ხელახლა იხატება. ამიტომ ჩრდილი წინასწარაა დახატული `::after`-ზე და ანიმაციით მხოლოდ მისი **opacity** იცვლება.

**სად:** პროდუქტის ბარათი, სტატისტიკის ბარათი, მარაგების ბარათი (მობილური). ღილაკები დაჭერისას: `transform: scale(0.96)`.

### 2. Pulse ინდიკატორი: კრიტიკული მარაგი

```css
.pulse-dot::after {
  animation: pulse 1.5s ease-out infinite;
}
@keyframes pulse {
  from { transform: scale(1);   opacity: 0.7; }
  to   { transform: scale(2.8); opacity: 0; }
}
```

**სად:** [StatusBadge.tsx](../wms-app/src/components/StatusBadge/StatusBadge.tsx) — „კრიტიკული“ და „ამოწურულია“ სტატუსის გვერდით.

**დამატებით:** ვისაც სისტემაში ანიმაციები გამორთული აქვს (`prefers-reduced-motion`), ანიმაციები მასთან არ ჩაირთვება.

---

## ეტაპი 3: JavaScript ოპტიმიზაცია

### 1. Debounce ძებნაზე

**ფაილები:** [useDebounce.ts](../wms-app/src/hooks/useDebounce.ts), [useInventoryFilters.ts](../wms-app/src/hooks/useInventoryFilters.ts)

```ts
export function useDebounce<T>(value: T, delay = 300): T {
  const [debouncedValue, setDebouncedValue] = useState(value)
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay)
    return () => clearTimeout(timer)   // ახალი ასო → ძველი ტაიმერი უქმდება
  }, [value, delay])
  return debouncedValue
}
```

- ველში ტექსტი **მაშინვე** ჩანს (`search`);
- ფილტრაცია იყენებს `debouncedSearch`-ს და იწყება მხოლოდ მაშინ, როცა მომხმარებელი **300ms** ბეჭდვას შეწყვეტს;
- „ლეპტოპი“ რომ აკრიფო, 7 ძებნის ნაცვლად ერთი ძებნა გაეშვება.

**შემოწმებულია:** „ლეპ“-ის აკრეფისთანავე ცხრილში ისევ 12 ნივთი იყო, 450ms-ის შემდეგ კი 1.

### 2. Event Delegation ცხრილზე

**ფაილები:** [useEventDelegation.ts](../wms-app/src/hooks/useEventDelegation.ts), [InventoryTable.tsx](../wms-app/src/pages/inventory/components/InventoryTable.tsx), [RowActions.tsx](../wms-app/src/pages/inventory/components/RowActions.tsx)

```ts
// ერთი მსმენელი მთელ <table>-ზე
container.addEventListener('click', (event) => {
  const button = event.target.closest('[data-action]')   // რომელ ღილაკს დააჭირეს?
  if (!button) return
  onAction(button.dataset.action, Number(button.dataset.id)) // "edit" / "delete" + id
})
```

```tsx
<button data-action="edit" data-id={item.id}>✏️</button>
<button data-action="delete" data-id={item.id}>🗑</button>
```

- 12 ნივთი × 2 ღილაკი = 24 მსმენლის ნაცვლად გვაქვს **1 მსმენელი** `<table>`-ზე (და 1 ბარათების `<ul>`-ზე);
- ახალი ნივთის დამატებისას ახალი მსმენელი არ სჭირდება, მშობელი უკვე უსმენს;
- `event.target.closest()` იკონაზე (svg) დაჭერისასაც პოულობს ღილაკს.

---

## ეტაპი 4: ხელმისაწვდომობა (a11y)

### 1. კლავიატურით ნავიგაცია

| ელემენტი | კლავიატურა |
|---|---|
| მენიუ, ღილაკები, ✏️/🗑, სორტირება | Tab ან Shift+Tab, შემდეგ Enter ან Space |
| პროდუქტის ბარათი | `tabIndex={0}`, Tab-ით ფოკუსდება და აიწევა (`:focus-within`) |
| მოდალი | გახსნისას ფოკუსი პირველ ველზე გადადის, **Esc** ხურავს, დახურვისას ფოკუსი ღილაკზე ბრუნდება |
| პროფილის მენიუ | Enter ხსნის, **Esc** ან გარეთ დაჭერა ხურავს |
| მობილური მენიუ | ☰ ხსნის, **Esc** ხურავს |

### 2. Focus Management: `:focus-visible`

```css
.sidebar__link:focus-visible,
.row-actions__btn:focus-visible,
.inventory__sort:focus-visible,
.btn:focus-visible /* ... */ {
  outline: 3px solid var(--color-primary-500);
  outline-offset: 2px;
}
```

- `:focus-visible` ჩანს **მხოლოდ კლავიატურით** ნავიგაციისას, მაუსით დაჭერისას არა;
- ლურჯი ჩარჩო 3px სისქისაა და ყველა ფონზე კარგად ჩანს;
- იკონა-ღილაკებს აქვთ `aria-label`, მაგალითად „წაშლა: ლეპტოპი Lenovo“;
- ფორმის ველებს აქვთ `aria-invalid` და `aria-describedby`, ამიტომ ეკრანის წამკითხველი შეცდომას კითხულობს.

---

## ჩასაბარებელი

| რა | სად |
|---|---|
| ინტერაქციის ანალიზი | ეს დოკუმენტი (ეტაპი 1) |
| კოდი: CSS ანიმაციები, Debounce, Event Delegation | https://github.com/Iobis21/finally-project → `wms-app/src/` |
