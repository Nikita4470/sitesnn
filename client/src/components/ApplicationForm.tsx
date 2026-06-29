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
    
    // Собираем данные из полей формы: name, contact, comment
    const values = Object.fromEntries(new FormData(form).entries())
    setSending(true)
    setSubmitError('')

    try {
      // 1. МЕНЯЕМ URL на наш PHP скрипт
      const response = await fetch('/send.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // Передаем name, phone (переименуем contact в phone для PHP) и комментарий
        body: JSON.stringify({ 
          name: values.name, 
          phone: values.contact, // Наш PHP ждет ключ 'phone'
          comment: values.comment 
        }),
      })

      const result = await response.json().catch(() => null)

      if (!response.ok || result.status === 'error') {
        throw new Error(result.message || 'Ошибка сервера');
      }

      // Если всё зашибись
      setSent(true)
      form.reset()
    } catch (error) {
      if (error instanceof Error) {
        setSubmitError(error.message);
      } else {
        setSubmitError('Произошла неизвестная ошибка');
      }
    } finally {
      setSending(false)
    }
  }

  if (sent) {
    return <div className={styles.success} role="status"><span>✓</span><h3>Заявка принята</h3><p>Спасибо! Мы свяжемся с вами, чтобы обсудить задачу.</p><button type="button" onClick={() => setSent(false)}>Отправить ещё одну</button></div>
  }

  return (
    <form className={`${styles.form} ${compact ? styles.compact : ''}`} onSubmit={submit} aria-busy={sending}>
      <label><span>Имя</span><input name="name" placeholder="Как к вам обращаться?" required disabled={sending} /></label>
      <label><span>Телефон / почта</span><input name="contact" placeholder="Удобный способ связи" required disabled={sending} /></label>
      <label className={styles.full}><span>Комментарий</span><textarea name="comment" rows={compact ? 3 : 4} placeholder="Коротко расскажите о бизнесе и задаче" required disabled={sending}/></label>
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
