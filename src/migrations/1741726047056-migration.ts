import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1741726047056 implements MigrationInterface {
    name = 'Migration1741726047056'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ADD "token" character varying NOT NULL DEFAULT ' '`);
        await queryRunner.query(`ALTER TABLE "users" ADD "secret" character varying NOT NULL DEFAULT ' '`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "secret"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "token"`);
    }

}
