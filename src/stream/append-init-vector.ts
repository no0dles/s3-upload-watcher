import * as stream from 'stream';

export class AppendInitVector extends stream.Transform {
  private appended = false;

  constructor(private initVector: Buffer) {
    super();
  }

  _transform(chunk: any, encoding: string, callback: (error?: (Error | null), data?: any) => void): void {
    if (!this.appended) {
      this.push(this.initVector);
      this.appended = true;
    }
    this.push(chunk);
    callback();
  }
}