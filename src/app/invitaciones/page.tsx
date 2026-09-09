import { Suspense } from "react";
import InvitacionesPanel from "./InvitacionesPanel";

export default function InvitacionesPage() {
  return (
    <Suspense fallback={null}>
      <InvitacionesPanel />
    </Suspense>
  );
}