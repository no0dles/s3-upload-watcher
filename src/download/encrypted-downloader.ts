import {Downloader} from './downloader';
import {encryptionAlgorithm, encryptionKey} from '../config';
import * as crypto from 'crypto';
import * as stream from 'stream';
import {RemoveInitVector} from '../stream/remove-init-vector';

export class EncryptedDownloader extends Downloader {
  private key: Buffer;

  async init(): Promise<void> {
    super.init();

    const hash = crypto.createHash('sha256');
    hash.update(encryptionKey);
    this.key = hash.digest();
  }

  protected downloadFileStream(localPath: string, fileStream: stream.Readable) {
    console.log(fileStream.read(15));
    const removeInitVector = new RemoveInitVector();
    const removedInitVectorStream = fileStream.pipe(removeInitVector);
    removedInitVectorStream.ready = initVector => {
      const decipher = crypto.createDecipheriv(encryptionAlgorithm, this.key, initVector);
      super.downloadFileStream(localPath, removedInitVectorStream.pipe(decipher));
    };
  }
}
