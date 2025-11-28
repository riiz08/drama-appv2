"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@heroui/dropdown";
import { Button } from "@heroui/button";
import { Home, Tv, PlayCircle, LogOut, User } from "lucide-react";
import { logoutAction } from "@/app/actions/auth/logout";

interface AdminHeaderProps {
  user: {
    id?: string;
    role?: string;
  };
}

export default function AdminHeader({ user }: AdminHeaderProps) {
  const pathname = usePathname();

  const navLinks = [
    { href: "/admin", label: "Dashboard", icon: Home },
    { href: "/admin/dramas", label: "Drama", icon: Tv },
    { href: "/admin/episodes", label: "Episode", icon: PlayCircle },
  ];

  const handleLogout = async () => {
    await logoutAction();
  };

  return (
    <header className="bg-zinc-900 border-b border-zinc-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/admin" className="font-bold text-xl">
            <span className="text-white">Mangeakkk</span>
            <span className="text-red-500"> Admin</span>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-2 text-sm font-medium transition-colors ${
                    isActive ? "text-white" : "text-gray-400 hover:text-white"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* User Menu */}
          <Dropdown>
            <DropdownTrigger>
              <Button variant="flat" className="bg-zinc-800">
                <User className="w-4 h-4" />
                <span className="hidden sm:inline">{user.id || user.role}</span>
              </Button>
            </DropdownTrigger>
            <DropdownMenu aria-label="User menu">
              <DropdownItem key="view" as={Link} href="/" target="_blank">
                Lihat Website
              </DropdownItem>
              <DropdownItem key="logout" color="danger" onClick={handleLogout}>
                <div className="flex items-center gap-2">
                  <LogOut className="w-4 h-4" />
                  Logout
                </div>
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </div>
      </div>
    </header>
  );
}
