import { useEffect, useState, type FormEvent } from 'react'
import { AlertTriangle, Send } from 'lucide-react'
import Button from '../../components/ui/Button/Button'
import { ErrorState, SkeletonGrid } from '../../components/Loader/Loader'
import { roles } from '../../config/roles'
import { useAuth } from '../../context/AuthContext'
import { useFetch } from '../../hooks/useFetch'
import { createMessage, getLastSeen, getMessages, markSeen } from '../../services/messageService'
import type { Message } from '../../types'
import '../operations/Operations.css'
import './MessagesPage.css'

const MAX = 500 // შეტყობინების მაქსიმალური სიგრძე

const initials = (name: string) =>
  name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)

function timeAgo(iso: string) {
  const minutes = Math.round((Date.now() - +new Date(iso)) / 60_000)
  if (minutes < 1) return 'ახლახან'
  if (minutes < 60) return `${minutes} წუთის წინ`
  if (minutes < 60 * 24) return `${Math.round(minutes / 60)} საათის წინ`
  return new Date(iso).toLocaleString('ka-GE', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

// შეტყობინებები: ყველა თანამშრომელი წერს და კითხულობს (მაგ. „ქაღალდი ამოიწურა", „ხვალ ინვენტარიზაციაა")
function MessagesPage() {
  const { user } = useAuth()
  const messages = useFetch<Message>(getMessages, 'შეტყობინებები ვერ ჩაიტვირთა.')
  const [text, setText] = useState('')
  const [important, setImportant] = useState(false)
  const [filter, setFilter] = useState<'all' | 'important' | 'mine'>('all')
  const [error, setError] = useState<string | null>(null)
  const [isSending, setIsSending] = useState(false)
  // გვერდის გახსნის მომენტამდე წაუკითხავი — „ახალი" ნიშნისთვის
  const [seenBefore] = useState(() => (user ? getLastSeen(user.id) : ''))

  // გვერდი გაიხსნა — ყველა შეტყობინება წაკითხულად ითვლება
  useEffect(() => {
    if (user) markSeen(user.id)
  }, [user])

  async function send(e: FormEvent) {
    e.preventDefault()
    if (!user) return
    if (!text.trim()) {
      setError('დაწერეთ შეტყობინების ტექსტი')
      return
    }
    setIsSending(true)
    setError(null)
    try {
      const message = await createMessage({
        userId: user.id,
        name: `${user.firstName} ${user.lastName}`,
        role: user.role,
        text: text.trim(),
        priority: important ? 'important' : 'normal',
        createdAt: new Date().toISOString(),
      })
      messages.setData((prev) => [...prev, message])
      markSeen(user.id)
      setText('')
      setImportant(false)
    } catch {
      setError('შეტყობინება ვერ გაიგზავნა — სცადეთ ხელახლა')
    } finally {
      setIsSending(false)
    }
  }

  if (messages.isLoading) return <SkeletonGrid count={3} />
  if (messages.error) return <ErrorState message={messages.error} onRetry={messages.reload} />

  const list = [...messages.data]
    .filter(
      (m) =>
        filter === 'all' ||
        (filter === 'important' ? m.priority === 'important' : m.userId === user?.id),
    )
    .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))
  const importantCount = messages.data.filter((m) => m.priority === 'important').length

  return (
    <>
      <div className="ops__header">
        <div>
          <h1>შეტყობინებები</h1>
          <p className="ops__hint">
            თანამშრომლების გზავნილები — ყველა ხედავს, ყველას შეუძლია დაწეროს
          </p>
        </div>
      </div>

      <form className="ops__card messages__compose" onSubmit={send} noValidate>
        <span className="messages__avatar messages__avatar--me" aria-hidden="true">
          {user ? initials(`${user.firstName} ${user.lastName}`) : '?'}
        </span>
        <div className="messages__compose-body">
          <label htmlFor="message-text" className="sr-only">
            შეტყობინების ტექსტი
          </label>
          <textarea
            id="message-text"
            className="input messages__textarea"
            placeholder="დაწერეთ შეტყობინება კოლეგებისთვის…"
            rows={3}
            maxLength={MAX}
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          {error && (
            <p className="ops__error" role="alert">
              {error}
            </p>
          )}
          <div className="messages__compose-footer">
            <label className="messages__important">
              <input
                type="checkbox"
                checked={important}
                onChange={(e) => setImportant(e.target.checked)}
              />
              <AlertTriangle size={16} aria-hidden="true" /> მნიშვნელოვანი
            </label>
            <span className="messages__counter">
              {text.length} / {MAX}
            </span>
            <Button type="submit" className="ops__btn" isLoading={isSending}>
              <Send size={16} aria-hidden="true" /> გაგზავნა
            </Button>
          </div>
        </div>
      </form>

      <div className="ops__tabs" role="group" aria-label="ფილტრი">
        <button
          className="btn-secondary ops__tab"
          aria-pressed={filter === 'all'}
          onClick={() => setFilter('all')}
        >
          ყველა ({messages.data.length})
        </button>
        <button
          className="btn-secondary ops__tab"
          aria-pressed={filter === 'important'}
          onClick={() => setFilter('important')}
        >
          მნიშვნელოვანი ({importantCount})
        </button>
        <button
          className="btn-secondary ops__tab"
          aria-pressed={filter === 'mine'}
          onClick={() => setFilter('mine')}
        >
          ჩემი
        </button>
      </div>

      {list.length === 0 ? (
        <p className="ops__card ops__empty">შეტყობინება არ არის</p>
      ) : (
        <ul className="messages__list">
          {list.map((m) => {
            const isNew = m.userId !== user?.id && m.createdAt > seenBefore
            return (
              <li
                key={m.id}
                className={`ops__card messages__item ${m.priority === 'important' ? 'messages__item--important' : ''}`}
              >
                <span className={`messages__avatar messages__avatar--${m.role}`} aria-hidden="true">
                  {initials(m.name)}
                </span>
                <div className="messages__body">
                  <div className="messages__head">
                    <strong>{m.name}</strong>
                    <span className="messages__role">{roles[m.role]?.label}</span>
                    {m.priority === 'important' && (
                      <span className="badge-danger">მნიშვნელოვანი</span>
                    )}
                    {isNew && <span className="badge-info">ახალი</span>}
                    <time className="messages__time" dateTime={m.createdAt}>
                      {timeAgo(m.createdAt)}
                    </time>
                  </div>
                  <p className="messages__text">{m.text}</p>
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </>
  )
}

export default MessagesPage
