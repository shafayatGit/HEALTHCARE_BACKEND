import { NextFunction, Request, Response } from "express";
import { Role, UserStatus } from "../../generated/prisma/enums";
import { cookieUtils } from "../utils/cookie";
import AppError from "../errorHelpers/AppError";
import status from "http-status";
import { prisma } from "../lib/prisma";
import { jwtUtils } from "../utils/jwt";
import { envVars } from "../config/env";

export const checkAuth =
  (...authRoles: Role[]) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      //Checking thr session token first
      const sessionToken = cookieUtils.getCookie(
        req,
        "better-auth.session_token",
      );
      if (!sessionToken) {
        throw new AppError(
          status.UNAUTHORIZED,
          "Unauthorized - Session token missing",
        );
      }
      if (sessionToken) {
        const sessionExistInDb = await prisma.session.findFirst({
          where: {
            token: sessionToken,
            expiresAt: {
              gt: new Date(),
            },
          },
          include: {
            user: true,
          },
        });

        if (sessionExistInDb && sessionExistInDb.user) {
          const user = sessionExistInDb.user;

          const now = new Date();
          const expiresAt = new Date(sessionExistInDb.expiresAt);
          const createdAt = new Date(sessionExistInDb.createdAt);

          const sessionLifeTime = expiresAt.getTime() - createdAt.getTime();
          const timeRemaining = expiresAt.getTime() - now.getTime();
          const percentageTimeRemaining =
            (timeRemaining / sessionLifeTime) * 100;

          if (percentageTimeRemaining < 20) {
            res.setHeader("X-Session-Refresh", "true");
            res.setHeader("X-Session-Expires-At", expiresAt.toISOString());
            res.setHeader("X-Time-Remaining", timeRemaining.toString());

            console.log("Session Expiring Soon");
          }

          if (
            user.status === UserStatus.BLOCKED ||
            user.status === UserStatus.DELETED
          ) {
            throw new AppError(
              status.FORBIDDEN,
              "Your account is blocked or deleted. Please contact support.",
            );
          }
          if (user.isDeleted) {
            throw new AppError(
              status.FORBIDDEN,
              "Your account is deleted. Please contact support.",
            );
          }
          if (authRoles.length > 0 && !authRoles.includes(user.role as Role)) {
            console.log(authRoles, user.role);
            throw new AppError(
              status.FORBIDDEN,
              "Forbidden, you don't have permission to access this resource.",
            );
          }
          req.user = {
            userId: user.id,
            role: user.role as Role,
            email: user.email,
          };
        }
      }

      // If session token is not valid, then check for access token
      const accessToken = cookieUtils.getCookie(req, "accessToken");
      if (!accessToken) {
        throw new AppError(
          status.UNAUTHORIZED,
          "Unauthorized - Access token missing",
        );
      }

      // Verify access token and check user role
      const verifiedToken = jwtUtils.verifyToken(
        accessToken,
        envVars.ACCESS_TOKEN_SECRET,
      );
      //   console.log(verifiedToken.decoded?.role)
      if (!verifiedToken.success) {
        throw new AppError(
          status.UNAUTHORIZED,
          "Unauthorized - Invalid access token",
        );
      }
      if (
        authRoles.length > 0 &&
        !authRoles.includes(verifiedToken.decoded?.role as Role)
      ) {
        throw new AppError(
          status.FORBIDDEN,
          "Forbidden - Insufficient permissions",
        );
      }
      next();
    } catch (error) {
      next(error);
    }
  };
