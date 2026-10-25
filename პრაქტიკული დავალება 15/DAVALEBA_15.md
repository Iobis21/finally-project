# პრაქტიკული დავალება 15 — დიაგნოსტიკა, Debugging და მდგრადი არქიტექტურა

**პროექტი:** WMS · **კოდი:** [wms-app/src/](../wms-app/src/)

---

## 1. React Error Boundary — UI-ის დაცვა

**ფაილები:** [ErrorBoundary.tsx](../wms-app/src/components/ErrorBoundary/ErrorBoundary.tsx), [Layout.tsx](../wms-app/src/components/Layout/Layout.tsx)

```tsx
<main className="layout__main">
  <ErrorBoundary resetKey={location.pathname} onReset={() => navigate(location.pathname)}>
    <Outlet />   {/* ყველა გვერდი */}
  </ErrorBoundary>
</main>
```

- თუ რომელიმე გვერდი Runtime შეცდომას დააგდებს, **თეთრი ეკრანი არ ჩნდება**. ჩანს ბარათი „რაღაც შეცდომა მოხდა“ და ღილაკი **„სცადეთ ხელახლა“**;
- Header და მენიუ ბოუნდარის გარეთაა, ამიტომ ისინი შეცდომის დროსაც მუშაობს და მომხმარებელს სხვა გვერდზე გადასვლა შეუძლია;
- სხვა გვერდზე გადასვლისას შეცდომა თავისით ქრება (`resetKey`);
- `componentDidCatch` შეცდომას კონსოლში წერს. რეალურ პროექტში აქედან Sentry-ში გაიგზავნებოდა.

**როგორ შევამოწმო:** dev რეჟიმში გახსენი `http://localhost:5173/?crash`. `DashboardPage` სპეციალურად „გატყდება“, შემდეგ დააჭირე „სცადეთ ხელახლა“-ს.

---

## 2. DevTools და Debugger

### console.table() და console.time()

**ფაილი:** [useItems.ts](../wms-app/src/hooks/useItems.ts)

```ts
const timerLabel = `⏱ items:load #${requestId}`
console.time(timerLabel)              // სტარტი
const data = await getItems()
console.table(data.map(({ sku, name, quantity, minQuantity }) => ({ sku, name, quantity, minQuantity })))
console.timeEnd(timerLabel)           // → "⏱ items:load #1: 32.3 ms"
```

- `console.table` ნივთებს კონსოლში ცხრილად აჩვენებს: SKU, სახელი, რაოდენობა, მინიმუმი;
- `console.time` ზომავს, რამდენ ხანს იტვირთება მონაცემები (ჩვენთან დაახლოებით 20–60 ms);
- ორივე ჩანს მხოლოდ dev რეჟიმში.

### Breakpoint-ის სქრინი

1. გაუშვი `npm run dev` და გახსენი Chrome → **F12** → **Sources**;
2. **Ctrl+P** → ჩაწერე `useItems.ts`;
3. დააჭირე ხაზის ნომერს `const data = await getItems()`-ის ქვემოთ, ანუ `if (requestId !== ...)` ხაზს. გამოჩნდება ლურჯი ნიშანი (Breakpoint);
4. დაარეფრეშე გვერდი (F5). კოდი გაჩერდება;
5. მარჯვნივ ჩანს **Call Stack**, **Scope** (`data`, `requestId`) და **Watch**. Watch-ში დაამატე `data.length`;
6. გადაიღე სქრინი: `screenshots/devtools-breakpoint.png`.

---

## 3. ოფლაინ / API Fallback

**ფაილები:** [itemCache.ts](../wms-app/src/services/itemCache.ts), [useItems.ts](../wms-app/src/hooks/useItems.ts), [OfflineBanner.tsx](../wms-app/src/components/OfflineBanner/OfflineBanner.tsx)

```
სერვერი მუშაობს  → მონაცემები სერვერიდან + ქეშში შენახვა (localStorage)
სერვერი გაითიშა  → 1) ბოლო ქეში  2) თუ არ არის — დემო მონაცემები (fallbackItems.ts)
                   + ბანერი „⚠ ნაჩვენებია ლოკალური ... მონაცემები" + ღილაკი „ხელახლა ცდა"
