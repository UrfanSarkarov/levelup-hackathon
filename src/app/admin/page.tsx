"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AdminRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/lup-secure-panel");
  }, [router]);

  return (
    <div className="min-h-screen bg-[#F5F7FA] flex items-center justify-center">
      <div className="text-[#718096]">Yönləndirilir...</div>
    </div>
  );
}
