import { PackageMinus, Pencil, Trash2 } from 'lucide-react'

interface RowActionsProps {
  id: number
  name: string
  canEdit: boolean // რედაქტირება / წაშლა
  canWriteOff: boolean // ჩამოწერა
}

// ღილაკებს არ აქვთ საკუთარი onClick:
// დაჭერას იჭერს მშობელი (Event Delegation) data-action და data-id ატრიბუტებით
function RowActions({ id, name, canEdit, canWriteOff }: RowActionsProps) {
  return (
    <div className="row-actions">
      {canWriteOff && (
        <button
          className="row-actions__btn"
          data-action="writeoff"
          data-id={id}
          aria-label={`ჩამოწერა: ${name}`}
          title="ჩამოწერა"
        >
          <PackageMinus size={16} aria-hidden="true" />
        </button>
      )}
      {canEdit && (
        <>
          <button
            className="row-actions__btn"
            data-action="edit"
            data-id={id}
            aria-label={`რედაქტირება: ${name}`}
            title="რედაქტირება"
          >
            <Pencil size={16} aria-hidden="true" />
          </button>
          <button
            className="row-actions__btn row-actions__btn--danger"
            data-action="delete"
            data-id={id}
            aria-label={`წაშლა: ${name}`}
            title="წაშლა"
          >
            <Trash2 size={16} aria-hidden="true" />
          </button>
        </>
      )}
    </div>
  )
}

export default RowActions
