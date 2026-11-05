import type { Metadata } from 'next'
import { landingFontVariables } from './(site)/fonts'
import './(site)/globals.css'
import { notFoundContent } from '@/content/home.content'

export const metadata: Metadata = { title: notFoundContent.title }

const GlobalNotFound = () => (
  <html lang="en" className={landingFontVariables}>
    <body className="flex min-h-screen flex-col items-start justify-center gap-24 bg-ink p-48 text-on-ink">
      {/* the failure, as a value */}
      <p className="font-machine text-code-3 text-err">{notFoundContent.value}</p>
      <h1 className="font-human text-display-5">{notFoundContent.headline}</h1>
      {/* the two ways back */}
      <nav className="flex gap-24 font-human text-body italic">
        <a href="/">{notFoundContent.home}</a>
        <a href="/docs">{notFoundContent.docs}</a>
      </nav>
    </body>
  </html>
)

export default GlobalNotFound
