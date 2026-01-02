import './globals.css'
import { Toaster } from '@/components/ui/sonner'

export const metadata = {
  title: 'Bazarchi - Multi-Vendor Marketplace',
  description: 'Umico və Trendyol stilində marketplace',
}

export default function RootLayout({ children }) {
  return (
    <html lang="az">
      <body>
        {children}
        <Toaster />
      </body>
    </html>
  )
}
