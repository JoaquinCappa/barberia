# Agenda — SaaS de reservas para barberías

MVP multi-tenant basado en Next.js App Router, TypeScript estricto, Tailwind CSS, PostgreSQL y Prisma.

## Arquitectura

Una única aplicación maneja múltiples negocios. `Business` es el límite de tenant: todos los recursos de dominio (`Barber`, `Service`, `BusinessHours`, `BlockedTime`, `Customer` y `Booking`) guardan un `businessId`. Las consultas privadas de las siguientes etapas siempre partirán del negocio del usuario autenticado y filtrarán por ese ID en el servidor.

`Booking` conserva hora de inicio y fin, servicio, barbero, cliente y estado. En la etapa del motor de disponibilidad se validarán solapamientos dentro de una transacción, sin depender del cliente.

La autenticación usa Auth.js con credenciales, hash de contraseña con bcrypt y sesiones JWT. No hay registro ni UI de login aún: se incorporan junto con el CRUD de negocio en la etapa 2.

## Desarrollo local

1. Copiá `.env.example` a `.env` y generá `NEXTAUTH_SECRET`.
2. Iniciá PostgreSQL: `docker compose up -d`.
3. Instalá dependencias: `npm install`.
4. Generá el cliente y aplicá la primera migración: `npm run db:generate` y `npm run db:migrate -- --name init`.
5. Ejecutá `npm run dev`.

## Verificación

- `npm run lint`
- `npx tsc --noEmit`
- `npm run build`
- `npm test`

## Alcance actual

La etapa 1 deja el proyecto, el esquema multi-tenant, el entorno PostgreSQL, Prisma y la base de autenticación. Siguen los CRUD autenticados, el motor de disponibilidad, el dashboard, el flujo público y los tests de dominio.
