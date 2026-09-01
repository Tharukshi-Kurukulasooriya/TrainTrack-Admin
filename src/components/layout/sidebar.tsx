import { useMemo } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { ChevronDown, LogOut, Settings, ShieldCheck, User } from "lucide-react";
import { toast } from "sonner";
import { sidebarItems } from "@/lib/data/sidebar-data";
import { useAppStore } from "@/lib/data/store";
import { useAuthStore } from "@/lib/authStore";
import { cn, formatNumber, initials } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sidebar as SidebarContainer,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

function Wordmark() {
  return (
    <Link
      to="/"
      className="flex items-center gap-3 px-3 py-1 group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:justify-center"
    >
      <span className="flex size-8 items-center justify-center rounded-md bg-accent/15 text-accent shrink-0">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500" width="500" height="500">
          <path
            d="M334.96 67.31C397.19 60.57 408.94 154.92 346.26 163.74C283.08 172.62 271.14 74.21 334.96 67.31ZM491.81 302.28C492.06 305.96 492.3 309.64 492.54 313.32C492.22 319.3 491.9 325.29 491.57 331.28C486.38 308.09 479.83 288.89 463.64 270.84C450.36 256.02 431.52 246.45 412.54 241.64C361.33 228.66 314.76 256.59 292.01 301.34C287.05 311.09 284.93 323.66 284.19 334.47C280.5 388.96 319.2 437.8 373.4 445.92C387.68 448.05 404.13 446.69 417.82 442.25C423.83 440.29 438.86 431.47 443.15 431.13C442.31 435.06 434.56 438.49 431.65 441.02C420.12 451.01 405.06 456.68 391.01 461.98C336.03 482.74 272.58 462.94 233.34 421.67C225.16 413.07 218.03 402.76 212.41 392.39C209.97 387.89 207.48 377.13 203.59 374.42C203.28 370.47 201.03 366.59 199.95 362.8C197.34 353.61 195.42 343.97 194.5 334.47C193.57 324.95 193.39 314.8 194.69 305.3C195.69 297.96 198.13 290.23 198.17 282.82C200.67 280.45 201.37 273.95 202.4 270.64C205.28 261.47 210.06 251.85 215.15 243.69C217.25 240.32 223.08 234.49 223.29 230.68C226.75 227.89 229.14 223.76 232.13 220.48C239.51 212.41 247.9 204.47 256.99 198.33C267.15 191.48 277.84 185.85 289.08 181.08C293.63 179.16 298.86 178.45 303.17 175.97C323.13 173.89 341.5 169.91 361.87 172.19C411.75 177.79 459.22 212.51 479.24 258.42C485.49 272.76 487.66 287.38 491.81 302.28Z"
            fill="#fd8a13"
            fillRule="evenodd"
            stroke="#fd8a13"
            strokeWidth="0.25"
            strokeLinejoin="round"
          />
          <path
            d="M303.17 175.97C298.86 178.45 293.63 179.16 289.08 181.08C277.84 185.85 267.15 191.48 256.99 198.33C247.9 204.47 239.51 212.41 232.13 220.48C229.14 223.76 226.75 227.89 223.29 230.68C163.19 202.03 141.81 132.99 167.9 73.17C172.88 61.76 193.63 31.59 205.81 28.08C204.9 32.55 199.49 38.04 197.06 42.02C190.46 52.78 184.94 67.18 183.79 79.87C182.92 89.39 182.95 99.63 185.02 108.88C193.06 144.87 227.96 165.81 261.61 173.74C275.33 176.97 289.26 176.07 303.17 175.97ZM198.17 282.82C198.13 290.23 195.69 297.96 194.69 305.3C193.39 314.8 193.57 324.95 194.5 334.47C195.42 343.97 197.34 353.61 199.95 362.8C201.03 366.59 203.28 370.47 203.59 374.42C187.07 366.01 171.27 356.63 152.64 353.14C107.53 344.69 58.87 361.24 32.3 400.09C25.53 409.98 18.14 420.29 14.05 431.68C12.4 436.26 9.96 447.2 6.16 450.08C1.18 434.37 11.3 399.71 16.99 384.31C44 311.28 122.13 270.63 198.17 282.82Z"
            fill="#1cadb3"
            fillRule="evenodd"
            stroke="#1cadb3"
            strokeWidth="0.25"
            strokeLinejoin="round"
          />
        </svg>
      </span>
      <span className="flex flex-col leading-none group-data-[collapsible=icon]:hidden">
        <span className="font-display text-lg tracking-tight">TrainTrack</span>
        <span className="text-[10px] tracking-[0.15em] text-muted-foreground uppercase">Admin</span>
      </span>
    </Link>
  );
}

