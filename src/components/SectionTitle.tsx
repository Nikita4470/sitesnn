import styles from './SectionTitle.module.css'

type Props = { eyebrow: string; title: string; text?: string; light?: boolean }

export function SectionTitle({ eyebrow, title, text, light = false }: Props) {
  return (
    <div className={`${styles.title} ${light ? styles.light : ''}`}>
      <span className={styles.eyebrow}>{eyebrow}</span>
      <h2>{title}</h2>
      {text && <p>{text}</p>}
    </div>
  )
}
