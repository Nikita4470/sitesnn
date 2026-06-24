import { ApplicationForm } from './ApplicationForm'
import styles from './ContactSection.module.css'

type Props = { title?: string; product?: boolean }

export function ContactSection({ title = 'Обсудим ваш проект', product = false }: Props) {
  return (
    <section id="contact" className={`${styles.section} ${product ? styles.product : ''}`}>
      <div className={`container ${styles.inner}`}>
        <div className={styles.copy}>
          <span className={styles.label}>/ СТАРТ ПРОЕКТА</span>
          <h2>{title}</h2>
          <p>Опишите ваш бизнес — разберём процесс и предложим решение, полезное для реальной работы, а не «для галочки».</p>
          <div className={styles.note}><span>15–20 мин.</span> на первый разговор</div>
        </div>
        <ApplicationForm compact={product} />
      </div>
    </section>
  )
}
