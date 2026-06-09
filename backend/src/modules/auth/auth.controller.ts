import { Request, Response } from 'express';
import * as authService from './auth.service';

export async function register(req: Request, res: Response) {
  const result = await authService.register(req.body);
  res.status(201).json({ success: true, data: result });
}

export async function login(req: Request, res: Response) {
  const { email, password } = req.body;
  const result = await authService.login(email, password);
  res.json({ success: true, data: result });
}

export async function verifyEmail(req: Request, res: Response) {
  const result = await authService.verifyEmail(req.body.token);
  res.json({ success: true, data: result });
}

export async function resendVerification(req: Request, res: Response) {
  const result = await authService.resendVerification(req.body.email);
  res.json({ success: true, data: result });
}

export async function forgotPassword(req: Request, res: Response) {
  const result = await authService.forgotPassword(req.body.email);
  res.json({ success: true, data: result });
}

export async function resetPassword(req: Request, res: Response) {
  const result = await authService.resetPassword(req.body.token, req.body.password);
  res.json({ success: true, data: result });
}

export async function refresh(req: Request, res: Response) {
  const result = await authService.refresh(req.body.refreshToken);
  res.json({ success: true, data: result });
}

export async function me(req: Request, res: Response) {
  const result = await authService.getMe(req.user!.id);
  res.json({ success: true, data: result });
}
