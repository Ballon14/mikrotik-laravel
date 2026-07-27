import AuthProvider from '@/components/AuthProvider'

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="theme-color" content="#0a0e1a" />
        <meta name="description" content="MikroTik Router Billing & Monitoring Dashboard" />
        <title>MikroTik Dashboard</title>
      </head>
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}
