import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  S3Client,
  PutObjectCommand,
  CreateBucketCommand,
  HeadBucketCommand,
} from '@aws-sdk/client-s3';
import { randomUUID } from 'crypto';

const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'video/mp4',
  'video/webm',
  'video/quicktime',
];
const MAX_SIZE = 100 * 1024 * 1024; // 100MB

@Injectable()
export class MediaService {
  private readonly s3: S3Client;
  private readonly bucket: string;
  private readonly publicEndpoint: string;

  constructor(private readonly config: ConfigService) {
    const endpoint = config.get<string>('MINIO_ENDPOINT', 'http://minio:9000');
    this.bucket = config.get<string>('MINIO_BUCKET', 'frp-media');
    this.publicEndpoint = config.get<string>('MINIO_PUBLIC_ENDPOINT', 'http://localhost:9000');

    this.s3 = new S3Client({
      endpoint,
      region: config.get<string>('MINIO_REGION', 'us-east-1'),
      credentials: {
        accessKeyId: config.get<string>('MINIO_ROOT_USER', 'minioadmin'),
        secretAccessKey: config.get<string>('MINIO_ROOT_PASSWORD', 'minioadmin'),
      },
      forcePathStyle: true,
    });

    void this.ensureBucket();
  }

  private async ensureBucket() {
    try {
      await this.s3.send(new HeadBucketCommand({ Bucket: this.bucket }));
    } catch {
      try {
        await this.s3.send(new CreateBucketCommand({ Bucket: this.bucket }));
      } catch {
        /* bucket may already exist */
      }
    }
  }

  async upload(file: Express.Multer.File): Promise<{ url: string; mediaType: 'video' | 'image' }> {
    if (!file) throw new BadRequestException('No file provided');
    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      throw new BadRequestException(`Unsupported file type: ${file.mimetype}`);
    }
    if (file.size > MAX_SIZE) {
      throw new BadRequestException('File too large (max 100MB)');
    }

    const ext = file.originalname.split('.').pop() ?? 'bin';
    const key = `uploads/${randomUUID()}.${ext}`;

    await this.s3.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
      }),
    );

    const url = `${this.publicEndpoint}/${this.bucket}/${key}`;
    const mediaType = file.mimetype.startsWith('video/') ? 'video' : 'image';

    return { url, mediaType };
  }
}
