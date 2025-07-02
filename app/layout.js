import "./globals.css";
import Navbar from "./components/Navbar";
import Sidebar from "./admin-dashboard/Sidebar";

export const metadata = {
  title: "My Auth App",
  description: "Simple Next.js Auth App",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Navbar />
        <div className="flex">
          <Sidebar />
          <main className="flex-1">{children}</main>
        </div>
      </body>
    </html>
  );
}
