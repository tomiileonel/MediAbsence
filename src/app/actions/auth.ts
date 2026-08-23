"use server";

import { AuthError } from "next-auth";
import { z } from "zod";
import { signIn } from "../../../auth";

const loginInputSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(1),
});

export interface LoginState {
  error: string | null;
}

export async function loginAction(
  _previousState: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const parsedInput = loginInputSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsedInput.success) {
    return { error: "Ingresa un email y una contraseña válidos." };
  }

  try {
    await signIn("credentials", {
      email: parsedInput.data.email,
      password: parsedInput.data.password,
      redirectTo: "/",
    });
  } catch (error: unknown) {
    if (error instanceof AuthError) {
      return { error: "Las credenciales no son válidas." };
    }

    throw error;
  }

  return { error: null };
}
