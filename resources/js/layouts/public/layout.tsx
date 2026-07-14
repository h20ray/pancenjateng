import { Outlet } from 'react-router-dom';

export function PublicLayout() {
  return (
    <div className="flex min-h-svh w-full flex-col bg-background">
      <header className="border-b border-border">
        <div className="container flex items-center h-14">
          <a href="/lapor" className="font-bold text-lg">
            Pancen Jateng
          </a>
          <nav className="ml-auto flex items-center gap-4">
            <a href="/lapor" className="text-sm text-muted-foreground hover:text-primary">
              Lapor
            </a>
            <a href="/lacak" className="text-sm text-muted-foreground hover:text-primary">
              Lacak
            </a>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="border-t border-border py-6 text-center text-sm text-muted-foreground">
        &copy; {new Date().getFullYear()} Pancen Jateng — Sistem Pengaduan Rokok Ilegal
      </footer>
    </div>
  );
}
