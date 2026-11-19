#!/usr/bin/env -S node
import type { Contract as Start } from '../../snapshots/d1b676a7e98874a4576c6685e10990fb05127b45abd0298f67d54ed8fb932bb2/contract';
import startContract from '../../snapshots/d1b676a7e98874a4576c6685e10990fb05127b45abd0298f67d54ed8fb932bb2/contract.json' with { type: 'json' };
import type { Contract as End } from '../../snapshots/f3756409cfffcbc00680fd2937dfadafa80b1e8d837d43256d4655085f1d0290/contract';
import endContract from '../../snapshots/f3756409cfffcbc00680fd2937dfadafa80b1e8d837d43256d4655085f1d0290/contract.json' with { type: 'json' };
import { Migration, MigrationCLI, col, primaryKey } from '@prisma/orm-postgres/migration';

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.createTable({
        schema: 'public',
        table: 'ProjectFile',
        columns: [
          col('content', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('createdAt', 'timestamptz', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
          col('folderId', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('id', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('language', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('name', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('updatedAt', 'timestamptz', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'ProjectFolder',
        columns: [
          col('createdAt', 'timestamptz', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
          col('id', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('name', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('parentFolderId', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('path', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('projectId', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('updatedAt', 'timestamptz', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.addColumn({
        schema: 'public',
        table: 'User',
        column: col('passwordResetExpiresAt', 'text', { codecRef: { codecId: 'pg/text@1' } }),
      }),
      this.addColumn({
        schema: 'public',
        table: 'User',
        column: col('passwordResetTokenHash', 'text', { codecRef: { codecId: 'pg/text@1' } }),
      }),
      this.addUnique({
        schema: 'public',
        table: 'ProjectFile',
        constraint: 'ProjectFile_folderId_name_key',
        columns: ['folderId', 'name'],
      }),
      this.addUnique({
        schema: 'public',
        table: 'ProjectFolder',
        constraint: 'ProjectFolder_projectId_path_key',
        columns: ['projectId', 'path'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'ProjectFile',
        index: 'ProjectFile_folderId_idx_5985e562',
        columns: ['folderId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'ProjectFolder',
        index: 'ProjectFolder_parentFolderId_idx_66fef1f5',
        columns: ['parentFolderId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'ProjectFolder',
        index: 'ProjectFolder_projectId_idx_a96e4d92',
        columns: ['projectId'],
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'ProjectFile',
        foreignKey: {
          name: 'ProjectFile_folderId_fkey',
          columns: ['folderId'],
          references: { schema: 'public', table: 'ProjectFolder', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'ProjectFolder',
        foreignKey: {
          name: 'ProjectFolder_projectId_fkey',
          columns: ['projectId'],
          references: { schema: 'public', table: 'Project', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'ProjectFolder',
        foreignKey: {
          name: 'ProjectFolder_parentFolderId_fkey',
          columns: ['parentFolderId'],
          references: { schema: 'public', table: 'ProjectFolder', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
