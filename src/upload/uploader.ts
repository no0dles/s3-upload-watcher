import {S3} from 'aws-sdk';
import * as stream from 'stream';
import * as fs from 'fs';
import {bucket, region} from '../config';
import * as zlib from 'zlib';

export class Uploader {
  constructor(protected s3: S3) {
  }

  async uploadFile(key: string, fileName: string, metadata: any) {
    const readStream = fs.createReadStream(fileName);
    const brotliStream = zlib.createBrotliCompress();
    await this.uploadFileStream(key, readStream.pipe(brotliStream), metadata);
  }

  protected async uploadFileStream(key: string, stream: stream.Readable, metadata: any) {
    console.log(`uploading ${key}`);
    await this.s3.upload({
      Bucket: bucket,
      ACL: 'private',
      Key: key,
      Metadata: metadata,
      Body: stream,
    }).promise();
    console.log(`uploaded ${key}`);
  }

  async existFile(key: string, size: number) {
    try {
      const result = await this.s3.headObject({Bucket: bucket, Key: key}).promise();
      if (result.Metadata.size) {
        const metadataSize = parseInt(result.Metadata.size);
        return metadataSize === size;
      }
      return false;
    } catch (e) {
      if (e.statusCode === 404) {
        return false;
      }
      throw e;
    }
  }

  async init() {
    try {
      await this.s3.headBucket({Bucket: bucket}).promise();
    } catch (e) {
      if (e.statusCode === 401) {
        throw new Error('can access bucket, either name is taken or access key has no permissions');
      }
      if (e.statusCode === 404) {
        console.log(`bucket ${bucket} does not exist, creating...`);
        await this.s3.createBucket({
          ACL: 'private',
          Bucket: bucket,
          CreateBucketConfiguration: {LocationConstraint: region},
        }).promise();
      }
    }
  }
}