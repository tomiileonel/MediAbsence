"use server";

import { AuthError } from "next-auth";
import { z } from "zod";
import { signIn } from "../../../auth";
import {
  assertLoginAllowed,
  registerFailedLogin,
  clearLoginFailures,
} from "@/lib/security/login-throttle";
import { ValidationError } from "@/lib/errors/domain-error";

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
    assertLoginAllowed(parsedInput.data.email);
  } catch (error: unknown) {
    if (error instanceof ValidationError) {
      return { error: error.message };
    }
    throw error;
  }

  try {
    await signIn("credentials", {
      email: parsedInput.data.email,
      password: parsedInput.data.password,
      redirectTo: "/",
    });
  } catch (error: unknown) {
    if (error instanceof AuthError) {
      registerFailedLogin(parsedInput.data.email);
      return { error: "Las credenciales no son válidas." };
    }

    clearLoginFailures(parsedInput.data.email);
    throw error;
  }

  clearLoginFailures(parsedInput.data.email);
  return { error: null };
}
