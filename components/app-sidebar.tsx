"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  GraduationCap,
  Users,
  BookOpen,
  Calendar,
  FileText,
  MessageSquare,
  CreditCard,
  LayoutDashboard,
  ChevronRight,
} from "lucide-react"
import { cn } from "@/lib/utils"

type NavItem = {
  name: string
  href?: string
  icon: React.ComponentType<{ className?: string }>
  roles?: string[]
  children?: NavItem[]
}

const navigation: NavItem[] = [
  {
    name: "Inicio",
    href: "/",
    icon: LayoutDashboard,
  },
  {
    name: "Gestión Académica",
    icon: GraduationCap,
    roles: ["admin", "secretaria", "profesor"],
    children: [
      { name: "Cursos", href: "/academico/cursos", icon: BookOpen, roles: ["admin", "secretaria"] },
      { name: "Alumnos", href: "/academico/alumnos", icon: Users, roles: ["admin", "secretaria"] },
      { name: "Asistencia", href: "/academico/asistencia", icon: Calendar, roles: ["admin", "secretaria", "profesor"] },
      { name: "Calificaciones", href: "/academico/calificaciones", icon: FileText, roles: ["admin", "secretaria", "profesor"] },
      { name: "Informes", href: "/academico/informes", icon: FileText, roles: ["admin", "secretaria", "profesor"] },
      { name: "Comunicaciones", href: "/academico/comunicaciones", icon: MessageSquare, roles: ["admin", "secretaria"] },
    ],
  },
  {
    name: "Gestión Financiera",
    icon: CreditCard,
    roles: ["admin", "secretaria"],
    children: [
      { name: "Pagos", href: "/financiero/pagos", icon: CreditCard, roles: ["admin", "secretaria"] },
    ],
  },
]

interface AppSidebarProps {
  userRole?: string
}

export function AppSidebar({ userRole = "secretaria" }: AppSidebarProps) {
  const pathname = usePathname()

  const filteredNavigation = navigation
    .filter((item) => !item.roles || item.roles.includes(userRole))
    .map((item) => ({
      ...item,
      children: item.children?.filter((child) => !child.roles || child.roles.includes(userRole)),
    }))

  return (
    <aside className="w-64 bg-sidebar text-sidebar-foreground flex flex-col min-h-screen">
      <div className="p-4 border-b border-sidebar-border">
        <Link href="/" className="flex items-center gap-3">
          <img
            src="/logo.png"
            alt="The English Club"
            className="w-12 h-12 object-contain"
          />
          <div>
            <h1 className="font-bold text-base leading-tight">The English</h1>
            <p className="font-bold text-base leading-tight">Club</p>
          </div>
        </Link>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {filteredNavigation.map((item) => (
          <div key={item.name}>
            {item.href ? (
              <Link
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  pathname === item.href
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground/80 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                )}
              >
                <item.icon className="w-5 h-5" />
                {item.name}
              </Link>
            ) : (
              <div className="mt-6 first:mt-0">
                <div className="flex items-center gap-2 px-3 py-2 text-xs font-semibold uppercase tracking-wider text-sidebar-foreground/50">
                  <item.icon className="w-4 h-4" />
                  {item.name}
                </div>
                <div className="mt-1 space-y-1">
                  {item.children?.map((child) => {
                    const isActive = pathname === child.href || pathname.startsWith(child.href + "/")
                    return (
                      <Link
                        key={child.href}
                        href={child.href!}
                        className={cn(
                          "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ml-2",
                          isActive
                            ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                            : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                        )}
                      >
                        <child.icon className="w-4 h-4" />
                        {child.name}
                        {isActive && <ChevronRight className="w-4 h-4 ml-auto" />}
                      </Link>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        ))}
      </nav>

      <div className="p-4 border-t border-sidebar-border">
        <div className="px-3 py-2 text-xs text-sidebar-foreground/50">
          The English Club - Manager v1.0
        </div>
      </div>
    </aside>
  )
}
