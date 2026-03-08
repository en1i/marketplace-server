import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableShutdownHooks();

  await app.listen(process.env.PORT ?? 3001, "0.0.0.0");
}
bootstrap().catch((err) => {
  console.error("Error starting the application:", err);
  process.exit(1);
});
