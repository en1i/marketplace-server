import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { CacheModule } from "@nestjs/cache-manager";
// import { KeyvCacheableMemory } from "cacheable";
// import { Keyv } from "keyv";
import KeyvRedis from "@keyv/redis";

@Module({
  imports: [
    CacheModule.registerAsync({
      useFactory: () => {
        return {
          stores: [
            // new Keyv({
            //   store: new KeyvCacheableMemory({ ttl: 60000, lruSize: 5000 }),
            // }),
            new KeyvRedis("redis://redis:6379"),
          ],
        };
      },
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
