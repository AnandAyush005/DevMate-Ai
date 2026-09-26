#!/usr/bin/env -S node
import type { Contract as End } from '../../snapshots/d1b676a7e98874a4576c6685e10990fb05127b45abd0298f67d54ed8fb932bb2/contract';
import endContract from '../../snapshots/d1b676a7e98874a4576c6685e10990fb05127b45abd0298f67d54ed8fb932bb2/contract.json' with { type: 'json' };
import type { Contract as Start } from '../../snapshots/dd4dbf210c1d9e9b1e3a0ad1dc825ebc16c932c6d937710762d034096deaa83d/contract';
import startContract from '../../snapshots/dd4dbf210c1d9e9b1e3a0ad1dc825ebc16c932c6d937710762d034096deaa83d/contract.json' with { type: 'json' };
import { Migration, MigrationCLI } from '@prisma/orm-postgres/migration';

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.dropConstraint({ schema: 'public', table: 'Project', constraint: 'Project_name_key' }),
      this.addUnique({
        schema: 'public',
        table: 'Project',
        constraint: 'Project_userId_name_key',
        columns: ['userId', 'name'],
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
