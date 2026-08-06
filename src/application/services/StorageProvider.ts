/**
 * StorageProvider abstract interface for file uploads (Notes, Attachments, Avatars).
 * Designed to avoid GridFS and seamlessly switch between LocalStorage, S3, or GCS.
 */
export interface IStorageAdapter {
  uploadFile(file: Buffer, filename: string, mimeType: string): Promise<string>;
  deleteFile(fileUrl: string): Promise<void>;
}

export class LocalStorageAdapter implements IStorageAdapter {
  async uploadFile(_file: Buffer, filename: string, _mimeType: string): Promise<string> {
    // For local development, this would write to /public/uploads
    // and return the relative URL. 
    return `/uploads/simulated_${Date.now()}_${filename}`;
  }

  async deleteFile(_fileUrl: string): Promise<void> {
    // Simulated delete
  }
}

export class StorageService {
  private static adapter: IStorageAdapter = new LocalStorageAdapter();

  static setAdapter(adapter: IStorageAdapter) {
    this.adapter = adapter;
  }

  static async upload(file: Buffer, filename: string, mimeType: string): Promise<string> {
    return this.adapter.uploadFile(file, filename, mimeType);
  }

  static async delete(fileUrl: string): Promise<void> {
    return this.adapter.deleteFile(fileUrl);
  }
}