```

- მუშაობს როგორც სერვერის **500 შეცდომისას**, ისე **ინტერნეტის გაწყვეტისას** (`Failed to fetch`);
- **კრიტიკული მარაგები** ოფლაინშიც ჩანს: მთავარ გვერდზე სტატისტიკა „კრიტიკული მარაგი“ და წითელი პულსირებადი ნიშნები;
- ოფლაინ რეჟიმში **დამატების, რედაქტირებისა და ჩამოწერის ღილაკები იმალება**, რადგან ცვლილება ვერ შეინახება.

**როგორ შევამოწმო:** გაუშვი საიტი, შემდეგ ტერმინალში გააჩერე json-server და დააჭირე F5.

---

## 4. თავდაცვითი პროგრამირება და Race Condition

### Double-Click-ის ბლოკი

```tsx
<Button type="submit" isLoading={isSubmitting}>შენახვა</Button>
// Button: disabled={disabled || isLoading} და ტექსტი „ინახება..."
```

ფორმის გაგზავნისას ღილაკი მაშინვე disabled-ია, ამიტომ ორმაგი დაჭერა ორ მოთხოვნას ვერ გაგზავნის. ასე მუშაობს ყველა ფორმა: ნივთი, ჩამოწერა, წაშლა, შესვლა, რეგისტრაცია.

### WMS: უარყოფითი ნაშთის დაცვა

**ფაილები:** [writeOff.schema.ts](../wms-app/src/schemas/writeOff.schema.ts), [WriteOffForm.tsx](../wms-app/src/components/WriteOffForm/WriteOffForm.tsx)

ახალი ფუნქცია **„ჩამოწერა“** (📦− ღილაკი) დაზიანებული, ვადაგასული ან დაკარგული საქონლისთვის. ხელმისაწვდომია მენეჯერისა და ოპერატორისთვის.

**დაცვის 3 დონე:**

| დონე | რა ხდება |
|---|---|
| 1. **Fail-Fast Zod** (ფრონტენდი) | `z.number().max(stock, "ნაშთში მხოლოდ 4 ერთეულია — მეტს ვერ ჩამოწერთ")`. ფორმა სერვერზე არც კი იგზავნება |
| 2. **ცოცხალი გაფრთხილება** | „დარჩება: −6 ცალი“ წითლად, აკრეფისთანავე |
| 3. **Race Condition-ის შემოწმება** | ჩაწერამდე სერვერიდან ვიღებთ **უახლეს** ნაშთს. თუ სხვა თანამშრომელმა უკვე ჩამოწერა: „ნაშთი შეიცვალა — ახლა მხოლოდ X ერთეულია“ |

```ts
async function writeOffItem(id: number, amount: number) {
  const fresh = await getItem(id)               // უახლესი ნაშთი სერვერიდან
  if (amount > fresh.quantity) throw new Error(`ნაშთი შეიცვალა — ახლა მხოლოდ ${fresh.quantity} ერთეულია`)
  await updateItem(id, { quantity: fresh.quantity - amount })
}
```

### ძველი პასუხის იგნორირება

ყოველ ჩატვირთვას თავისი ნომერი აქვს (`requestId`). თუ ძველი მოთხოვნის პასუხი გვიან მოვიდა, ის ახალ მონაცემებს აღარ გადაფარავს (იხ. ქეისი 2).

---

## 5. დებაგინგის ჟურნალი

### ქეისი 1: ნივთის შენახვისას გვერდი თავიდან იტვირთება

| საფეხური | აღწერა |
|---|---|
| **1. სიმპტომი** | „ახალი ნივთის“ შენახვისას მოდალი იხურება, მაგრამ მთელი გვერდი თავიდან იტვირთება. ავტომატურ ტესტში ჩნდებოდა შეცდომა `Execution context was destroyed, most likely because of a navigation` |
| **2. ჰიპოთეზა** | ა) ფორმა იგზავნება ჩვეულებრივ, HTML-ის წესით (`preventDefault` არ მუშაობს); ბ) რაღაც გვერდს ძალით არეფრეშებს |
| **3. DevTools დიაგნოსტიკა** | **Network** ტაბში `POST /items` → **201**, ანუ მოთხოვნა წარმატებულია. **Console**-ში „Preserve log“ ჩართვის შემდეგ ჩანდა, რომ POST-ის შემდეგ ხდება ახალი navigation და იგზავნება მოთხოვნა `GET /inventory`. ცარიელი ფორმა (ვალიდაციის შეცდომით) გვერდს **არ** არეფრეშებდა, ამიტომ ჰიპოთეზა „ა“ გამოირიცხა |
| **4. Root Cause** | json-server ახალ ნივთს `db.json`-ში წერს. `db.json` პროექტის საქაღალდეშია და **Vite მას უთვალთვალებს**: ფაილის ცვლილებას ხედავს და გვერდს თავიდან ტვირთავს |
| **5. კოდის ფიქსი** | `vite.config.ts`: `server: { watch: { ignored: ['**/db.json'] } }` |
| **6. პრევენცია** | ბექენდის მონაცემთა ფაილი dev სერვერის watcher-ში აღარ ხვდება. CRUD-ის ავტომატური ტესტი (puppeteer) ამოწმებს, რომ დამატების შემდეგ გვერდი თავიდან არ იტვირთება |

### ქეისი 2: `Timer 'items:load' already exists` და ძველი პასუხის გადაფარვა

| საფეხური | აღწერა |
|---|---|
| **1. სიმპტომი** | კონსოლში ყოველ ჩატვირთვაზე ჩნდებოდა ყვითელი გაფრთხილებები: `Timer '⏱ items:load' already exists` და `Timer '⏱ items:load' does not exist`. `console.table` ორჯერ იბეჭდებოდა |
| **2. ჰიპოთეზა** | `load()` ერთდროულად ორჯერ ეშვება და ორივე ერთსა და იმავე ტაიმერს იყენებს |
| **3. DevTools დიაგნოსტიკა** | **Sources** → breakpoint `console.time`-ზე → შეჩერდა **ორჯერ** ზედიზედ. **Call Stack**-ში ორივეჯერ ჩანდა `useEffect` → `load`. **Network**-ში ჩანდა ორი `GET /items` |
| **4. Root Cause** | React-ის **StrictMode** dev რეჟიმში `useEffect`-ს ორჯერ უშვებს. ორი პარალელური მოთხოვნა: 1) ერთ ტაიმერს ეჯახება; 2) რაც უფრო საშიშია, **ნელი ძველი პასუხი ახალს გადაფარავს** (Race Condition). მაგალითად, მომხმარებელი „ხელახლა ცდას“ აჭერს, ძველი მოთხოვნა კი მოგვიანებით ბრუნდება |
| **5. კოდის ფიქსი** | `requestIdRef`: ყოველ მოთხოვნას ნომერი აქვს და პასუხი მიიღება, მხოლოდ თუ ის **ბოლოა** (`if (requestId !== requestIdRef.current) return`). ტაიმერის სახელი უნიკალურია: `⏱ items:load #${requestId}` |
| **6. პრევენცია** | ყველა ასინქრონულ ჩატვირთვაში ძველი პასუხის შემოწმება. კონსოლში ახლა სუფთად ჩანს `items:load #1: 32 ms`, `#2: 61 ms` |

