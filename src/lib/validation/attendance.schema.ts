import { z } from "zod";

export const attendanceLocationSchema = z
  .string()
  .trim()
  .max(500, "La ubicación no puede superar los 500 caracteres.")
  .optional()
  .nullable();
