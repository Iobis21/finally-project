import { cloneElement, useId, type ReactElement } from 'react'
import './FormField.css'

interface FormFieldProps {
  label: string
  error?: string
  full?: boolean // მთელ სიგანეზე
  required?: boolean
  children: ReactElement<Record<string, unknown>>
}

// ერთი ველი: ლეიბლი + input + შეცდომის ტექსტი (DRY — არ ვიმეორებთ ყველა ველზე)
function FormField({ label, error, full, required = true, children }: FormFieldProps) {
  const id = useId()
  const errorId = `${id}-error`

  return (
    <div className={`form-field ${full ? 'form-field--full' : ''}`}>
      <label htmlFor={id} className="form-field__label">
        {label} {required && <span aria-hidden="true">*</span>}
      </label>
      {cloneElement(children, {
        id,
        'aria-invalid': !!error,
        'aria-describedby': error ? errorId : undefined,
      })}
      {error && (
        <p id={errorId} className="form-field__error">
          {error}
        </p>
      )}
    </div>
  )
}

export default FormField
