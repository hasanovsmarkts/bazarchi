import './globals.css';
import Providers from './providers';

export const metadata = {
  title: 'Bazarchi - Multi-Vendor Marketplace',
  description: 'Umico və Trendyol stilində marketplace',
};

export default function RootLayout({ children }) {
  return (
    <html lang="az">
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
