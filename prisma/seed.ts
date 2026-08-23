import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const seedUsers: ReadonlyArray<{
  email: string;
  name: string;
  role: Role;
}> = [
  { email: "admin@mediabsence.local", name: "Administrador", role: Role.ADMIN },
  { email: "jefe@mediabsence.local", name: "Jefe de servicio", role: Role.JEFE },
  { email: "profesional@mediabsence.local", name: "Profesional de salud", role: Role.PROFESIONAL },
  { email: "residente@mediabsence.local", name: "Residente", role: Role.RESIDENTE },
];

async function main(): Promise<void> {
  const seedPassword = process.env.SEED_PASSWORD?.trim();

  if (!seedPassword || seedPassword.length < 12) {
    throw new Error("SEED_PASSWORD es obligatoria y debe tener al menos 12 caracteres.");
  }

  const passwordHash = await bcrypt.hash(seedPassword, 12);

  for (const user of seedUsers) {
    await prisma.user.upsert({
      where: { email: user.email },
      update: {
        name: user.name,
        password: passwordHash,
        role: user.role,
      },
      create: {
        email: user.email,
        name: user.name,
        password: passwordHash,
        role: user.role,
      },
    });
  }
}

main()
  .catch((error: unknown) => {
    const errorType = error instanceof Error ? error.name : "UnknownError";
    console.error(`No se pudo ejecutar el seed de MediAbsence (${errorType}).`);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
