"use client";

import toast from "react-hot-toast";
import { Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SHARE_PLATFORMS,
  buildAthleteShareLink,
  type SharePlatform,
} from "@/lib/utils/athleteShareLink";

interface AthleteShareLinksProps {
  athleteSlug: string;
}

export default function AthleteShareLinks({ athleteSlug }: AthleteShareLinksProps) {
  const handleCopy = async (platform: SharePlatform, label: string) => {
    const url = buildAthleteShareLink(athleteSlug, platform);
    try {
      await navigator.clipboard.writeText(url);
      toast.success(`${label} link copied`);
    } catch {
      toast.error("Could not copy");
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Share2 className="h-4 w-4" />
          Share
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {SHARE_PLATFORMS.map((p) => (
          <DropdownMenuItem
            key={p.key}
            onSelect={() => handleCopy(p.key, p.label)}
          >
            {p.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
