"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { useState } from "react";
import { Menu, X, User, LogOut, Shield, Crown, FileText, Bookmark } from "lucide-react";
import { NAV_LINKS, BLOG_TITLE } from "@/lib/constants";
import { ThemeToggle } from "./ThemeToggle";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

export function Header() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/home" className="group flex items-center gap-2">
            <span className="text-xl font-bold tracking-tight">
              <span className="text-neon-cyan glitch" data-text="NEXUS">
                NEXUS
              </span>
              <span className="text-foreground">.</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "relative px-3 py-2 text-sm font-medium rounded-md transition-colors",
                  pathname === link.href
                    ? "text-neon-cyan"
                    : "text-muted hover:text-foreground"
                )}
              >
                {pathname === link.href && (
                  <motion.span
                    layoutId="nav-active"
                    className="absolute inset-0 rounded-md bg-surface-alt border border-border"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
                <span className="relative z-10">{link.label}</span>
              </Link>
            ))}

            {/* User menu */}
            <div className="relative ml-2 flex items-center gap-1">
              <ThemeToggle />
              {user ? (
                <>
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border bg-surface text-sm text-foreground hover:border-neon-cyan/30 transition-colors cursor-pointer"
                  >
                    {user.role === "super_admin" ? (
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center shadow-[0_0_8px_rgba(251,191,36,0.5)]">
                        <Crown size={14} className="text-white" />
                      </div>
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-neon-cyan/20 flex items-center justify-center text-xs text-neon-cyan font-medium">
                        {user.username.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <span className="hidden lg:inline">{user.username}</span>
                  </button>

                  {userMenuOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-40"
                        onClick={() => setUserMenuOpen(false)}
                      />
                      <motion.div
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="absolute right-0 top-full mt-2 z-50 w-48 rounded-xl border border-border bg-surface shadow-xl"
                      >
                        <div className="p-2">
                          <div className="px-3 py-2 text-sm text-muted border-b border-border mb-1">
                            {user.username}
                            <span className="block text-xs text-muted/60">{user.email}</span>
                          </div>

                          <Link
                            href="/my-posts"
                            onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-foreground hover:bg-surface-alt transition-colors"
                          >
                            <FileText size={16} className="text-muted" />
                            我的文章
                          </Link>
                          <Link
                            href="/my-bookmarks"
                            onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-foreground hover:bg-surface-alt transition-colors"
                          >
                            <Bookmark size={16} className="text-muted" />
                            我的收藏
                          </Link>
                          <Link
                            href="/settings"
                            onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-foreground hover:bg-surface-alt transition-colors"
                          >
                            <User size={16} className="text-muted" />
                            个人设置
                          </Link>

                          {(user.role === "admin" || user.role === "super_admin") && (
                            <Link
                              href="/admin"
                              onClick={() => setUserMenuOpen(false)}
                              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-foreground hover:bg-surface-alt transition-colors"
                            >
                              {user.role === "super_admin" ? (
                                <Crown size={16} className="text-amber-400" />
                              ) : (
                                <Shield size={16} className="text-neon-purple" />
                              )}
                              管理后台
                            </Link>
                          )}

                          <button
                            onClick={() => {
                              logout();
                              setUserMenuOpen(false);
                            }}
                            className="flex w-full items-center gap-2 px-3 py-2 rounded-lg text-sm text-red-400 hover:bg-surface-alt transition-colors cursor-pointer"
                          >
                            <LogOut size={16} />
                            退出登录
                          </button>
                        </div>
                      </motion.div>
                    </>
                  )}
                </>
              ) : (
                <Link
                  href="/auth/login"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neon-cyan text-background text-sm font-medium hover:bg-neon-cyan/90 transition-colors"
                >
                  <User size={14} />
                  登录
                </Link>
              )}
            </div>
          </nav>

          {/* Mobile menu button */}
          <div className="flex items-center gap-2 md:hidden">
            <ThemeToggle />
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-2 text-muted hover:text-foreground cursor-pointer"
              aria-label="菜单"
            >
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile nav */}
      {menuOpen && (
        <motion.nav
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="md:hidden border-t border-border bg-surface"
        >
          <div className="px-4 py-3 space-y-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className={cn(
                  "block px-3 py-2 rounded-md text-sm font-medium transition-colors",
                  pathname === link.href
                    ? "text-neon-cyan bg-surface-alt"
                    : "text-muted hover:text-foreground"
                )}
              >
                {link.label}
              </Link>
            ))}
            <hr className="border-border my-2" />
            {user ? (
              <>
                <div className="px-3 py-2 text-sm text-muted">
                  {user.username}
                  {user.role === "super_admin" && (
                    <span className="ml-2 text-xs text-amber-400">超级管理员</span>
                  )}
                  {user.role === "admin" && (
                    <span className="ml-2 text-xs text-neon-purple">管理员</span>
                  )}
                </div>
                {(user.role === "admin" || user.role === "super_admin") && (
                  <Link
                    href="/admin"
                    onClick={() => setMenuOpen(false)}
                    className="block px-3 py-2 rounded-md text-sm text-foreground hover:bg-surface-alt transition-colors"
                  >
                    ⚙ 管理后台
                  </Link>
                )}
                <button
                  onClick={() => {
                    logout();
                    setMenuOpen(false);
                  }}
                  className="block w-full text-left px-3 py-2 rounded-md text-sm text-red-400 hover:bg-surface-alt transition-colors cursor-pointer"
                >
                  退出登录
                </button>
              </>
            ) : (
              <Link
                href="/auth/login"
                onClick={() => setMenuOpen(false)}
                className="block px-3 py-2 rounded-md text-sm text-neon-cyan hover:bg-surface-alt transition-colors"
              >
                登录 / 注册
              </Link>
            )}
          </div>
        </motion.nav>
      )}
    </header>
  );
}
