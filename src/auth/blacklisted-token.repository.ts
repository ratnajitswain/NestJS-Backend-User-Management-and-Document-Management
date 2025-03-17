import { DataSource, Repository } from 'typeorm';
import { BlacklistedToken } from './entities/blacklisted-token.entity';

export class BlacklistedTokenRepository extends Repository<BlacklistedToken> {
  constructor(private readonly dataSource: DataSource) {
    super(BlacklistedToken, dataSource.createEntityManager());
  }

  async addToBlacklist(token: string, expiresAt: Date): Promise<void> {
    const blacklistedToken = this.create({ token, expiresAt });
    await this.save(blacklistedToken);
  }

  async isBlacklisted(token: string): Promise<boolean> {
    const existingToken = await this.findOne({ where: { token } });
    return !!existingToken;
  }

  async cleanupExpiredTokens(): Promise<void> {
    await this.createQueryBuilder()
      .delete()
      .where('expiresAt < NOW()')
      .execute();
  }
}