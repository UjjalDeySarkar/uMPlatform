"use client";

import { cn } from "@/lib/utils";
import Link from "next/link";
import { ThemeToggle } from "./ThemeToggle";
import { UserMenu } from "./UserMenu";
import { createClient } from "@/utils/supabase/client";
import { useEffect, useState } from "react";
import { User } from "@supabase/supabase-js";
import { Button } from "./ui/button";
import { usePathname } from "next/navigation";

interface HeaderProps {
  className?: string;
}

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
        "fixed top-0 w-full z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60",
        className
      )}
    >
      <div className="w-full flex h-10 items-center justify-between px-4 md:px-6">
        <Link
          href={"/"}
          className="flex items-center space-x-2 font-bold text-xl hover:text-primary transition-colors"
        >
          UnManage AI
        </Link>

        <div className="flex items-center gap-4">
          <div className="border-l pl-4 dark:border-gray-800">
            <ThemeToggle />
          </div>

          {isLandingPage ? (
            <>
              {user ? (
                <UserMenu user={user} />
              ) : (
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/login">Sign In</Link>
                  </Button>
                </div>
              )}
            </>
          ): (<></>)}
        </div>
      </div>
    </header>
  );
};