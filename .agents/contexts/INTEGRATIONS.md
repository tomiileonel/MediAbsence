# Integrations Context — MediAbsence

## Providers

| Provider | Purpose | Trust boundary | Auth method | Criticality |
|---|---|---|---|---|
| PostgreSQL (Neon Serverless) | Almacenamiento relacional transaccional y pistas de auditoría | Red interna / VPC segura | Connection string TLS (`DATABASE_URL`) | Bloqueante |
| Auth.js Credentials Provider | Autenticación interna institucional | Servidor Next.js (Node.js runtime) | bcrypt hash verification | Bloqueante |

## Secrets
- `DATABASE_URL`: Cadena de conexión segura a PostgreSQL.
- `AUTH_SECRET`: Secreto criptográfico para firma y cifrado de JWTs de sesión.

## External API behavior
- Base de datos: pooling de conexiones gestionado por Prisma.
- Timeout de conexión: 10s en serverless.
