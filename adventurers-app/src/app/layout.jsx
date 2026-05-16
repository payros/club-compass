import '../styles/styles.scss'
import { Provider } from "@/components/ui/provider"
import { Fredoka } from 'next/font/google'

const fredoka = Fredoka({
  subsets: ['latin'],
  display: 'swap',
})

export const metadata = {
  title: 'Adventurers Club',
  description: 'Adventurers Club Management App',
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
