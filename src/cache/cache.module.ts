import { CacheModule as NestCacheModule } from "@nestjs/cache-manager";
import { Module } from "@nestjs/common";
import { CacheService } from "./cache.service";

@Module({
  imports: [NestCacheModule.registerAsync({ useClass: CacheService })],
  providers: [CacheService],
  exports: [NestCacheModule],
})
export class CacheModule {}
