import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

export class CreateClicksTable1765407990885 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'clicks',
        columns: [
          {
            name: 'id',
            type: 'bigint',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'link_id',
            type: 'bigint',
            isNullable: false,
          },
          {
            name: 'occurred_at',
            type: 'timestamptz',
            default: 'now()',
            isNullable: false,
          },
          {
            name: 'ip_hash',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'user_agent',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'referer',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'country',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'forwarded_for',
            type: 'varchar',
            isNullable: true,
          },
        ],
      }),
      true,
    );

    await queryRunner.createIndex(
      'clicks',
      new TableIndex({
        name: 'IDX_CLICKS_LINK_ID',
        columnNames: ['link_id'],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropIndex('clicks', 'IDX_CLICKS_LINK_ID');
    await queryRunner.dropTable('clicks');
  }
}
