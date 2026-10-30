// ErrorBoundary-ის სადემონსტრაციოდ: გახსენით /?crash — კომპონენტი „გატყდება".
// „სცადეთ ხელახლა" მისამართიდან ?crash-ს აშორებს და გვერდი ნორმალურად ჩაიტვირთება.
// მუშაობს მხოლოდ მაშინ, როცა მისამართში ?crash ხელით არის ჩაწერილი (ონლაინ დემოსთვისაც).
export function maybeCrash(componentName: string) {
  if (!new URLSearchParams(window.location.search).has('crash')) return

  throw new Error(`სატესტო Runtime შეცდომა კომპონენტში ${componentName}`)
}
