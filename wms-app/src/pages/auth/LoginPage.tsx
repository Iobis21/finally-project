import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useLocation, useNavigate } from 'react-router'
import FormField from '../../components/FormField/FormField'
import Button from '../../components/ui/Button/Button'
import { useAuth } from '../../context/AuthContext'
import { loginSchema, type LoginForm } from '../../schemas/auth.schema'
import AuthLayout from './AuthLayout'

function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [serverError, setServerError] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({ resolver: zodResolver(loginSchema), mode: 'onTouched' })

  async function onSubmit({ email, password }: LoginForm) {
    setServerError(null)
    try {
      await login(email, password)
      // დაბრუნება იმ გვერდზე, საიდანაც გადმოვიდა (ან მთავარზე)
      navigate((location.state as { from?: string } | null)?.from ?? '/', { replace: true })
    } catch (error) {
      // უსაფრთხოებისთვის არ ვამბობთ, ელ-ფოსტაა არასწორი თუ პაროლი
      setServerError(
        error instanceof Error && error.message.includes('დაბლოკილია')
          ? error.message
          : 'ელ-ფოსტა ან პაროლი არასწორია',
      )
    }
  }

  return (
    <AuthLayout title="სისტემაში შესვლა">
      <form className="auth__form" onSubmit={handleSubmit(onSubmit)} noValidate>
        <FormField label="ელ-ფოსტა" error={errors.email?.message}>
          <input
            className="input"
            type="email"
            autoComplete="email"
            placeholder="name@wms.ge"
            {...register('email')}
          />
        </FormField>

        <FormField label="პაროლი" error={errors.password?.message}>
          <input
            className="input"
            type="password"
            autoComplete="current-password"
            {...register('password')}
          />
        </FormField>

        {serverError && (
          <p className="auth__error" role="alert">
            {serverError}
          </p>
        )}

        <Button type="submit" className="auth__submit" isLoading={isSubmitting}>
          შესვლა
        </Button>
      </form>

      <p className="auth__switch">
        არ გაქვს ანგარიში? <Link to="/register">რეგისტრაცია</Link>
      </p>

      <p className="auth__hint">
        სატესტო ანგარიშები (პაროლი: <strong>Wms12345!</strong>):
        <br />
        manager@wms.ge · purchasing@wms.ge · operator@wms.ge · logistics@wms.ge
      </p>
    </AuthLayout>
  )
}

export default LoginPage
