import { Outfit, DM_Sans, JetBrains_Mono } from 'next/font/google'
import './globals.css'

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit'
})

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm-sans'
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono'
})

export const metadata = {
  title: 'MyGPT',
  description: 'Personal AI Assistant powered by Ollama',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${outfit.variable} ${dmSans.variable} ${jetbrainsMono.variable}`}>
        {children}
      </body>
    </html>
  )
}
