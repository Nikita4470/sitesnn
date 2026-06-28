import { useEffect } from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { Layout } from './components/Layout'
import { HomePage } from './pages/HomePage'
import { ProductPage } from './pages/ProductPage'
import { productPages } from './data/content'
import { PolicyPage } from './pages/PolicyPage'
import { CookieBanner } from './components/CookieBanner'

const SITE_URL = 'https://sitesnn.ru'
const SITE_NAME = 'SITESNN'
const SOCIAL_IMAGE_URL = 'https://raw.githubusercontent.com/Nikita4470/sitesnn/main/client/assets/systems-hero.png'
const ROBOTS_CONTENT = 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1'

const PRODUCT_SEO_TITLES: Record<string, string> = {
  'site-vizitka': 'Сайт-визитка для бизнеса под ключ — SITESNN',
  'internet-magazin': 'Разработка интернет-магазина под ключ — SITESNN',
  'avtomatizirovannyi-site': 'Автоматизированный сайт для приёма заказов — SITESNN',
  'mobilnye-prilozheniya': 'Разработка мобильных приложений для бизнеса — SITESNN',
}

function setMeta(attribute: 'name' | 'property', key: string, content: string) {
  let meta = document.head.querySelector<HTMLMetaElement>(`meta[${attribute}="${key}"]`)
  if (!meta) {
    meta = document.createElement('meta')
    meta.setAttribute(attribute, key)
    document.head.append(meta)
  }
  meta.content = content
}

function Seo() {
  const { pathname } = useLocation()

  useEffect(() => {
    const normalizedPath = pathname === '/' ? '/' : pathname.replace(/\/+$/, '')
    const product = productPages.find((page) => `/${page.slug}` === normalizedPath)
    const pageSeo = product
      ? {
          title: PRODUCT_SEO_TITLES[product.slug],
          description: product.subtitle,
          path: `/${product.slug}`,
        }
      : normalizedPath === '/policy'
        ? {
            title: 'Политика конфиденциальности и обработки данных — SITESNN',
            description: 'Политика SITESNN об обработке и защите персональных данных пользователей в соответствии с Федеральным законом № 152-ФЗ.',
            path: '/policy',
          }
        : {
            title: 'Разработка сайтов и приложений для бизнеса — SITESNN',
            description: 'SITESNN создаёт автоматизированные сайты, интернет-магазины и мобильные приложения для продаж, приёма заказов и снижения ручной работы.',
            path: '/',
          }

    const canonicalUrl = `${SITE_URL}${pageSeo.path}`
    document.title = pageSeo.title

    setMeta('name', 'description', pageSeo.description)
    setMeta('name', 'robots', ROBOTS_CONTENT)
    setMeta('property', 'og:title', pageSeo.title)
    setMeta('property', 'og:description', pageSeo.description)
    setMeta('property', 'og:type', 'website')
    setMeta('property', 'og:url', canonicalUrl)
    setMeta('property', 'og:image', SOCIAL_IMAGE_URL)
    setMeta('property', 'og:site_name', SITE_NAME)
    setMeta('property', 'og:locale', 'ru_RU')
    setMeta('name', 'twitter:card', 'summary_large_image')
    setMeta('name', 'twitter:title', pageSeo.title)
    setMeta('name', 'twitter:description', pageSeo.description)
    setMeta('name', 'twitter:image', SOCIAL_IMAGE_URL)

    let canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]')
    if (!canonical) {
      canonical = document.createElement('link')
      canonical.rel = 'canonical'
      document.head.append(canonical)
    }
    canonical.href = canonicalUrl

    const organization = {
      '@type': 'Organization',
      '@id': `${SITE_URL}/#organization`,
      name: SITE_NAME,
      url: `${SITE_URL}/`,
      email: 'hello@sitesnn.ru',
    }
    const structuredData = product
      ? {
          '@context': 'https://schema.org',
          '@graph': [
            organization,
            {
              '@type': 'Service',
              '@id': `${canonicalUrl}#service`,
              name: product.title,
              description: product.subtitle,
              serviceType: product.navTitle,
              url: canonicalUrl,
              areaServed: 'RU',
              provider: { '@id': `${SITE_URL}/#organization` },
            },
          ],
        }
      : normalizedPath === '/policy'
        ? {
            '@context': 'https://schema.org',
            '@graph': [
              organization,
              {
                '@type': 'WebPage',
                '@id': `${canonicalUrl}#webpage`,
                name: pageSeo.title,
                description: pageSeo.description,
                url: canonicalUrl,
                inLanguage: 'ru-RU',
                isPartOf: { '@id': `${SITE_URL}/#website` },
              },
            ],
          }
        : {
            '@context': 'https://schema.org',
            '@graph': [
              organization,
              {
                '@type': 'WebSite',
                '@id': `${SITE_URL}/#website`,
                url: `${SITE_URL}/`,
                name: SITE_NAME,
                description: 'Автоматизированные сайты, интернет-магазины и мобильные приложения для бизнеса.',
                inLanguage: 'ru-RU',
                publisher: { '@id': `${SITE_URL}/#organization` },
              },
            ],
          }

    let jsonLd = document.head.querySelector<HTMLScriptElement>('#sitesnn-structured-data')
    if (!jsonLd) {
      jsonLd = document.createElement('script')
      jsonLd.id = 'sitesnn-structured-data'
      jsonLd.type = 'application/ld+json'
      document.head.append(jsonLd)
    }
    jsonLd.textContent = JSON.stringify(structuredData)
  }, [pathname])

  return null
}

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => window.scrollTo({ top: 0, behavior: 'instant' }), [pathname])
  return null
}

export default function App() {
  return (
    <Layout>
      <Seo />
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/policy" element={<PolicyPage />} />
        {productPages.map((page) => (
          <Route key={page.slug} path={`/${page.slug}`} element={<ProductPage data={page} />} />
        ))}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <CookieBanner />
    </Layout>
  )
}
