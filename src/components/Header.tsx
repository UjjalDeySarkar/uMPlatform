"use client";

import { cn } from "@/lib/utils";
import Link from "next/link";
import { ThemeToggle } from "./ThemeToggle";
import { UserMenu } from "./UserMenu";
import { createClient } from "../../utils/supabase/client";
import { useEffect, useState } from "react";
import { User } from "@supabase/supabase-js";
import { Button } from "./ui/button";
import { usePathname } from "next/navigation";


interface HeaderProps {
  className?: string;
}
// className="h-f flex justify-center items-center"
const supabase = createClient();

export const Header = ({ className }: HeaderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const pathname = usePathname();
  const isLandingPage = pathname === '/';

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [supabase.auth]);

  return (
    <header
      className={cn(
        "fixed items-center top-0 w-full z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60",
        className
      )}
    >
      <div className="container flex h-16 items-center justify-between">
        <Link
          href={"/"}
          className="flex items-center space-x-2 font-bold text-xl hover:text-primary transition-colors"
        >
          UnManage AI
        </Link>

        <div className="flex items-center gap-4">
          {user ? (
            <UserMenu user={user} />
          ) : (
            <div className="flex items-center gap-3">
              {isLandingPage && (
                <>
                  <Button variant="ghost" asChild>
                    <Link href="/login">Sign in</Link>
                  </Button>
                  <Button asChild>
                    <Link href="/create-account">Get Started</Link>
                  </Button>
                </>
              )}
            </div>
          )}
          <div className="border-l pl-4 dark:border-gray-800">
            <ThemeToggle />
          </div>
        </div>
      </div>
    </header>
  );
};
