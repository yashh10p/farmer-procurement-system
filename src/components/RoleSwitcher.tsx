"use client";

import { useAppStore } from "@/store";
import { Role } from "@/types";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { UserCircle2 } from "lucide-react";

export function RoleSwitcher() {
  const currentRole = useAppStore((state) => state.currentRole);
  const setCurrentRole = useAppStore((state) => state.setCurrentRole);

  const roles: Role[] = ["Farmer", "CentreManager", "DistrictOfficer", "GateGuard", "QualityLab", "PublicDisplay"];

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <DropdownMenu>
        <DropdownMenuTrigger className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground h-8 px-3 py-1 shadow-lg border-primary/20">
            <UserCircle2 className="w-4 h-4 mr-2" />
            <span className="font-medium text-xs">Demo: {currentRole}</span>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuGroup>
            <DropdownMenuLabel className="text-xs text-muted-foreground uppercase">Switch Role</DropdownMenuLabel>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          {roles.map((role) => (
            <DropdownMenuItem 
              key={role} 
              onClick={() => setCurrentRole(role)}
              className={currentRole === role ? "bg-primary/10 font-bold" : ""}
            >
              {role}
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => window.location.reload()} className="text-destructive font-medium">
            Reset Demo State
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
