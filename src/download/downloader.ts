import * as path from 'path';
import * as fs from 'fs';
import * as S3 from 'aws-sdk/clients/s3';
import {bucket} from '../config';
import * as stream from 'stream';
import * as zlib from 'zlib';

export class Downloader {
  private readonly downloadPath: string;

  constructor(downloadPath: string,
              private s3: S3) {
    this.downloadPath = path.resolve(downloadPath);
  }

  init() {
    if (!fs.existsSync(this.downloadPath)) {
      throw new Error(`download directory ${this.downloadPath} does not exist`);
    }
  }

  async start() {
    this.init();

    const objects = await this.s3.listObjects({Bucket: bucket}).promise();
    for (const object of objects.Contents) {
      const localPath = path.join(this.downloadPath, object.Key);
      const headObject = await this.s3.headObject({Key: object.Key, Bucket: bucket}).promise();

      if (fs.existsSync(localPath)) {
        const localStats = fs.statSync(localPath);
        if (!headObject.Metadata.size || parseInt(headObject.Metadata.size) !== localStats.size) {
          await this.downloadFile(object.Key, localPath);
        }
      } else {
        await this.downloadFile(object.Key, localPath);
      }
    }
  }


  private async downloadFile(key: string, localPath: string) {
    console.log(`download ${key}`);
    const readStream = await this.s3.getObject({Bucket: bucket, Key: key}).createReadStream();
    this.downloadFileStream(localPath, readStream);
    console.log('downloaded');
  }

  protected downloadFileStream(localPath: string, fileStream: stream.Readable) {
    const writeStream = fs.createWriteStream(localPath);
    const brotliStream = zlib.createBrotliDecompress();
    fileStream.pipe(brotliStream).pipe(writeStream);
  }
}