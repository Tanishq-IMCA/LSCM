"use client";

import { useState } from "react";
import { SiteHeader } from "@/components/site-header";
import { fetchMarketplace } from "@/lib/api";
import MarketplaceContent from "@/components/marketplace-content";
import { useQuery } from "@tanstack/react-query";

export default function MarketplacePage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { data: items = [] } = useQuery({
    queryKey: ["marketplace"],
    queryFn: fetchMarketplace,
  });

  return (
    <main>
      <SiteHeader
        current="marketplace"
        isSidebarOpen={isSidebarOpen}
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
      />
      <MarketplaceContent
        items={items}
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
      />
    </main>
  );
}