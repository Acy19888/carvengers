import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Bitte gültige E-Mail eingeben"),
  password: z.string().min(6, "Passwort muss mindestens 6 Zeichen haben"),
});

export type LoginFormData = z.infer<typeof loginSchema>;

export const signupSchema = z
  .object({
    email: z.string().email("Bitte gültige E-Mail eingeben"),
    password: z.string().min(6, "Passwort muss mindestens 6 Zeichen haben"),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwörter stimmen nicht überein",
    path: ["confirmPassword"],
  });

export type SignupFormData = z.infer<typeof signupSchema>;
