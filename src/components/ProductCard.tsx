import { Link } from 'react-router-dom'
import styles from './ProductCard.module.css'

type Props = { index: string; title: string; description: string; slug: string }

export function ProductCard({ index, title, description, slug }: Props) {
  return (
    <article className={styles.card}>
      <div className={styles.top}><span>{index}</span><span>digital solution</span></div>
      <h3>{title}</h3>
      <p>{description}</p>
      <Link to={`/${slug}`} aria-label={`Подробнее: ${title}`}>Подробнее <span>↗</span></Link>
    </article>
  )
}
