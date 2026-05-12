# AWS S3 Image Storage

This document covers how image uploads and retrieval are implemented using AWS S3.

## What Was Added

- `StorageModule` under `src/storage/` wiring together the controller, service, and exports
- Upload endpoint that streams files directly to S3 (no disk writes — uses `multer` memory storage)
- Presigned URL endpoint for time-limited client-side access to stored objects
- Delete endpoint for removing objects from the bucket

## Packages

```bash
yarn add @aws-sdk/client-s3 @aws-sdk/s3-request-presigner
yarn add -D @types/multer
```

| Package | Role |
|---|---|
| `@aws-sdk/client-s3` | S3 client — upload, delete operations |
| `@aws-sdk/s3-request-presigner` | Generates presigned `GetObject` URLs |
| `@types/multer` | TypeScript types for multipart file handling |

## Environment Variables

| Variable | Description |
|---|---|
| `AWS_S3_BUCKET` | Target S3 bucket name |
| `AWS_S3_REGION` | AWS region where the bucket is hosted |
| `AWS_S3_KEY` | AWS IAM access key ID |
| `AWS_S3_SECRET` | AWS IAM secret access key |

## API Endpoints

| Method | Path | Description |
|---|---|---|
| `POST` | `/storage/upload` | Upload an image file (max 5 MB, images only). Returns `{ key }`. |
| `GET` | `/storage/presign/:key` | Get a presigned URL for an object. Valid for 1 hour by default. Returns `{ url }`. |
| `DELETE` | `/storage/:key` | Delete an object from the bucket. Returns `{ deleted: true }`. |

## Design Notes

- Files are held in memory (no temp files on disk) and streamed directly to S3 via `PutObjectCommand`
- Object keys are `<uuid><ext>` — the original filename is never used
- Access is via presigned URLs rather than public bucket objects, keeping the bucket private
- File validation: images only (MIME type check), 5 MB size limit

## Related Files

- Service: [`src/storage/storage.service.ts`](../../storage/storage.service.ts)
- Controller: [`src/storage/storage.controller.ts`](../../storage/storage.controller.ts)
- Module: [`src/storage/storage.module.ts`](../../storage/storage.module.ts)