### ქეისი 3 (დამატებით): ErrorBoundary არ ჩანდა სატესტო შეცდომაზე

| საფეხური | აღწერა |
|---|---|
| **1. სიმპტომი** | `/?crash` გახსნისას Fallback UI არ ჩნდებოდა, გვერდი ნორმალურად იტვირთებოდა |
| **2. ჰიპოთეზა** | შეცდომა საერთოდ არ ისროდა, ან ბოუნდარი არასწორ ადგილასაა |
| **3. DevTools დიაგნოსტიკა** | Console-ში შეცდომა **ჩანდა**, ესე იგი ისროდა. breakpoint `throw`-ზე: კომპონენტი რენდერდებოდა **ორჯერ**, ხოლო მეორედ `hasCrashed = true` იყო და აღარ ისროდა |
| **4. Root Cause** | React 19 რენდერის შეცდომისას ერთხელ **ავტომატურად თავიდან ცდის** რენდერს. სატესტო კოდი მხოლოდ ერთხელ ისროდა, ამიტომ მეორე ცდა წარმატებით სრულდებოდა და ბოუნდარი არ ჩანდა |
| **5. კოდის ფიქსი** | შეცდომა ისროლება მანამ, სანამ URL-ში `?crash` წერია. „სცადეთ ხელახლა“ (`onReset`) კი `?crash`-ს URL-იდან აშორებს |
| **6. პრევენცია** | ტესტი მდგომარეობაზეა (URL) და არა ერთჯერად ცვლადზე. ავტომატური ტესტი ამოწმებს: ბოუნდარი ჩანს → Retry → გვერდი ჩაიტვირთა |

---

## სქრინები

| რა | ფაილი |
|---|---|
| Error Boundary | [../პრაქტიკული დავალება 17/screenshots/05-error-boundary.png](../პრაქტიკული%20დავალება%2017/screenshots/05-error-boundary.png) |
| ოფლაინ ბანერი | [05-offline-banner.png](../პრაქტიკული%20დავალება%2017/screenshots/05-offline-banner.png) |
| უარყოფითი ნაშთის დაცვა | [05-writeoff-negative-stock.png](../პრაქტიკული%20დავალება%2017/screenshots/05-writeoff-negative-stock.png) |
| DevTools Breakpoint | შენ უნდა გადაიღო, იხ. 2-ე პუნქტი |
