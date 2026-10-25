// ErrorBoundary-ის შესამოწმებლად: გახსენით /?crash — კომპონენტი „გატყდება".
// „სცადეთ ხელახლა" მისამართიდან ?crash-ს აშორებს და გვერდი ნორმალურად ჩაიტვირთება.
// მუშაობს მხოლოდ dev რეჟიმში.
export function maybeCrash(componentName: string) {
  if (!import.meta.env.DEV) return
  if (!new URLSearchParams(window.location.search).has('crash')) return

  throw new Error(`სატესტო Runtime შეცდომა კომპონენტში ${componentName}`)
}
