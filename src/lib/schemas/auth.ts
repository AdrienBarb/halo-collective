import { z } from "zod";

export type AuthTranslate = (key: string) => string;

function buildPasswordSchema(t: AuthTranslate) {
  return z
    .string()
    .min(8, t("passwordMin"))
    .max(128, t("passwordMax"));
}

function buildEmailSchema(t: AuthTranslate) {
  return z
    .string()
    .trim()
    .toLowerCase()
    .email(t("invalidEmail"))
    .max(254);
}

function buildNameSchema(t: AuthTranslate) {
  return z.string().trim().min(1, t("required")).max(80);
}

export function createSignInSchema(t: AuthTranslate) {
  return z.object({
    email: buildEmailSchema(t),
    password: z.string().min(1, t("passwordRequired")).max(128),
  });
}

export function createSignUpSchema(t: AuthTranslate) {
  return z.object({
    firstName: buildNameSchema(t),
    lastName: buildNameSchema(t),
    email: buildEmailSchema(t),
    password: buildPasswordSchema(t),
  });
}

export function createForgotPasswordSchema(t: AuthTranslate) {
  return z.object({
    email: buildEmailSchema(t),
  });
}

export function createResetPasswordSchema(t: AuthTranslate) {
  return z
    .object({
      password: buildPasswordSchema(t),
      confirmPassword: z.string(),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: t("passwordsDontMatch"),
      path: ["confirmPassword"],
    });
}

export type SignInInput = z.input<ReturnType<typeof createSignInSchema>>;
export type SignUpInput = z.input<ReturnType<typeof createSignUpSchema>>;
export type ForgotPasswordInput = z.input<
  ReturnType<typeof createForgotPasswordSchema>
>;
export type ResetPasswordInput = z.input<
  ReturnType<typeof createResetPasswordSchema>
>;
