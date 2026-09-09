import { Suspense } from "react";
import CrearNegocioForm from "./CrearNegocioForm";

export default function CrearNegocioPage() {
  return (
    <Suspense fallback={null}>
      <CrearNegocioForm />
    </Suspense>
  );
}