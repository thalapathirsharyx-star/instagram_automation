import { Injectable } from "@nestjs/common";
import * as bcrypt from 'bcrypt';

@Injectable()
export class HashingService {
  private readonly saltRounds = 10;

  async Hash(text: string): Promise<string> {
    return await bcrypt.hash(text, this.saltRounds);
  }

  async Compare(text: string, hash: string): Promise<boolean> {
    return await bcrypt.compare(text, hash);
  }
}
