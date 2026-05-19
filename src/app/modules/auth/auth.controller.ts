import { Request, Response } from "express";
import { catchAsync } from "../../shared/catchAsync";
import { AuthService } from "./auth.service";
import { sendResponse } from "../../shared/sendResponse";
import status from "http-status";
import { tokenUtils } from "../../utils/token";
import { cookieUtils } from "../../utils/cookie";

const registerPatient = catchAsync(async (req: Request, res: Response) => {
  const payload = req.body;

  const result = await AuthService.registerPatient(payload);
  const { accessToken, refreshToken, token, ...userData } = result;
  tokenUtils.setAccessTokenCookie(res, accessToken);
  tokenUtils.setRefreshTokenCookie(res, refreshToken);
  tokenUtils.setBetterAuthSessionCookie(res, token as string);
  sendResponse(res, {
    httpStatusCode: status.CREATED,
    success: true,
    message: "Patient Registered Successfully",
    data: {
      token,
      accessToken,
      refreshToken,
      user: userData,
    },
  });
});

const loginUser = catchAsync(async (req: Request, res: Response) => {
  const payload = req.body;
  const result = await AuthService.loginUser(payload);

  const { accessToken, refreshToken, token, ...userData } = result;
  tokenUtils.setAccessTokenCookie(res, accessToken);
  tokenUtils.setRefreshTokenCookie(res, refreshToken);
  tokenUtils.setBetterAuthSessionCookie(res, token);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "User logged in successfully",
    data: {
      token,
      accessToken,
      refreshToken,
      user: userData,
    },
  });
});

const getMe = catchAsync(async (req: Request, res: Response) => {
  const user = req.user;
  const result = await AuthService.getMe(user);
  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "User retrieved successfully",
    data: result,
  });
});

const getNewToken = catchAsync(async (req: Request, res: Response) => {
  const refreshToken = req.cookies.refreshToken;
  const cookieSessionToken = req.cookies["better-auth.session_token"];
  const result = await AuthService.getNewToken(
    refreshToken,
    cookieSessionToken,
  );

  const {
    accessToken,
    refreshToken: newRefreshToken,
    sessionToken,
    ...userData
  } = result;
  tokenUtils.setAccessTokenCookie(res, accessToken);
  tokenUtils.setRefreshTokenCookie(res, newRefreshToken);
  tokenUtils.setBetterAuthSessionCookie(res, sessionToken);
  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "New token generated successfully",
    data: {
      sessionToken,
      accessToken,
      refreshToken: newRefreshToken,
      user: userData,
    },
  });
});

const changePassword = catchAsync(async (req: Request, res: Response) => {
  const payload = req.body;
  const betterAuthSessionToken = req.cookies["better-auth.session_token"];
  const result = await AuthService.changePassword(
    payload,
    betterAuthSessionToken,
  );

  const { accessToken, refreshToken, token } = result;
  tokenUtils.setAccessTokenCookie(res, accessToken);
  tokenUtils.setRefreshTokenCookie(res, refreshToken);
  tokenUtils.setBetterAuthSessionCookie(res, token as string);
  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Password changed successfully",
    data: result,
  });
});

const verifyEmail = catchAsync(async (req: Request, res: Response) => {
  const { email, otp } = req.body;
  const result = await AuthService.verifyEmail(email, otp);
  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Email verified successfully",
  });
});

const forgetPassword = catchAsync(async (req: Request, res: Response) => {
  const { email } = req.body;
  const result = await AuthService.forgetPassword(email);
  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Password reset email sent successfully",
  });
});

const resetPassword = catchAsync(async (req: Request, res: Response) => {
  const { email, otp, newPassword } = req.body;
  const result = await AuthService.resetPassword(email, otp, newPassword);
  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Password reset successfully",
  });
});

const logOutUser = catchAsync(async (req: Request, res: Response) => {
  const sessionToken = req.cookies["better-auth.session_token"];
  const result = await AuthService.logOutUser(sessionToken);
  cookieUtils.clearCookie(res, "accesstoken", {
    httpOnly: true,
    secure: true,
    sameSite: "none",
  });
  cookieUtils.clearCookie(res, "refreshToken", {
    httpOnly: true,
    secure: true,
    sameSite: "none",
  });
  cookieUtils.clearCookie(res, "better-auth.session_token", {
    httpOnly: true,
    secure: true,
    sameSite: "none",
  });
  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "User logged out successfully",
    data: result,
  });
});

const googleLogin = catchAsync(async (req: Request, res: Response) => {
  const result = await AuthService.googleLogin();
  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Google login successful",
    data: result,
  });
});

const googleLoginSuccess = catchAsync(async (req: Request, res: Response) => {
  const result = await AuthService.googleLoginSuccess();
  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Google login successful",
    data: result,
  });
});

const handleOAuthError = catchAsync(async (req: Request, res: Response) => {
  const result = await AuthService.handleOAuthError();
  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "OAuth error handled",
    data: result,
  });
});
export const AuthController = {
  registerPatient,
  loginUser,
  getMe,
  getNewToken,
  changePassword,
  verifyEmail,
  forgetPassword,
  resetPassword,
  logOutUser,
  googleLogin,
  googleLoginSuccess,
  handleOAuthError,
};
