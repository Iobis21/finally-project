const GEORGIAN = /^[\u10D0-\u10FF]/

// დასახელებით დალაგება — ერთნაირად ყველა ბრაუზერში.
// localeCompare(b, 'ka') Chrome-ში ქართულ წესებს ვერ პოულობს და en-GB-ზე გადადის (ლათინური წინ),
// Edge-ში კი ქართული წინაა. ამიტომ ჯერ ქართული სახელები (ანბანის მიხედვით), მერე დანარჩენი.
export function compareNames(a: string, b: string) {
  const aGeorgian = GEORGIAN.test(a)
  const bGeorgian = GEORGIAN.test(b)
  if (aGeorgian !== bGeorgian) return aGeorgian ? -1 : 1

  // მხედრული ასოები Unicode-ში ანბანის რიგითაა, ამიტომ 'en' წესი ქართულსაც სწორად ალაგებს
  return a.localeCompare(b, 'en', { numeric: true, sensitivity: 'base' })
}
