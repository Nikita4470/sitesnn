import { useState, type FormEvent } from 'react'
import styles from './ApplicationForm.module.css'
import { NavLink } from 'react-router-dom'

type Props = { compact?: boolean }

export function ApplicationForm({ compact = false }: Props) {
  const [sent, setSent] = useState(false)
  const [sending, setSending] = useState(false)
  const [submitError, setSubmitError] = useState('')

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget
    const values = Object.fromEntries(new FormData(form).entries())
    setSending(true)
    setSubmitError('')

    try {
      const response = await fetch('/api/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...values, page: window.location.href }),
      })
      const result = await response.json().catch(() => null)

      if (!response.ok || !result?.ok) throw new Error('lead_delivery_failed')

      setSent(true)
      form.reset()
    } catch {
      setSubmitError('Не удалось отправить заявку. Попробуйте ещё раз или напишите нам на')
    } finally {
      setSending(false)
    }
  }

  if (sent) {
    return <div className={styles.success} role="status"><span>✓</span><h3>Заявка принята</h3><p>Спасибо! Мы свяжемся с вами, чтобы обсудить задачу.</p><button type="button" onClick={() => setSent(false)}>Отправить ещё одну</button></div>
  }

  return (
    <form className={`${styles.form} ${compact ? styles.compact : ''}`} onSubmit={submit} aria-busy={sending}>
      <label><span>Имя</span><input name="name" placeholder="Как к вам обращаться?" required /></label>
      <label><span>Телефон / почта</span><input name="contact" placeholder="Удобный способ связи" required /></label>
      <label className={styles.full}><span>Комментарий</span><textarea name="comment" rows={compact ? 3 : 4} placeholder="Коротко расскажите о бизнесе и задаче" /></label>
      {submitError && <p className={`${styles.full} ${styles.error}`} role="alert">{submitError} <a href="mailto:hello@sitesnn.ru">hello@sitesnn.ru</a>.</p>}
      <div className={`${styles.full} ${styles.submitRow}`}>
        <button className="button button--lime" type="submit" disabled={sending}>{sending ? 'Отправляем…' : 'Отправить заявку'} <span>↗</span></button>
        <small>Нажимая кнопку, вы соглашаетесь на <NavLink
              to="/policy"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.linkLight}
            >
              обработку данных.
            </NavLink>
          </small>
      </div>
    </form>
  )
}
