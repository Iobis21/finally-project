# Backend — json-server

ბექენდად გამოყენებულია **json-server** — ის `db.json` ფაილიდან ავტომატურად ქმნის REST API-ს.

## გაშვება

```bash
npm run dev
```

ეს ერთი ბრძანება ერთად უშვებს ორ სერვერს:

| სერვერი | მისამართი | რა არის |
|---|---|---|
| **web** (Vite) | http://localhost:5173 | საიტი |
| **api** (json-server) | http://localhost:3000 | ბექენდი / მონაცემები |

მხოლოდ ბექენდის გასაშვებად: `npm run server`

## მონაცემები (`db.json`)

| კოლექცია | რა ინახება |
|---|---|
| `items` | პროდუქტები / მარაგები (12) |
| `users` | თანამშრომლები (4 როლი) |
| `vendors` | მომწოდებლები |
| `orders` | შესყიდვის შეკვეთები |
| `shipments` | შემოსული ტვირთები |
| `deliveries` | მიწოდებები |

## ენდფოინთები

| მეთოდი | მისამართი | რას აკეთებს |
|---|---|---|
| GET | `/items` | ყველა ნივთი |
| GET | `/items/1` | ერთი ნივთი |
| GET | `/items?category=ავეჯი` | ფილტრი |
| GET | `/items?q=ლეპტოპი` | ძებნა |
| GET | `/items?_sort=price&_order=desc` | სორტირება |
| GET | `/items?_page=1&_limit=5` | პაგინაცია |
| POST | `/orders` | ახალი შეკვეთა |
| PATCH | `/orders/12` | შეკვეთის სტატუსის შეცვლა |
| PATCH | `/items/2` | რაოდენობის შეცვლა |
| DELETE | `/vendors/3` | წაშლა |

ცვლილებები (`POST`, `PATCH`, `DELETE`) ავტომატურად ინახება `db.json`-ში.

## ფრონტენდთან კავშირი

```
src/api/client.ts      ← fetch-ის საერთო ფუნქციები (apiGet, apiPatch)
src/api/items.api.ts   ← getItems(), getItem(), updateItemQuantity()
src/hooks/useItems.ts  ← წამოღება + isLoading + error
```

გვერდები (`DashboardPage`, `InventoryPage`) იყენებენ `useItems()`-ს:
- **იტვირთება** → ნაცრისფერი Skeleton ბლოკები;
- **შეცდომა** (სერვერი გამორთულია) → შეტყობინება და ღილაკი „თავიდან ცდა";
- **მზადაა** → ცხრილი / კარტები.

## ავტორიზაცია (JWT)

**json-server-auth** ამატებს:

| მეთოდი | მისამართი | რას აკეთებს |
|---|---|---|
| POST | `/register` | რეგისტრაცია — პაროლი იშიფრება (bcrypt), ბრუნდება `accessToken` |
| POST | `/login` | შესვლა — ბრუნდება `accessToken` და `user` (როლით) |
| PATCH | `/users/:id` | როლის შეცვლა / დაბლოკვა (მენეჯერი) |

- ტოკენი ინახება `localStorage`-ში და ყოველ მოთხოვნას ემატება: `Authorization: Bearer <token>`;
- როლები და უფლებები — `src/config/roles.ts`;
- `ProtectedRoute` — შეუსვლელი → `/login`; `RoleRoute` — უფლების გარეშე → 403;
- პროდუქტის დამატება/რედაქტირება/წაშლა — მხოლოდ `manage:items` უფლებით (მენეჯერი).
