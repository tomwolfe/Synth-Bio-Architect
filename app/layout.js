import './globals.css';

export const metadata = {
  title: 'AI Bio-Research Co-Pilot',
  description: 'An AI-powered tool for bio-research hypothesis generation and experimental design',
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