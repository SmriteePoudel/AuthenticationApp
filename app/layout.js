import "./globals.css";
import Navbar from "./components/Navbar";

export const metadata = {
  title: "My Auth App",
  description: "Simple Next.js Auth App",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Navbar />
        <main className="flex-1">{children}</main>
      </body>
    </html>
  );
}
