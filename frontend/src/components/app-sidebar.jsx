import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
} from "./ui/sidebar";
import { Users, UserPlus, UserCheck, LayoutDashboard } from "lucide-react";

export function AppSidebar() {
  const location = useLocation();

  const menuItems = [
    {
      title: "Dashboard",
      icon: LayoutDashboard,
      href: "/",
    },
    {
      title: "Leads",
      icon: Users,
      href: "/leads",
    },
    {
      title: "Add New Lead",
      icon: UserPlus,
      href: "/leads/create",
    },
    {
      title: "Employee",
      icon: UserCheck,
      href: "/employees",
    },
  ];

  // Active state check
  const isActive = (href) => {
    if (href === "/") {
      return location.pathname === "/";
    }
    return location.pathname.startsWith(href);
  };

  return (
    <Sidebar>
      {/* Sidebar Header with Logo */}
      <SidebarHeader className="border-b border-gray-200 pb-4 mb-4">
        <div className="flex items-center justify-center space-x-3 px-4 py-3">
          <div className="flex items-center justify-center w-10 h-10 bg-primary rounded-lg">
            <Users className="h-6 w-6 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-bold text-gray-900 leading-tight">
              Lead
            </span>
            <span className="text-lg font-bold text-primary leading-tight">
              Management
            </span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1 px-2">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);

                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={active}
                      className={`
                        w-full px-3 py-3 rounded-lg transition-all duration-200
                        ${
                          active
                            ? "bg-primary text-white shadow-md"
                            : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                        }
                      `}
                    >
                      <Link
                        to={item.href}
                        className="flex items-center space-x-3 no-underline"
                      >
                        <Icon
                          className={`h-5 w-5 ${
                            active ? "text-gray-900" : "text-gray-400"
                          }`}
                        />
                        <span className="font-medium text-sm">
                          {item.title}
                        </span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
