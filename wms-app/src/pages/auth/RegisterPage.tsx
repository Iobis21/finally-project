import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useNavigate } from 'react-router'
import FormField from '../../components/FormField/FormField'
import Button from '../../components/ui/Button/Button'
import { DEFAULT_ROLE } from '../../config/roles'
import { useAuth } from '../../context/AuthContext'
import { ApiError } from '../../services/apiClient'
import { registerSchema, type RegisterForm } from '../../schemas/auth.schema'
import AuthLayout from './AuthLayout'

// პაროლის ცოცხალი ჩეკლისტი
const passwordRules = [
  { label: 'მინიმუმ 8 სიმბოლო', test: (v: string) => v.length >= 8 },
  { label: 'შეიცავს ციფრს', test: (v: string) => /\d/.test(v) },
  { label: 'შეიცავს სიმბოლოს (!@#$...)', test: (v: string) => /[^A-Za-z0-9]/.test(v) },
]

function RegisterPage() {
  const { register: registerUser } = useAuth()
  const navigate = useNavigate()
  const [serverError, setServerError] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    mode: 'onTouched',
    defaultValues: { userType: 'individual' },
  })

  const password = watch('password') ?? ''
  const userType = watch('userType')

  async function onSubmit(values: RegisterForm) {
    setServerError(null)
    try {
      await registerUser({
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
        phone: values.phone || undefined,
        password: values.password,
        userType: values.userType,
        companyName: values.userType === 'company' ? values.companyName : undefined,
        role: DEFAULT_ROLE, // როლს მენეჯერი შეცვლის
      })
      navigate('/', { replace: true })
    } catch (error) {
      setServerError(
        error instanceof ApiError && error.message.includes('exists')
          ? 'ეს ელ-ფოსტა უკვე დარეგისტრირებულია'
          : 'რეგისტრაცია ვერ მოხერხდა. სცადეთ თავიდან.',
      )
    }
  }

  return (
    <AuthLayout title="რეგისტრაცია">
      <form
        className="auth__form auth__form--two-cols"
        onSubmit={handleSubmit(onSubmit)}
        noValidate
      >
        <FormField label="სახელი" error={errors.firstName?.message}>
          <input className="input" autoComplete="given-name" {...register('firstName')} />
        </FormField>

        <FormField label="გვარი" error={errors.lastName?.message}>
          <input className="input" autoComplete="family-name" {...register('lastName')} />
        </FormField>

        <FormField label="ელ-ფოსტა" error={errors.email?.message} full>
          <input className="input" type="email" autoComplete="email" {...register('email')} />
        </FormField>

        <FormField label="ტელეფონი" error={errors.phone?.message} required={false} full>
          <input
            className="input"
            type="tel"
            placeholder="+995 5XX XXX XXX"
            {...register('phone')}
          />
        </FormField>

        <fieldset className="form-field form-field--full">
          <legend className="form-field__label">მომხმარებლის ტიპი</legend>
          <div className="auth__radio-group">
            <label className="auth__radio">
              <input type="radio" value="individual" {...register('userType')} /> ფიზიკური პირი
            </label>
            <label className="auth__radio">
              <input type="radio" value="company" {...register('userType')} /> კომპანია
            </label>
          </div>
        </fieldset>

        {userType === 'company' && (
          <FormField label="კომპანიის სახელი" error={errors.companyName?.message} full>
            <input className="input" {...register('companyName')} />
          </FormField>
        )}

        <FormField label="პაროლი" error={errors.password?.message}>
          <input
            className="input"
            type="password"
            autoComplete="new-password"
            {...register('password')}
          />
        </FormField>

        <FormField label="გაიმეორეთ პაროლი" error={errors.confirmPassword?.message}>
          <input
            className="input"
            type="password"
            autoComplete="new-password"
            {...register('confirmPassword')}
          />
        </FormField>

        <ul className="auth__password-rules form-field--full" aria-label="პაროლის მოთხოვნები">
          {passwordRules.map((rule) => {
            const ok = rule.test(password)
            return (
              <li key={rule.label} className={ok ? 'is-ok' : ''}>
                {ok ? '✓' : '○'} {rule.label}
              </li>
            )
          })}
        </ul>

        {serverError && (
          <p className="auth__error" role="alert">
            {serverError}
          </p>
        )}

        <Button type="submit" className="auth__submit" isLoading={isSubmitting}>
          ანგარიშის შექმნა
        </Button>
      </form>

      <p className="auth__switch">
        უკვე გაქვს ანგარიში? <Link to="/login">შესვლა</Link>
      </p>
    </AuthLayout>
  )
}

export default RegisterPage
