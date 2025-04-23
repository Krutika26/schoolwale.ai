// app/layout.jsx
import './globals.css';
import { ThemeProvider } from 'next-themes';
import { ClerkProvider } from '@clerk/nextjs';

export const metadata = {
  title: 'My App',
  description: 'A simple Next.js app',
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html lang="en" className="h-full" suppressHydrationWarning>
        <body className="min-h-screen flex flex-col bg-white text-black dark:bg-black dark:text-white">
          <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
            {/* Header */}
            <header className="p-4 bg-gray-100 dark:bg-gray-900">
              <div className="flex items-center space-x-2 text-[#4a7f85] font-bold text-xl">
                <span>SchoolWale.ai</span>
              </div>
            </header>

            {/* Main Content */}
            <main>{children}</main>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
