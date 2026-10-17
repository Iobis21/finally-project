import { Pencil, Trash2 } from 'lucide-react'

// რედაქტირება / წაშლა — ღილაკებს არ აქვთ საკუთარი onClick:
// დაჭერას იჭერს მშობელი (Event Delegation) data-action და data-id ატრიბუტებით
function RowActions({ id, name }: { id: number; name: string }) {
  return (
    <div className="row-actions">
      <button
        className="row-actions__btn"
        data-action="edit"
        data-id={id}
        aria-label={`რედაქტირება: ${name}`}
      >
        <Pencil size={16} aria-hidden="true" />
      </button>
      <button
        className="row-actions__btn row-actions__btn--danger"
        data-action="delete"
        data-id={id}
        aria-label={`წაშლა: ${name}`}
      >
        <Trash2 size={16} aria-hidden="true" />
      </button>
    </div>
  )
}

export default RowActions
