import { AuthProvider } from '@/contexts/AuthContext'; 
import './globals.css'; 

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}

export const metadata = {
  title: 'DEVPANEL',
  description: 'Admin dashboard application',
};