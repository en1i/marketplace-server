import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { memoryStorage } from "multer";
import { StorageService } from "./storage.service";

@Controller("storage")
export class StorageController {
  constructor(private readonly storageService: StorageService) {}

  @Post("upload")
  @UseInterceptors(
    FileInterceptor("file", {
      storage: memoryStorage(),
      limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
      fileFilter: (_req, file, cb) => {
        if (!file.mimetype.startsWith("image/")) {
          cb(new BadRequestException("Only image files are allowed"), false);
        } else {
          cb(null, true);
        }
      },
    }),
  )
  async upload(@UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException("File is required");
    const key = await this.storageService.upload(file);
    return { key };
  }

  @Get("presign/:key")
  async presign(@Param("key") key: string) {
    const url = await this.storageService.presign(key);
    return { url };
  }

  @Delete(":key")
  async delete(@Param("key") key: string) {
    await this.storageService.delete(key);
    return { deleted: true };
  }
}
