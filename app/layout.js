import './globals.css';

export const metadata = {
  title: 'SIXTEE SHOP',
  description: 'Belanja produk pilihan dengan mudah.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="id" data-scroll-behavior="smooth">
      <body>{children}</body>
    </html>
  );
}
