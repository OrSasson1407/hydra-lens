import "./globals.css";


export const metadata = {
  title: "HydraLens Demo Target",
  description: "Testing hydration mismatches",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}