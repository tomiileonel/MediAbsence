"use client";

import Link from "next/link";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { loginAction, type LoginState } from "@/app/actions/auth";

const initialState: LoginState = { error: null };

function LoginSubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button className="w-full" type="submit" disabled={pending}>
      {pending ? "Ingresando…" : "Ingresar"}
    </Button>
  );
}
export default function LoginPage() {
  const [state, formAction] = useActionState(loginAction, initialState);

  return (
    <main className="flex min-h-screen items-center justify-center bg-muted/20 px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Ingresar a MediAbsence</CardTitle>
          <CardDescription>
            Usa las credenciales asignadas por el área de administración.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={formAction} className="space-y-5" noValidate>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                inputMode="email"
                aria-describedby="email-help"
              />
              <p id="email-help" className="text-xs text-muted-foreground">
                El email no distingue mayúsculas de minúsculas.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
              />
            </div>

            {state.error ? (
              <p className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive" role="alert">
                {state.error}
              </p>
            ) : null}

            <LoginSubmitButton />
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            <Link className="underline underline-offset-4 hover:text-foreground" href="/">
              Volver al inicio
            </Link>
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
