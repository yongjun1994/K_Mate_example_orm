import { Module } from "@nestjs/common";
import { PassportModule } from "@nestjs/passport";
import { JwtModule } from "@nestjs/jwt";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { GoogleStrategy } from "./strategies/google.strategy";
import { User } from "../users/entities/user.entity";

@Module({
	imports: [
		TypeOrmModule.forFeature([User]),
		PassportModule.register({ session: false }),
		JwtModule.register({
			secret: process.env.JWT_SECRET!,
			signOptions: { expiresIn: process.env.JWT_EXPIRES_IN ?? "3600s" },
		}),
	],
	controllers: [AuthController],
	providers: [
		AuthService,
		...(process.env.GOOGLE_CLIENT_ID ? [GoogleStrategy] : []),
	],
	exports: [AuthService],
})
export class AuthModule {}
