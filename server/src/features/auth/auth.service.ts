import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { JwtService } from "@nestjs/jwt";
import { User } from "../users/entities/user.entity";

type GoogleUser = {
	google_sub: string;
	email?: string;
	name?: string;
	avatar_url?: string;
	email_verified?: boolean;
};

@Injectable()
export class AuthService {
	constructor(
		private readonly jwt: JwtService,
		@InjectRepository(User)
		private readonly userRepository: Repository<User>
	) {}

	async upsertUser(gu: GoogleUser) {
		// 기존 사용자 찾기
		let user = await this.userRepository.findOne({
			where: { google_sub: gu.google_sub }
		});

		if (user) {
			// 기존 사용자 정보 업데이트
			user.email = gu.email ?? user.email;
			user.name = gu.name ?? user.name;
			user.avatar_url = gu.avatar_url ?? user.avatar_url;
			user.email_verified = gu.email_verified ?? user.email_verified;
			user = await this.userRepository.save(user);
		} else {
			// 새 사용자 생성
			user = this.userRepository.create({
				google_sub: gu.google_sub,
				email: gu.email,
				name: gu.name,
				avatar_url: gu.avatar_url,
				email_verified: gu.email_verified ?? false,
				role: 'user'
			});
			user = await this.userRepository.save(user);
		}

		return user; // { id, email, name, role }
	}

	async issueJwt(user: {
		id: number;
		email?: string;
		role?: "user" | "admin";
	}) {
		const payload = {
			sub: user.id,
			email: user.email,
			role: user.role ?? "user",
		};
		const accessToken = await this.jwt.signAsync(payload, {
			secret: process.env.JWT_SECRET!,
			expiresIn: process.env.JWT_EXPIRES_IN ?? "3600s",
		});
		const refreshToken = await this.jwt.signAsync(payload, {
			secret: process.env.JWT_REFRESH_SECRET!,
			expiresIn: process.env.JWT_REFRESH_EXPIRES_IN ?? "7d",
		});
		return { accessToken, refreshToken };
	}

	async refreshToken(refreshToken: string) {
		try {
			const payload = await this.jwt.verifyAsync(refreshToken, {
				secret: process.env.JWT_REFRESH_SECRET!,
			});

			// 사용자 정보 확인
			const user = await this.userRepository.findOne({
				where: { id: payload.sub }
			});

			if (!user) {
				throw new Error('User not found');
			}

			// 새로운 토큰 발급
			return this.issueJwt({
				id: user.id,
				email: user.email,
				role: user.role,
			});
		} catch (error) {
			throw new Error('Invalid refresh token');
		}
	}

	async validateToken(token: string) {
		try {
			const payload = await this.jwt.verifyAsync(token, {
				secret: process.env.JWT_SECRET!,
			});
			return payload;
		} catch (error) {
			return null;
		}
	}
}
