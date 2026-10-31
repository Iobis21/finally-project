export interface Warehouse {
  id: string
  name: string
  address: string
  zones: string[] // რომელი ზონის თაროები ეკუთვნის (ლოკაციის პირველი ასო, მაგ. "A-01-03" → A)
  password: string
  x: number // ადგილი რუკაზე (%)
  y: number
}

// სასწავლო პროექტისთვის პაროლები აქ ინახება; რეალურ სისტემაში შემოწმება სერვერზე უნდა მოხდეს
export const warehouses: Warehouse[] = [
  {
    id: 'tbilisi',
    name: 'თბილისის საწყობი',
    address: 'თბილისი, ვაჟა-ფშაველას 71',
    zones: ['A'],
    password: '1111',
    x: 75,
    y: 55,
  },
  {
    id: 'kutaisi',
    name: 'ქუთაისის საწყობი',
    address: 'ქუთაისი, ჭავჭავაძის 15',
    zones: ['B'],
    password: '2222',
    x: 45,
    y: 35,
  },
  {
    id: 'batumi',
    name: 'ბათუმის საწყობი',
    address: 'ბათუმი, გორგილაძის 30',
    zones: ['C', 'D'],
    password: '3333',
    x: 22,
    y: 72,
  },
]
