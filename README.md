# MediAbsence 🏥

**MediAbsence** es una plataforma web desarrollada para la gestión eficiente de asistencias e inasistencias de médicos residentes. El sistema permite a los administradores llevar un control estricto de las faltas, mientras que los residentes pueden visualizar su historial de asistencia y el impacto económico (deducciones) que estas inasistencias generan en su salario.

## 🚀 Características Principales

* **Autenticación y Autorización Basada en Roles:** Sistema de login seguro diferenciando accesos y vistas para Administradores y Residentes.
* **Dashboard de Administración:** 
  * Alta y baja de usuarios (Residentes).
  * Registro y gestión de inasistencias con carga de motivos/notas.
* **Dashboard de Residentes:** 
  * Visualización del historial de inasistencias.
  * Cálculo automático y visualización de deducciones salariales estimadas por días de ausencia.
* **Seguridad:** Mutaciones y consultas a la base de datos protegidas íntegramente mediante **Server Actions**, asegurando que la lógica de negocio se ejecute de forma segura en el servidor.
* **UI/UX Moderna:** Interfaz limpia, responsiva y con animaciones fluidas para una experiencia de usuario de alta calidad.

## 🛠️ Stack Tecnológico

Este proyecto está construido con las últimas herramientas del ecosistema de React:

* **Framework:** [Next.js](https://nextjs.org/) (App Router)
* **Librería UI:** [React 19](https://react.dev/) (Aprovechando Server Components y Server Actions nativos)
* **Lenguaje:** TypeScript
* **Estilos:** [Tailwind CSS v4](https://tailwindcss.com/) + Shadcn/UI + tw-animate-css
* **Base de Datos & ORM:** [Prisma](https://www.prisma.io/)
* **Autenticación:** [Next-Auth v5](https://authjs.dev/) (Auth.js)
* **Criptografía:** bcryptjs (Hash de contraseñas)

## ⚙️ Instalación y Configuración Local

Para correr este proyecto en tu entorno local, sigue estos pasos:

1. **Clonar el repositorio:**
   ```bash
   git clone https://github.com/tu-usuario/mediabsence.git
   cd mediabsence
   ```

2. **Instalar las dependencias:**
   ```bash
   npm install
   # o
   pnpm install
   ```

3. **Configurar las variables de entorno:**
   Crea un archivo `.env` en la raíz del proyecto y agrega tu URL de conexión a la base de datos y tu secreto de autenticación:
   ```env
   DATABASE_URL="mysql://usuario:password@localhost:3306/mediabsence"
   AUTH_SECRET="tu_secreto_generado_aqui"
   ```

4. **Sincronizar la base de datos:**
   ```bash
   npx prisma db push
   # o si prefieres usar migraciones:
   npx prisma migrate dev
   ```

5. **Iniciar el servidor de desarrollo:**
   ```bash
   npm run dev
   # o
   pnpm dev
   ```

Abre `http://localhost:3000` en tu navegador para ver la aplicación en funcionamiento.

## 📂 Arquitectura Destacada

El proyecto destaca por la separación de responsabilidades utilizando la arquitectura de App Router de Next.js. Las operaciones críticas de base de datos se manejan a través de Server Actions (`src/app/actions/...`), lo que elimina la necesidad de crear rutas de API tradicionales para las mutaciones de datos, reduciendo el código boilerplate y mejorando el rendimiento y la seguridad.

---

<div align="center">
  <h2><b>❬ LR ❭</b></h2>
  <p>&copy; 2026 <b>Tomás Leonel Ramón</b>. Todos los derechos reservados.</p>
  <p><i>El código fuente, diseño y arquitectura de este proyecto son de propiedad exclusiva. </i></p>
</div>
