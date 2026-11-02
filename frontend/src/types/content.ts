// `key` is the stored S3 key of media that already belongs to a saved post.
export type PostMedia = { kind: 'image' | 'video'; url: string | null; name: string; file?: File; key?: string };
