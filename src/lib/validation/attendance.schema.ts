import { z } from "zod";

export const attendanceLocationSchema = z
  .string()
  .trim()
  .max(500, "La ubicación no puede superar los 500 caracteres.")
  .transform((val) => (val && val.length > 0 ? val : undefined))
  .optional()
  .nullable();

