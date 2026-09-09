import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Limpiando base de datos...");

  await prisma.booking.deleteMany();
  await prisma.blockedTime.deleteMany();
  await prisma.businessHours.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.service.deleteMany();
  await prisma.barber.deleteMany();
  await prisma.account.deleteMany();
  await prisma.session.deleteMany();
  await prisma.verificationToken.deleteMany();
  await prisma.user.deleteMany();
  await prisma.business.deleteMany();

  console.log("Base de datos limpia.");
}

main()
  .catch((error) => {
    console.error("Error limpiando la base:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });