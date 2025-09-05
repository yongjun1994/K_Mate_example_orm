import { Controller, Get, Post, Req, Res, UseGuards, Body } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import type { Request, Response } from "express";
import { AuthService } from "./auth.service";
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from "@nestjs/swagger";


@ApiTags('auth')
@Controller("auth")
export class AuthController {
	constructor(private readonly authService: AuthService) {}

	// 1) 구글 로그인 시작 → 구글 로그인 페이지로 리다이렉트
	@Get("google")
	@UseGuards(AuthGuard("google"))
	@ApiOperation({ summary: 'Start Google OAuth login' })
	@ApiResponse({ status: 302, description: 'Redirects to Google login page' })
	async googleAuth() {}

	// 2) 콜백 처리 → upsert → JWT 발급 → 프론트 콜백 페이지로 리다이렉트
	@Get("google/callback")
	@UseGuards(AuthGuard("google"))
	@ApiOperation({ summary: 'Google OAuth callback' })
	@ApiResponse({ status: 302, description: 'Redirects to frontend with tokens' })
	async googleCallback(@Req() req: Request, @Res() res: Response) {
		const frontend = process.env.FRONTEND_URL!;
		try {
			const googleUser = req.user as any;
			const appUser = await this.authService.upsertUser(googleUser);
			const { accessToken, refreshToken } = await this.authService.issueJwt(appUser);

			// (A-1) 쿼리스트링으로 프론트에 전달
			const url = new URL("/auth/callback", frontend);
			url.searchParams.set("access_token", accessToken);
			url.searchParams.set("refresh_token", refreshToken);
			return res.redirect(url.toString());

			// (대안 A-2) HttpOnly 쿠키 사용 시:
			// res.cookie('access_token', accessToken, {
			//   httpOnly: true, secure: false, sameSite: 'lax', maxAge: 3600_000,
			// });
			// res.cookie('refresh_token', refreshToken, {
			//   httpOnly: true, secure: false, sameSite: 'lax', maxAge: 7 * 24 * 3600_000,
			// });
			// return res.redirect(frontend + '/');
		} catch (e) {
			return res.redirect(`${frontend}/login?error=oauth_failed`);
		}
	}

	// 3) 토큰 갱신
	@Post("refresh")
	@ApiOperation({ summary: 'Refresh access token' })
	@ApiResponse({ status: 200, description: 'Tokens refreshed successfully' })
	@ApiResponse({ status: 401, description: 'Invalid refresh token' })
	@ApiBody({
		schema: {
			type: 'object',
			properties: {
				refreshToken: { type: 'string', description: 'Refresh token' }
			},
			required: ['refreshToken']
		}
	})
	async refreshToken(@Body('refreshToken') refreshToken: string) {
		try {
			const tokens = await this.authService.refreshToken(refreshToken);
			return {
				message: 'Tokens refreshed successfully',
				...tokens
			};
		} catch (error) {
			throw new Error('Invalid refresh token');
		}
	}

	// 4) 토큰 검증
	@Post("validate")
	@ApiOperation({ summary: 'Validate access token' })
	@ApiResponse({ status: 200, description: 'Token is valid' })
	@ApiResponse({ status: 401, description: 'Invalid token' })
	@ApiBody({
		schema: {
			type: 'object',
			properties: {
				token: { type: 'string', description: 'Access token' }
			},
			required: ['token']
		}
	})
	async validateToken(@Body('token') token: string) {
		const payload = await this.authService.validateToken(token);
		if (payload) {
			return {
				valid: true,
				payload
			};
		} else {
			throw new Error('Invalid token');
		}
	}
}
