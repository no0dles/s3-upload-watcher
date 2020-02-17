import * as stream from 'stream';

export class RemoveInitVector extends stream.Transform {
  public initVector = Buffer.alloc(16);
  private copyIndex = 0;

  public ready: (initVector: Buffer) => void;

  constructor() {
    super();
  }

  _transform(chunk: Buffer, encoding: string, callback: (error?: (Error | null), data?: any) => void): void {
    if (this.copyIndex < 16) {
      const end = Math.min(16 - this.copyIndex, chunk.length);
      chunk.copy(this.initVector, this.copyIndex, 0, end);
      this.copyIndex += end;
      if (this.copyIndex === 16) {
        this.ready(this.initVector);
      }

      if (chunk.length > end) {
        this.push(chunk.slice(end, chunk.length));
      }
    } else {
      this.push(chunk);
    }
    callback();
  }
}