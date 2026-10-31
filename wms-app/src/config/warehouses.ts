export interface Warehouse {
  id: string
  name: string
  address: string
  zones: string[] // რომელი ზონის თაროები ეკუთვნის (ლოკაციის პირველი ასო, მაგ. "A-01-03" → A)
  password: string
  lat: number // კოორდინატები რეალურ რუკაზე
  lng: number
}

// სასწავლო პროექტისთვის პაროლები აქ ინახება; რეალურ სისტემაში შემოწმება სერვერზე უნდა მოხდეს
export const warehouses: Warehouse[] = [
  {
    id: 'tbilisi',
    name: 'თბილისის საწყობი',
    address: 'თბილისი, ვაჟა-ფშაველას 71',
    zones: ['A'],
    password: '1111',
    lat: 41.7255,
    lng: 44.7275,
  },
  {
    id: 'kutaisi',
    name: 'ქუთაისის საწყობი',
    address: 'ქუთაისი, ჭავჭავაძის 15',
    zones: ['B'],
    password: '2222',
    lat: 42.2679,
    lng: 42.6946,
  },
  {
    id: 'batumi',
    name: 'ბათუმის საწყობი',
    address: 'ბათუმი, გორგილაძის 30',
    zones: ['C', 'D'],
    password: '3333',
    lat: 41.6461,
    lng: 41.6405,
  },
]
