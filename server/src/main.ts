import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { ValidationPipe } from "@nestjs/common";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { HttpExceptionFilter } from "./common/filters/http-exception.filter";
import { ValidationException } from "./common/exceptions/custom.exceptions";

async function bootstrap() {
	const app = await NestFactory.create(AppModule);

	app.enableCors({
		origin: ["http://localhost:5173", "http://127.0.0.1:5173"],
		credentials: true, // 쿠키 쓰면 true, JWT만 쓰면 false여도 됨
	});

	app.useGlobalPipes(new ValidationPipe({ 
		whitelist: true, 
		transform: true,
		exceptionFactory: (errors) => {
			const result = errors.map((error) => ({
				property: error.property,
				value: error.value,
				constraints: error.constraints,
			}));
			return new ValidationException(result);
		},
	}));
	
	app.useGlobalFilters(new HttpExceptionFilter());

	const config = new DocumentBuilder()
		.setTitle("K-Mate API")
		.setDescription("K-Mate Backend API Docs")
		.setVersion("1.0.0")
		.addBearerAuth()
		.build();

	const doc = SwaggerModule.createDocument(app, config);
	SwaggerModule.setup("/docs", app, doc);

	await app.listen(process.env.APP_PORT ?? 3000);
}
bootstrap();
