import { BookmarkCheck, Database, Info, Search } from "lucide-react";
import type { ReactNode } from "react";

type View = "home" | "saved" | "about" | "method";

type LayoutProps = {
  children: ReactNode;
  view: View;
};

const navItems: Array<{ id: View; label: string; href: string; icon: typeof Search }> = [
  { id: "home", label: "Search", href: "#/", icon: Search },
  { id: "saved", label: "Saved", href: "#/saved", icon: BookmarkCheck },
  { id: "about", label: "About", href: "#/about", icon: Info },
  { id: "method", label: "Method / Data", href: "#/method", icon: Database },
];

export function Layout({ children, view }: LayoutProps) {
  return (
    <div className="app-shell">
      <header className="site-header">
        <a className="brand" href="#/" aria-label="Academic Travel Services home">
          <span className="brand-mark" aria-hidden="true">
            <span />
            <span />
            <span />
          </span>
          <span>Academic Travel Services</span>
        </a>
        <nav className="main-nav" aria-label="Primary navigation">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <a key={item.id} href={item.href} aria-current={view === item.id ? "page" : undefined}>
                <Icon aria-hidden="true" size={17} strokeWidth={2.2} />
                <span>{item.label}</span>
              </a>
            );
          })}
        </nav>
      </header>
      {children}
    </div>
  );
}
