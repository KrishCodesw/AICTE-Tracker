#!/usr/bin/env -S node
import type { Contract as Start } from '../../snapshots/1e8412e162dbbe69f4bb3bf8d07f0280ae67eaab15c34dcf201e67468315428d/contract';
import startContract from '../../snapshots/1e8412e162dbbe69f4bb3bf8d07f0280ae67eaab15c34dcf201e67468315428d/contract.json' with { type: 'json' };
import type { Contract as End } from '../../snapshots/cf12add0e2b46924706d8280858a137808eef0d543f3cd007995376b7de57fbb/contract';
import endContract from '../../snapshots/cf12add0e2b46924706d8280858a137808eef0d543f3cd007995376b7de57fbb/contract.json' with { type: 'json' };
import { Migration, MigrationCLI, col } from '@prisma/orm-postgres/migration';

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.addColumn({
        schema: 'public',
        table: 'user',
        column: col('accessToken', 'text', { codecRef: { codecId: 'pg/text@1' } }),
      }),
      this.addColumn({
        schema: 'public',
        table: 'user',
        column: col('expiresAt', 'timestamptz', {
          codecRef: { codecId: 'pg/timestamptz-temporal@1' },
        }),
      }),
      this.addColumn({
        schema: 'public',
        table: 'user',
        column: col('googleId', 'text', { codecRef: { codecId: 'pg/text@1' } }),
      }),
      this.addColumn({
        schema: 'public',
        table: 'user',
        column: col('refreshToken', 'text', { codecRef: { codecId: 'pg/text@1' } }),
      }),
      this.addUnique({
        schema: 'public',
        table: 'user',
        constraint: 'user_googleId_key',
        columns: ['googleId'],
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
