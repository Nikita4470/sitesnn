import { useEffect, useState, type PropsWithChildren } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { productPages } from '../data/content'
import { Logo } from './Logo'
import styles from './Layout.module.css'

export function Layout({ children }: PropsWithChildren) {
  const [menuOpen, setMenuOpen] = useState(false)
  const location = useLocation()
  useEffect(() => setMenuOpen(false), [location.pathname])

  return (
    <div className={styles.siteShell}>
    <header className={styles.header}>
      <div className={`container ${styles.headerInner}`}>
        <Logo />
        
        {/* ЧИСТЫЙ CSS-МОДУЛЬ ОВЕРЛЕЙ: рендерится только при открытом меню */}
        {menuOpen && <div className={styles.navOverlay} onClick={() => setMenuOpen(false)} />}

        <nav className={`${styles.nav} ${menuOpen ? styles.navOpen : ''}`} aria-label="Главная навигация">
          {/* Добавили закрытие меню при клике на саму ссылку, чтобы оно не висело после перехода */}
          <NavLink to="/" end onClick={() => setMenuOpen(false)}>Главная</NavLink>
          {productPages.map((page) => (
            <NavLink key={page.slug} to={`/${page.slug}`} onClick={() => setMenuOpen(false)}>
              {page.navTitle}
            </NavLink>
          ))}
        </nav>
        
        <a className={styles.headerCta} href="#contact">Обсудить проект <span>↗</span></a>
        <button className={styles.menuButton} type="button" onClick={() => setMenuOpen((v) => !v)} aria-expanded={menuOpen} aria-label={menuOpen ? 'Закрыть меню' : 'Открыть меню'}>
          <span /><span />
        </button>
    </div>
      </header>
      <main>{children}</main>
      <footer className={styles.footer}>
        <div className={`container ${styles.footerTop}`}>
          <div><Logo /><p>Проектируем цифровые системы,<br />которые помогают бизнесу расти.</p></div>
          <div className={styles.footerNav}>
            <span>Решения</span>
            {productPages.map((page) => <NavLink key={page.slug} to={`/${page.slug}`}>{page.navTitle}</NavLink>)}
          </div>
          <div className={styles.footerContact}>
            <span>Новый проект</span>
            <a href="mailto:hello@sitesnn.ru">hello@sitesnn.ru</a>
            <a href="#contact">Оставить заявку ↗</a>
            <NavLink
              to="/policy"
              target="_blank"
              rel="noopener noreferrer"
              className="footerPolicyLink"
            >
              Политика конфиденциальности
            </NavLink>
          </div>
        </div>
        <div className={`container ${styles.footerBottom}`}><span>© {new Date().getFullYear()} SITESNN</span><span>Сайты · Приложения · Автоматизация</span></div>
      </footer>
    </div>
  )
}
