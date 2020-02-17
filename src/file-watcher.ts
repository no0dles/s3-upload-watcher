import {Uploader} from './upload/uploader';
import * as fs from 'fs';
import * as path from 'path';
import {watchPath} from './config';
import * as chokidar from 'chokidar';

export class FileWatcher {
  constructor(private uploader: Uploader) {
  }

  async start() {
    this.init();
    await this.uploader.init();

    this.startWatching();
  }

  init() {
    if (!fs.existsSync(watchPath)) {
      throw new Error(`watch directory ${watchPath} does not exist`);
    }
  }

  private async ensureFileIsUploaded(filename: string, stats: fs.Stats) {
    const dir = path.resolve(watchPath);
    const key = path.relative(dir, filename);

    console.log(`check if ${key} exists in bucket`);
    const exists = await this.uploader.existFile(key, stats.size);
    if (exists) {
      return;
    }

    await this.uploader.uploadFile(key, filename, {
      size: stats.size.toString(),
    });
  }

  private startWatching() {
    const dir = path.resolve(watchPath);
    console.log(`start watching ${dir}`);

    const changeFn = (file: string, stats: fs.Stats | undefined) => {
      if (stats) {
        this.ensureFileIsUploaded(file, stats);
      } else {
        this.ensureFileIsUploaded(file, fs.statSync(file));
      }
    };

    chokidar.watch(dir)
      .on('add', (file, stats) => changeFn(file, stats))
      .on('change', (file, stats) => changeFn(file, stats));
  }
}