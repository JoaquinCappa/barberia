import { Suspense } from "react";
import InvitacionesPanel from "./InvitacionesPanel";
import { requirePlatformAdmin } from "@/lib/admin";

export default async function InvitacionesPage() {
  await requirePlatformAdmin();

  return (
    <Suspense fallback={null}>
      <InvitacionesPanel />
    </Suspense>
  );
}