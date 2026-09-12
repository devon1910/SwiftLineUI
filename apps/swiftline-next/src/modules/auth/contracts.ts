import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().trim().email().max(256),
  password: z.string().min(1).max(4096),
});

export const refreshSchema = z.object({
  accessToken: z.string().max(16_384).optional(),
  refreshToken: z.string().min(32).max(512),
});

export const signupSchema = z.object({
  email: z.string().trim().email().max(256), password: z.string().min(6).max(4096),
  fullName: z.string().trim().min(1).max(256),
  hasAgreedToTermsOfServiceAndPrivacyPolicy: z.literal(true),
});
export const verificationSchema = z.object({ token: z.string().min(32).max(512) });

export type AuthResponse = {
  status: boolean;
  message: string;
  accessToken: string;
  refreshToken: string;
  userId: string;
  email: string;
  username: string;
  purpose: string;
  isNewUser: boolean;
};

export const failedAuthResponse = (message: string): AuthResponse => ({
  status: false, message, accessToken: "", refreshToken: "", userId: "",
  email: "", username: "", purpose: "Login", isNewUser: false,
});
