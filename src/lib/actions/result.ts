import { getActionErrorMessage } from "@/lib/errors/domain-error";

export type ActionResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string };

export function actionOk<T>(data: T): ActionResult<T> {
  return { ok: true, data };
}

export function actionFailed(error: unknown): ActionResult<never> {
  return { ok: false, error: getActionErrorMessage(error) };
}
