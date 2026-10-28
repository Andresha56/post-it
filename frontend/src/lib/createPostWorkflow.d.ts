export type UploadFile = File;
export type UploadUrlResult = { uploadUrl?: string; key?: string } | null | undefined;
export function createPostWorkflow<T>({
  file,
  existingKey,
  getUploadUrl,
  uploadFile,
  createContent,
}: {
  file?: UploadFile | null;
  existingKey?: string | null;
  getUploadUrl: (file: UploadFile) => Promise<UploadUrlResult>;
  uploadFile: (uploadUrl: string, file: UploadFile, key: string) => Promise<void>;
  createContent: (mediaUrls: string[]) => Promise<T>;
}): Promise<T>;
