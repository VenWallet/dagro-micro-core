import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1743979911769 implements MigrationInterface {
    name = 'Migration1743979911769'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ADD "telegram" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "telegram"`);
    }

}
