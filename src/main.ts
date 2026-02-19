import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { CACHE_MANAGER, Cache } from "@nestjs/cache-manager";
import { Logger } from "@nestjs/common";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger("Bootstrap");
  const cacheManager = app.get<Cache>(CACHE_MANAGER);

  const value = new Date().toISOString();
  await cacheManager.set("nest_test", value);
  const testValue: string | undefined = await cacheManager.get("nest_test");
  logger.log(`Redis set: ${value}`);
  logger.log(`Redis get: ${testValue}`);

  await app.listen(process.env.PORT ?? 3001);
}
bootstrap().catch((err) => {
  console.error("Error starting the application:", err);
  process.exit(1);
});
