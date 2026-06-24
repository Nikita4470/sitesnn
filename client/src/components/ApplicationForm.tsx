import { useState, type FormEvent } from 'react'
import styles from './ApplicationForm.module.css'

type Props = { compact?: boolean }

export function ApplicationForm({ compact = false }: Props) {
  const [sent, setSent] = useState(false)

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const values = Object.fromEntries(new FormData(event.currentTarget).entries())
    console.log('Заявка:', values)
    setSent(true)
    event.currentTarget.reset()
  }

  if (sent) {
    return <div className={styles.success} role="status"><span>✓</span><h3>Заявка принята</h3><p>Спасибо! Мы свяжемся с вами, чтобы обсудить задачу.</p><button type="button" onClick={() => setSent(false)}>Отправить ещё одну</button></div>
  }

  return (
    <form className={`${styles.form} ${compact ? styles.compact : ''}`} onSubmit={submit}>
      <label><span>Имя</span><input name="name" placeholder="Как к вам обращаться?" required /></label>
      <label><span>Телефон / почта</span><input name="contact" placeholder="Удобный способ связи" required /></label>
      <label className={styles.full}><span>Комментарий</span><textarea name="comment" rows={compact ? 3 : 4} placeholder="Коротко расскажите о бизнесе и задаче" /></label>
      <div className={`${styles.full} ${styles.submitRow}`}>
        <button className="button button--lime" type="submit">Отправить заявку <span>↗</span></button>
        <small>Нажимая кнопку, вы соглашаетесь на <a href="#policy" className={styles.linkLight}>обработку данных.</a></small>
      </div>
    </form>
  )
}
