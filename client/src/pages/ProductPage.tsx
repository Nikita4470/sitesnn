import { Link } from 'react-router-dom'
import { ContactSection } from '../components/ContactSection'
import { SectionTitle } from '../components/SectionTitle'
import type { ProductPageData } from '../data/content'
import styles from './ProductPage.module.css'

export function ProductPage({ data }: { data: ProductPageData }) {
  return (
    <>
      <section className={styles.hero}>
        <div className={`container ${styles.heroInner}`}>
          <div className={styles.heroCopy}>
            <span className={styles.eyebrow}>РЕШЕНИЕ {data.index} / SITESNN</span>
            <h1>{data.title}</h1>
            <p>{data.subtitle}</p>
            <a className="button button--lime" href="#contact">{data.cta} <span>↗</span></a>
          </div>
          <div className={styles.heroVisual} aria-hidden="true">
            <div className={styles.visualWindow}>
              <span className={styles.visualTop}>BUSINESS / FLOW / {data.index}</span>
              <strong>{data.index}</strong>
              <div className={styles.flowLine}><i /><i /><i /><i /></div>
              <p>{data.navTitle}</p>
            </div>
          </div>
          <div className={styles.breadcrumb}><Link to="/">Главная</Link><span>→</span><b>{data.navTitle}</b></div>
        </div>
      </section>

      <section className={`section ${styles.audience}`}>
        <div className="container">
          <SectionTitle eyebrow="01 / КОМУ ПОДХОДИТ" title={`Кому подходит ${data.navTitle.toLowerCase()}`} text={data.audienceIntro} />
          <div className={styles.chipGrid}>
            {data.audience.map((item, index) => <div key={item}><span>{String(index + 1).padStart(2, '0')}</span>{item}</div>)}
          </div>
        </div>
      </section>

      <section className={`section ${styles.tasks}`}>
        <div className={`container ${styles.tasksInner}`}>
          <SectionTitle light eyebrow="02 / ЗАДАЧИ" title="Какие задачи решает" />
          <div className={styles.taskGrid}>
            {data.tasks.map((task, index) => <article key={task}><span>0{(index % 4) + 1}</span><h3>{task}</h3></article>)}
          </div>
        </div>
      </section>

      <section className={`section ${styles.features}`}>
        <div className="container">
          <SectionTitle eyebrow="03 / СИСТЕМА" title={data.featuresTitle} text="Состав проекта настраивается под ваши процессы. Ниже — типовой набор возможностей." />
          <div className={styles.featureGrid}>
            {data.featureGroups.map((group, index) => (
              <article key={group.title} className={index % 5 === 0 ? styles.featureAccent : ''}>
                <div className={styles.featureHead}><span>{String(index + 1).padStart(2, '0')}</span><h3>{group.title}</h3></div>
                <ul>{group.items.map((item) => <li key={item}>{item}</li>)}</ul>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.outcome}>
        <div className={`container ${styles.outcomeInner}`}>
          <span className={styles.outcomeLabel}>04 / РЕЗУЛЬТАТ</span>
          <h2>Что получает бизнес</h2>
          <div>{data.outcome.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</div>
          <a href="#contact">Перейти к обсуждению <span>↓</span></a>
        </div>
      </section>

      <ContactSection title={data.formTitle} product />
    </>
  )
}