export function Sidebar({
  pathname,
  onNavigate,
  isMobile = false,
}: {
  pathname: string;
  onNavigate?: () => void;
  isMobile?: boolean;
}) {
  const navigate = useNavigate();
  const connection = useAppStore((s) => s.connection);
  const trainings = useAppStore((s) => s.trainings);
  const users = useAppStore((s) => s.users);
  const achievements = useAppStore((s) => s.achievements);
  const admins = useAuthStore((s) => s.admins);
  const currentAdmin = useAuthStore((s) => s.currentAdmin);
  const logout = useAuthStore((s) => s.logout);
  const live = connection.catalog === "firebase";

  const adminName = currentAdmin?.name || "Admin User";
  const adminEmail = currentAdmin?.email || "admin@traintrack.com";
  const adminRole = currentAdmin?.role || "admin";
  const isSuperAdmin = adminRole === "super_admin";

  // calculate dynamic count mapping
  const counts = useMemo(() => {
    const totalReviews = trainings.reduce((acc, t) => acc + (t.reviews?.length || 0), 0);
    return {
      trainings: trainings.length,
      users: users.length,
      reviews: totalReviews,
      achievements: achievements.length,
      admins: admins.length,
    };
  }, [trainings, users, achievements, admins]);

  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully.");
    if (onNavigate) onNavigate();
    void navigate({ to: "/login" });
  };

  return (
    <SidebarContainer
      collapsible={isMobile ? "none" : "icon"}
      className={isMobile ? "w-full h-full" : undefined}
    >
      <SidebarHeader className="px-3 pt-3 pb-2 group-data-[collapsible=icon]:px-1 group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:justify-center">
        <Wordmark />
      </SidebarHeader>

      <SidebarContent className="py-2">
        {sidebarItems.map((group, index) => (
          <SidebarGroup key={index}>
            {group.label && <SidebarGroupLabel>{group.label}</SidebarGroupLabel>}
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => {
                  const active =
                    item.href === "/"
                      ? pathname === "/"
                      : pathname === item.href || pathname.startsWith(`${item.href}/`);
                  const count = item.countKey ? counts[item.countKey] : item.badge;

                  return (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton
                        asChild
                        isActive={active}
                        tooltip={item.title}
                        onClick={onNavigate}
                      >
                        <Link to={item.href}>
                          <item.icon className="size-4 shrink-0" />
                          <span className="group-data-[collapsible=icon]:hidden">{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                      {count !== undefined && (
                        <SidebarMenuBadge>{formatNumber(Number(count) || 0)}</SidebarMenuBadge>
                      )}
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter className="p-3 group-data-[collapsible=icon]:p-1.5 group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:justify-center">
        <DropdownMenu>
          <DropdownMenuTrigger className="w-full flex items-center justify-between gap-2 rounded-lg border border-sidebar-border/80 bg-card/60 p-2.5 text-left transition-all duration-150 hover:bg-card hover:border-sidebar-border focus:outline-none focus:ring-2 focus:ring-accent/40 cursor-pointer group-data-[collapsible=icon]:p-1 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:border-transparent group-data-[collapsible=icon]:bg-transparent group-data-[collapsible=icon]:hover:bg-accent/10">
            <div className="flex items-center gap-2.5 min-w-0 group-data-[collapsible=icon]:gap-0 group-data-[collapsible=icon]:justify-center">
              <div className="relative flex size-9 shrink-0 items-center justify-center">
                <div className="flex size-9 items-center justify-center rounded-lg bg-accent/15 text-xs font-bold text-accent shadow-sm overflow-hidden">
                  {currentAdmin?.avatarUrl ? (
                    <img
                      src={currentAdmin.avatarUrl}
                      alt={adminName}
                      className="size-full object-cover"
                    />
                  ) : (
                    initials(adminName)
                  )}
                </div>
                <span className="absolute -right-0.5 -top-0.5 z-10 flex size-2.5">
                  {live && (
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-75" />
                  )}
                  <span
                    className={cn(
                      "relative inline-flex size-2.5 rounded-full ring-2 ring-background",
                      live ? "bg-accent" : "bg-muted-foreground",
                    )}
                  />
                </span>
              </div>
              <div className="min-w-0 flex-1 group-data-[collapsible=icon]:hidden">
                <p className="truncate text-xs font-semibold text-foreground leading-tight">
                  {adminName}
                </p>
                <p className="truncate text-[10px] text-muted-foreground capitalize">
                  {adminRole === "super_admin" ? "Super Admin" : adminRole}
                </p>
              </div>
            </div>
            <ChevronDown className="size-4 shrink-0 text-muted-foreground group-data-[collapsible=icon]:hidden" />
          </DropdownMenuTrigger>

          <DropdownMenuContent side="right" align="end" sideOffset={8}>
            <DropdownMenuLabel>
              <div className="flex items-center gap-3">
                <div className="relative flex size-10 shrink-0">
                  <div className="flex size-10 items-center justify-center rounded-md bg-accent/10 overflow-hidden">
                    {currentAdmin?.avatarUrl ? (
                      <img
                        src={currentAdmin.avatarUrl}
                        alt={adminName}
                        className="size-full object-cover"
                      />
                    ) : (
                      initials(adminName)
                    )}
                  </div>
                </div>
                <div className="flex flex-col min-w-0 flex-1 gap-0.5">
                  <div className="flex items-center justify-between gap-1.5">
                    <p className="text-sm font-bold text-foreground truncate leading-tight">
                      {adminName}
                    </p>
                  </div>
                  <p className="text-xs text-muted-foreground truncate leading-tight">
                    {adminEmail}
                  </p>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />

            {isSuperAdmin ? (
              <DropdownMenuItem
                onClick={() => {
                  if (onNavigate) onNavigate();
                  void navigate({ to: "/admins" });
                }}
              >
                <User className="size-4 text-muted-foreground shrink-0" />
                <span className="text-[13px] text-foreground">Manage Admin Accounts</span>
              </DropdownMenuItem>
            ) : null}

            <DropdownMenuItem
              onClick={() => {
                if (onNavigate) onNavigate();
                void navigate({ to: "/settings" });
              }}
            >
              <Settings className="size-4 text-muted-foreground shrink-0" />
              <span className="text-[13px] text-foreground">Settings & Appearance</span>
            </DropdownMenuItem>

            <DropdownMenuItem>
              <ShieldCheck className="size-4 text-muted-foreground shrink-0" />
              <span className="text-[13px] text-muted-foreground">
                Role:{" "}
                <span className="text-foreground">{isSuperAdmin ? "Super Admin" : adminRole}</span>
              </span>
            </DropdownMenuItem>

            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleLogout}
              variant="destructive"
              className="focus:bg-destructive/10"
            >
              <LogOut className="size-4 shrink-0" />
              <span className="text-[13px] font-semibold">Sign Out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <div className="px-2 group-data-[collapsible=icon]:hidden">
          <p className="pt-2 text-[10px] text-muted-foreground">
            &copy; {new Date().getFullYear()} TrainTrack. All rights reserved
          </p>
        </div>
      </SidebarFooter>
    </SidebarContainer>
  );
}

export default Sidebar;
