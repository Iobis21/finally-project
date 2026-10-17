import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { categories, itemSchema, type ItemForm as ItemFormValues } from '../../schemas/item.schema'
import Button from '../ui/Button/Button'
import FormField from './FormField'
import './ItemForm.css'

interface ItemFormProps {
  initialValues?: ItemFormValues // რედაქტირებისას — არსებული მონაცემები
  onSubmit: (values: ItemFormValues) => Promise<void>
  onCancel: () => void
}

const emptyValues: ItemFormValues = {
  name: '',
  sku: '',
  barcode: '',
  category: '',
  quantity: 0,
  minQuantity: 1,
  price: 0,
  location: '',
}

function ItemForm({ initialValues, onSubmit, onCancel }: ItemFormProps) {
  const [serverError, setServerError] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ItemFormValues>({
    resolver: zodResolver(itemSchema),
    defaultValues: initialValues ?? emptyValues,
    mode: 'onTouched', // შეცდომა ჩანს ველიდან გასვლისას, მერე — ყოველ ცვლილებაზე
  })

  async function submit(values: ItemFormValues) {
    setServerError(null)
    try {
      await onSubmit(values)
    } catch {
      setServerError('შენახვა ვერ მოხერხდა. სცადეთ თავიდან.')
    }
  }

  return (
    <form className="item-form" onSubmit={handleSubmit(submit)} noValidate>
      <FormField label="დასახელება" error={errors.name?.message} full>
        <input className="input" {...register('name')} placeholder="მაგ. ლეპტოპი Lenovo" />
      </FormField>

      <FormField label="SKU" error={errors.sku?.message}>
        <input className="input" {...register('sku')} placeholder="LAP-001" />
      </FormField>

      <FormField label="შტრიხკოდი" error={errors.barcode?.message}>
        <input
          className="input"
          {...register('barcode')}
          inputMode="numeric"
          placeholder="13 ციფრი"
        />
      </FormField>

      <FormField label="კატეგორია" error={errors.category?.message}>
        <select className="input" {...register('category')}>
          <option value="">აირჩიეთ...</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </FormField>

      <FormField label="თარო" error={errors.location?.message}>
        <input className="input" {...register('location')} placeholder="A-01-03" />
      </FormField>

      <FormField label="რაოდენობა" error={errors.quantity?.message}>
        <input className="input" type="number" {...register('quantity', { valueAsNumber: true })} />
      </FormField>

      <FormField label="მინ. რაოდენობა" error={errors.minQuantity?.message}>
        <input
          className="input"
          type="number"
          {...register('minQuantity', { valueAsNumber: true })}
        />
      </FormField>

      <FormField label="ფასი (₾)" error={errors.price?.message}>
        <input
          className="input"
          type="number"
          step="0.01"
          {...register('price', { valueAsNumber: true })}
        />
      </FormField>

      {serverError && (
        <p className="item-form__server-error" role="alert">
          {serverError}
        </p>
      )}

      <div className="item-form__actions">
        <Button type="button" variant="secondary" onClick={onCancel}>
          გაუქმება
        </Button>
        <Button type="submit" isLoading={isSubmitting}>
          შენახვა
        </Button>
      </div>
    </form>
  )
}

export default ItemForm
