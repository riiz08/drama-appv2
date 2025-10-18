"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Navbar as HeroNavbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  NavbarMenuToggle,
  NavbarMenu,
  NavbarMenuItem,
} from "@heroui/navbar";
import { Button } from "@heroui/button";
import { Search } from "lucide-react";
import SearchModal from "@/components/layout/SearchModal";

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { href: "/", label: "Beranda" },
    { href: "/drama", label: "Jelajah" },
    { href: "/drama?status=ONGOING", label: "Sedang Tayang" },
    { href: "/drama?status=TAMAT", label: "Selesai" },
  ];

  return (
    <header>
      <HeroNavbar
        isMenuOpen={isMenuOpen}
        onMenuOpenChange={setIsMenuOpen}
        maxWidth="xl"
        className={`fixed transition-all duration-300 ${
          isScrolled
            ? "bg-black/95 backdrop-blur-sm shadow-lg"
            : "bg-gradient-to-b from-black/80 to-transparent"
        }`}
      >
        {/* Mobile Menu Toggle */}
        <NavbarContent className="md:hidden" justify="start">
          <NavbarMenuToggle
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          />
        </NavbarContent>

        {/* Logo - Center on Mobile, Start on Desktop */}
        <NavbarContent className="md:hidden pr-3" justify="center">
          <NavbarBrand>
            <Link href="/" className="font-bold text-inherit">
              <span className="text-white">Mangeakkk</span>
              <span className="text-red-500"> Drama</span>
            </Link>
          </NavbarBrand>
        </NavbarContent>

        {/* Logo - Desktop */}
        <NavbarContent className="hidden md:flex gap-4" justify="start">
          <NavbarBrand>
            <Link href="/" className="font-bold text-xl group">
              <span className="text-white group-hover:text-red-500 transition-colors">
                Mangeakkk
              </span>
              <span className="text-red-500"> Drama</span>
            </Link>
          </NavbarBrand>
        </NavbarContent>

        {/* Desktop Navigation Links */}
        <NavbarContent className="hidden md:flex gap-6" justify="center">
          {navLinks.map((link) => (
            <NavbarItem key={link.href} isActive={pathname === link.href}>
              <Link
                href={link.href}
                className={`text-sm font-medium transition-colors hover:text-white ${
                  pathname === link.href ? "text-white" : "text-gray-300"
                }`}
              >
                {link.label}
              </Link>
            </NavbarItem>
          ))}
        </NavbarContent>

        {/* Search Button */}
        <NavbarContent justify="end">
          <NavbarItem>
            <Button
              isIconOnly
              variant="light"
              onPress={() => setIsSearchOpen(true)}
              className="text-gray-300 hover:text-white"
              aria-label="Search"
            >
              <Search className="w-5 h-5" />
            </Button>
          </NavbarItem>
        </NavbarContent>

        {/* Mobile Menu */}
        <NavbarMenu className="bg-black/95 backdrop-blur-sm pt-6">
          {navLinks.map((link, index) => (
            <NavbarMenuItem key={`${link.href}-${index}`}>
              <Link
                href={link.href}
                onClick={() => setIsMenuOpen(false)}
                className={`w-full text-lg font-medium transition-colors hover:text-white ${
                  pathname === link.href ? "text-white" : "text-gray-300"
                }`}
              >
                {link.label}
              </Link>
            </NavbarMenuItem>
          ))}
        </NavbarMenu>
      </HeroNavbar>

      {/* Search Modal */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />
    </header>
  );
}
