import {S3} from 'aws-sdk';
import * as stream from 'stream';
import {Uploader} from './uploader';
import * as crypto from 'crypto';
import {encryptionAlgorithm, encryptionKey} from '../config';
import {AppendInitVector} from '../stream/append-init-vector';

export class EncryptedUploader extends Uploader {
  private key: Buffer;

  constructor(s3: S3) {
    super(s3);
  }

  async init(): Promise<void> {
    super.init();

    const hash = crypto.createHash('sha256');
    hash.update(encryptionKey);
    this.key = hash.digest();
  }

  protected async uploadFileStream(key: string, stream: stream.Readable, metadata: any): Promise<void> {
    const initVector = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(encryptionAlgorithm, this.key, initVector);
    const appendInitVector = new AppendInitVector(initVector);
    await super.uploadFileStream(key, stream.pipe(cipher).pipe(appendInitVector), metadata);
  }
}