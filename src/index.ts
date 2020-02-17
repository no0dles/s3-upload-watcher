import {S3} from 'aws-sdk';
import {accessKey, accessSecret, encryptionKey, region} from './config';
import {FileWatcher} from './file-watcher';
import {EncryptedUploader} from './upload/encrypted-uploader';
import {Uploader} from './upload/uploader';
import {EncryptedDownloader} from './download/encrypted-downloader';
import {Downloader} from './download/downloader';

const s3 = new S3({
  apiVersion: '2006-03-01',
  credentials: {
    accessKeyId: accessKey,
    secretAccessKey: accessSecret,
  },
  region: region,
});

async function main() {
  if (process.argv[2] === 'download') {
    const downloader = encryptionKey ? new EncryptedDownloader(process.argv[3], s3) : new Downloader(process.argv[3], s3);
    await downloader.start();
  } else {
    const uploader = encryptionKey ? new EncryptedUploader(s3) : new Uploader(s3);
    const fileWatcher = new FileWatcher(uploader);
    await fileWatcher.start();
  }
}

main();