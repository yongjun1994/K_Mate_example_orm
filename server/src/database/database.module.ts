import { Global, Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { User } from "../features/users/entities/user.entity";
import { KBuzz } from "../features/posts/entities/k-buzz.entity";
import { Tip } from "../features/tips/entities/tip.entity";
import { Comment } from "../features/comments/entities/comment.entity";
import { Like } from "../features/interactions/entities/like.entity";
import { Scrap } from "../features/interactions/entities/scrap.entity";
import { Place } from "../features/places/entities/place.entity";
import { Bookmark } from "../features/bookmarks/entities/bookmark.entity";

@Global()
@Module({
	imports: [
		TypeOrmModule.forRootAsync({
			imports: [ConfigModule],
			useFactory: (configService: ConfigService) => ({
				type: 'mysql',
				host: configService.get('database.host'),
				port: configService.get('database.port'),
				username: configService.get('database.user'),
				password: configService.get('database.password'),
				database: configService.get('database.database'),
				entities: [User, KBuzz, Tip, Comment, Like, Scrap, Place, Bookmark],
				synchronize: configService.get('app.nodeEnv') === 'development',
				logging: configService.get('app.nodeEnv') === 'development',
			}),
			inject: [ConfigService],
		}),
	],
})
export class DatabaseModule {}
