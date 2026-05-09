import { Env } from '../../index';

export class R2Service {
  constructor(private env: Env) {}

  /**
   * Upload a file to R2
   */
  async upload(bucket: 'ARCHIVE' | 'MEDIA', key: string, data: ArrayBuffer | string, contentType: string): Promise<string> {
    const r2Bucket = bucket === 'ARCHIVE' ? this.env.R2_ARCHIVE : this.env.R2_MEDIA;
    
    await r2Bucket.put(key, data, {
      httpMetadata: { contentType },
      customMetadata: { uploadedAt: new Date().toISOString() }
    });

    // In a real scenario, you'd return the public URL if configured
    return `https://assets.kaungthant.com/${bucket.toLowerCase()}/${key}`;
  }

  /**
   * Get a file from R2
   */
  async get(bucket: 'ARCHIVE' | 'MEDIA', key: string): Promise<R2ObjectBody | null> {
    const r2Bucket = bucket === 'ARCHIVE' ? this.env.R2_ARCHIVE : this.env.R2_MEDIA;
    return await r2Bucket.get(key);
  }

  /**
   * Delete a file from R2
   */
  async delete(bucket: 'ARCHIVE' | 'MEDIA', key: string): Promise<void> {
    const r2Bucket = bucket === 'ARCHIVE' ? this.env.R2_ARCHIVE : this.env.R2_MEDIA;
    await r2Bucket.delete(key);
  }
}
