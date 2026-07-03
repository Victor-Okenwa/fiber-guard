'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ModeToggle } from '@/components/mode-toggle';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/', label: 'Dashboard' },
  { href: '/channels', label: 'Channels' },
  { href: '/peers', label: 'Peers' },
  { href: '/payments', label: 'Payments' },
  { href: '/can-i-pay', label: 'Can I Pay?' },
] as const;

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-svh">
      <aside className="flex w-56 shrink-0 flex-col border-r border-border bg-sidebar text-sidebar-foreground">
        <div className="flex items-center justify-between gap-2 border-b border-sidebar-border p-4">
          <div>
            <p className="text-sm font-semibold text-sidebar-primary">FiberGuard</p>
            <p className="text-xs text-muted-foreground">Node diagnostics</p>
          </div>
          <ModeToggle />
        </div>
        <nav className="flex flex-1 flex-col gap-1 p-2">
          {navItems.map((item) => {
            const isActive = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  buttonVariants({ variant: 'ghost' }),
                  'justify-start',
                  isActive && 'bg-sidebar-accent text-sidebar-accent-foreground',
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>
      <main className="flex-1 overflow-auto p-6">{children}</main>
    </div>
  );
}
