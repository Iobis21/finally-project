import { useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  createWriteOffSchema,
  writeOffReasons,
  type WriteOffForm as WriteOffValues,
} from '../../schemas/writeOff.schema'
import type { Item } from '../../types'
import FormField from '../FormField/FormField'
import Button from '../ui/Button/Button'
import './WriteOffForm.css'

interface WriteOffFormProps {
  item: Item
  onSubmit: (values: WriteOffValues) => Promise<void>
  onCancel: () => void
}

// ჩამოწერის ფორმა — უარყოფითი ნაშთისგან დაცვით
function WriteOffForm({ item, onSubmit, onCancel }: WriteOffFormProps) {
  const [serverError, setServerError] = useState<string | null>(null)
  const schema = useMemo(() => createWriteOffSchema(item.quantity), [item.quantity])
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<WriteOffValues>({ resolver: zodResolver(schema), mode: 'onChange' })

  const amount = watch('amount')
  const remaining = Number.isFinite(amount) ? item.quantity - amount : item.quantity

  async function submit(values: WriteOffValues) {
    setServerError(null)
    try {
      await onSubmit(values)
    } catch (error) {
      setServerError(error instanceof Error ? error.message : 'ჩამოწერა ვერ მოხერხდა')
    }
  }

  return (
    <form className="write-off" onSubmit={handleSubmit(submit)} noValidate>
      <p className="write-off__stock">
        <strong>{item.name}</strong> — ნაშთში: <strong>{item.quantity}</strong> ცალი
      </p>

      <FormField label="ჩამოსაწერი რაოდენობა" error={errors.amount?.message}>
        <input
          className="input"
          type="number"
          min={1}
          max={item.quantity}
          {...register('amount', { valueAsNumber: true })}
        />
      </FormField>

      <FormField label="მიზეზი" error={errors.reason?.message}>
        <select className="input" {...register('reason')}>
          <option value="">აირჩიეთ...</option>
          {Object.entries(writeOffReasons).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </FormField>

      <p className={`write-off__remaining ${remaining < 0 ? 'write-off__remaining--bad' : ''}`}>
        დარჩება: <strong>{remaining}</strong> ცალი
      </p>

      {serverError && (
        <p className="write-off__error" role="alert">
          {serverError}
        </p>
      )}

      <div className="write-off__actions">
        <Button type="button" variant="secondary" onClick={onCancel}>
          გაუქმება
        </Button>
        {/* isSubmitting-ის დროს ღილაკი disabled-ია — ორმაგი დაჭერა ორჯერ ვერ ჩამოწერს */}
        <Button type="submit" variant="danger" isLoading={isSubmitting}>
          ჩამოწერა
        </Button>
      </div>
    </form>
  )
}

export default WriteOffForm
