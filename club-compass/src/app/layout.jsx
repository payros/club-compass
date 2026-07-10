import '../styles/styles.scss'
import { Provider } from '@/components/ui/provider'
import { Fredoka } from 'next/font/google'

const fredoka = Fredoka({
  subsets: ['latin'],
  display: 'swap',
})

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#38c6f4',
}

export const metadata = {
  title: 'Club Compass',
  description: 'An Adventurers Club Management App',
  appleWebApp: {
    title: 'Club Compass',
  },
  icons: {
    icon: [
      { url: '/img/favicon/favicon-96x96.png', sizes: '96x96', type: 'image/png' },
      { url: '/img/favicon/favicon.svg', type: 'image/svg+xml' },
    ],
    shortcut: '/img/favicon/favicon.ico',
    apple: { url: '/img/favicon/apple-touch-icon.png', sizes: '180x180' },
  },
}

export default function RootLayout({ children }) {
  return (
    <html suppressHydrationWarning={true} className={fredoka.className}>
      <body>
        <Provider>{children}</Provider>
      </body>
    </html>
  )
}
