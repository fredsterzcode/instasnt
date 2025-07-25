import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link";

export const metadata: Metadata = {
  description: "Generated by create next app",
};

const navItems = [
  { href: "/dashboard", label: "🏠 Dashboard" },
  { href: "/site-generator", label: "🌐 Website Builder" },
  { href: "/copywriting", label: "🧠 AI Copywriting" },
  { href: "/design-studio", label: "🎨 Design Studio" },
  { href: "/media-tools", label: "🖼️ Media Tools" },
  { href: "/ad-social", label: "📣 Ad & Social Creator" },
  { href: "/brand-kit", label: "🎯 Brand Kit" },
  { href: "/leads", label: "📥 Lead & Forms" },
  { href: "/analytics", label: "📊 Analytics (soon)" },
  { href: "/projects", label: "💼 My Projects" },
  { href: "/account", label: "👤 Account / Credits" },
];

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-white text-black">
        <div className="flex min-h-screen">
          {/* Sidebar navigation */}
          <aside className="hidden md:flex flex-col w-64 bg-black text-white p-6 space-y-2">
            <div className="text-2xl font-bold mb-8">InstantList</div>
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="block py-2 px-3 rounded hover:bg-gray-800 transition"
              >
                {item.label}
              </Link>
            ))}
          </aside>
          {/* Top nav for mobile */}
          <nav className="md:hidden flex w-full bg-black text-white p-2 overflow-x-auto">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="whitespace-nowrap px-3 py-1 rounded hover:bg-gray-800 transition text-sm"
              >
                {item.label}
              </Link>
            ))}
          </nav>
          {/* Main content */}
          <main className="flex-1 p-4 md:p-12">{children}</main>
        </div>
      </body>
    </html>
  );
}
