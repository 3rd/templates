import { Link } from "react-router-dom";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container py-4 px-4 mx-auto">
          <nav className="flex justify-between items-center">
            <Link to="/" className="text-xl font-bold">
              My Project
            </Link>
            <div className="flex gap-4">
              <Link to="/" className="text-sm font-medium transition-colors hover:text-primary">
                Home
              </Link>
              <Link to="/users" className="text-sm font-medium transition-colors hover:text-primary">
                Users
              </Link>
            </div>
          </nav>
        </div>
      </header>
      <main className="container py-8 px-4 mx-auto">{children}</main>
    </div>
  );
}
