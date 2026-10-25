// ErrorBoundary-ის შესამოწმებლად: გახსენით /?crash — კომპონენტი ერთხელ „გატყდება".
// „სცადეთ ხელახლა"-ზე დაჭერის შემდეგ გვერდი ნორმალურად ჩაიტვირთება. მუშაობს მხოლოდ dev რეჟიმში.
let hasCrashed = false

export function maybeCrash(componentName: string) {
  if (!import.meta.env.DEV || hasCrashed) return
  if (!new URLSearchParams(window.location.search).has('crash')) return

  hasCrashed = true
  throw new Error(`სატესტო Runtime შეცდომა კომპონენტში ${componentName}`)
}
