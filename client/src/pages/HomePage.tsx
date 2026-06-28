import { Link } from 'react-router-dom'
import { ContactSection } from '../components/ContactSection'
import { ProductCard } from '../components/ProductCard'
import { SectionTitle } from '../components/SectionTitle'
import { advantages, productCards, services, whyItems } from '../data/content'
import styles from './HomePage.module.css'
import systemsHero from '../../assets/systems-hero.png';

export function HomePage() {
  return (
    <>
      <section className={styles.hero}>
        <div className={`container ${styles.heroInner}`}>
          <div className={styles.heroArt} aria-hidden="true">
            <img src={systemsHero} alt="Цифровая система SITESNN для автоматизации бизнеса" />
            <span className={styles.artLabel}>SYSTEMS / WEB / MOBILE</span>
            <span className={styles.artStatus}><i /> Система online</span>
          </div>
          <div className={styles.heroCopy}>
            <span className={styles.heroEyebrow}>DIGITAL SOLUTIONS · 2026</span>
            <h1>Автоматизированные сайты и приложения под задачи бизнеса</h1>
            <p>Создаём цифровые системы, которые помогают получать заявки, продавать онлайн и снижать ручную работу.</p>
            <div className={styles.heroActions}>
              <a className="button button--lime" href="#contact">Получить консультацию <span>↗</span></a>
              <a className="button button--ghost" href="#solutions">Посмотреть решения <span>↓</span></a>
            </div>
          </div>
          <div className={styles.heroMeta}>
            <div><strong>4</strong><span>ключевых<br />направления</span></div>
            <div><strong>Сутки</strong><span>от идеи<br />до разработки</span></div>
            <div><strong>Проектируем</strong><span>под ваши<br />задачи</span></div>
          </div>
        </div>
      </section>

      <section className={`section ${styles.why}`}>
        <div className="container">
          <SectionTitle eyebrow="01 / ЗАЧЕМ" title="Почему бизнесу нужен сайт или приложение" text="Если заказ оформляется через долгие переписки, а сайт неудобен с телефона, клиент может уйти к конкурентам." />
          <div className={styles.whyLayout}>
            <div className={styles.whyStatement}>
              <p>Мы создаём не страницу с информацией, а часть вашей <mark>системы продаж</mark> и управления бизнесом.</p>
              <div className={styles.orbit} aria-hidden="true"><span /><i /></div>
            </div>
            <div className={styles.whyList}>
              {whyItems.map((item, index) => <div key={item}><span>{String(index + 1).padStart(2, '0')}</span><p>{item}</p><i>↗</i></div>)}
            </div>
          </div>
        </div>
      </section>

      <section className={`section ${styles.services}`}>
        <div className="container">
          <SectionTitle light eyebrow="02 / ВОЗМОЖНОСТИ" title="Что мы делаем" text="Собираем нужные бизнес-функции в одну понятную цифровую систему." />
          <div className={styles.serviceCloud}>
            {services.map((service, index) => <div key={service} className={index === 10 || index === 13 ? styles.serviceLarge : ''}><span>{String(index + 1).padStart(2, '0')}</span>{service}</div>)}
          </div>
        </div>
      </section>

      <section className={`section ${styles.advantages}`}>
        <div className="container">
          <SectionTitle eyebrow="03 / ПОДХОД" title="Конкурентные преимущества" />
          <div className={styles.advantageGrid}>
            {advantages.map((item, index) => (
              <article key={item.title}>
                <span>{String(index + 1).padStart(2, '0')}</span>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="solutions" className={`section ${styles.solutions}`}>
        <div className="container">
          <div className={styles.solutionHeading}>
            <SectionTitle light eyebrow="04 / ПРОДУКТЫ" title="Наши решения" text="Можно начать с базовой версии и развивать систему вместе с бизнесом." />
            <a href="#contact">Как выбрать решение? ↗</a>
          </div>
          <div className={styles.productGrid}>
            {productCards.map((product) => <ProductCard key={product.slug} {...product} title={product.navTitle} />)}
          </div>
        </div>
      </section>

      <section className={styles.process}>
        <div className="container">
          <SectionTitle eyebrow="05 / ПРОЦЕСС" title="От задачи до работающей системы" />
          <div className={styles.processLine}>
            {[
              ['01', 'Погружаемся', 'Изучаем процессы и точки роста'],
              ['02', 'Проектируем', 'Структура, сценарии и прототип'],
              ['03', 'Разрабатываем', 'Дизайн, код и интеграции'],
              ['04', 'Запускаем', 'Тестирование и развитие'],
            ].map(([num, title, text]) => <article key={num}><span>{num}</span><h3>{title}</h3><p>{text}</p></article>)}
          </div>
        </div>
      </section>

      <ContactSection />
    </>
  )
}
