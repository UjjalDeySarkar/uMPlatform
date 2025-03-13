'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Menu, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Navbar: React.FC = () => {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const currentPath = window.location.pathname; // Use window for current path since useRouter doesn't provide pathname directly in Next.js App Router

  return (
    <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-md border-b border-border/50">
      <div className="container flex items-center justify-between h-16 px-4 md:px-6">
        <div className="flex items-center space-x-4">
          <Link href="/" className="flex items-center space-x-2 font-medium transition-colors animate-fade-in">
            <div className="h-8 w-8 rounded-md bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-semibold">K</span>
            </div>
            <span className="text-xl font-medium">Kanban</span>
          </Link>
        </div>

        <nav className="hidden md:flex items-center space-x-6">
          <Link 
            href="/" 
            className={`text-sm font-medium transition-colors hover:text-primary ${
              currentPath === '/' ? 'text-primary' : 'text-muted-foreground'
            }`}
          >
            Dashboard
          </Link>
          <Link 
            href="/projects" 
            className={`text-sm font-medium transition-colors hover:text-primary ${
              currentPath.includes('/projects') ? 'text-primary' : 'text-muted-foreground'
            }`}
          >
            Projects
          </Link>
        </nav>

        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <Menu className="h-5 w-5" />
          </Button>
          <div className="relative">
            <Button 
              variant="ghost"
              size="sm"
              className="flex items-center text-sm font-medium"
            >
              <span className="mr-2">John Doe</span>
              <ChevronDown className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {isMenuOpen && (
        <div className="md:hidden p-4 border-t border-border/50 bg-background/80 backdrop-blur-md animate-fade-in">
          <nav className="flex flex-col space-y-3">
            <Link 
              href="/" 
              className={`text-sm font-medium transition-colors hover:text-primary ${
                currentPath === '/' ? 'text-primary' : 'text-muted-foreground'
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              Dashboard
            </Link>
            <Link 
              href="/projects" 
              className={`text-sm font-medium transition-colors hover:text-primary ${
                currentPath.includes('/projects') ? 'text-primary' : 'text-muted-foreground'
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              Projects
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Navbar;

