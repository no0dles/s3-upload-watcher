export const bucket = process.env.AWS_S3_BUCKET;
export const watchPath = process.env.WATCH_PATH;
export const accessKey = process.env.AWS_ACCESS_KEY;
export const accessSecret = process.env.AWS_ACCESS_SECRET;
export const region = process.env.AWS_REGION || 'eu-west-1';
export const encryptionKey = process.env.ENCRYPTION_KEY;
export const encryptionAlgorithm = process.env.ENCRYPTION_ALGORITHM || 'aes256';

if (!watchPath) {
  throw new Error('missing WATCH_PATH env variable');
}
if (!bucket) {
  throw new Error('missing AWS_S3_BUCKET env variable');
}
if (!accessKey) {
  throw new Error('missing AWS_ACCESS_KEY env variable');
}
if (!accessSecret) {
  throw new Error('missing AWS_ACCESS_SECRET env variable');
}
if (!encryptionKey) {
  console.warn('No encryption key specified, will upload all files unencrypted');
}