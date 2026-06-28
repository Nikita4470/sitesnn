import { useState, useEffect } from 'react'
import { NavLink } from 'react-router-dom'
import styles from './CookieBanner.module.css'

export function CookieBanner() {
    const [isVisible, setIsVisible] = useState(false)

    useEffect(() => {
        const isAccepted = localStorage.getItem('cookie_accepted')

        if (!isAccepted) {
        const timer = setTimeout(() => setIsVisible(true), 1000)
        return () => clearTimeout(timer)
        }
    }, [])

    const acceptCookies = () => {
        // Записываем метку, чтобы больше не показывать
        localStorage.setItem('cookie_accepted', 'true')
        setIsVisible(false)
    }

    if (!isVisible) return null

    return (
        <div className={styles.banner} role="dialog" aria-live="polite">
        <div className={styles.content}>
            <p>
            Мы используем файлы cookie, чтобы сайт работал чётко и быстро. 
            Оставаясь с нами, вы соглашаетесь на{' '}
            <NavLink to="/policy" className={styles.link}>
                обработку персональных данных
            </NavLink>.
            </p>
            <button type="button" className="button button--lime" onClick={acceptCookies}>
            Ок, понятно
            </button>
        </div>
        </div>
    )
    }