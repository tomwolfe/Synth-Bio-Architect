import './globals.css';

export const metadata = {
  title: 'Synth Bio Architect',
  description: 'An AI-powered tool for synthetic biology architecture and design',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-gray-900 text-white min-h-screen flex">
        {children}
      </body>
    </html>
  );
}