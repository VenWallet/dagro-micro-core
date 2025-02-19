import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1739981797233 implements MigrationInterface {
    name = 'Migration1739981797233'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_e752aee509d8f8118c6e5b1d8c"`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "email" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "email" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "name" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "name" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "phoneNumber" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "phoneNumber" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "ladnName" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "ladnName" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "landAddress" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "landAddress" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "headingQuantity" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "headingQuantity" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "image" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "image" DROP DEFAULT`);
        await queryRunner.query(`CREATE INDEX "IDX_e752aee509d8f8118c6e5b1d8c" ON "users" ("id", "email") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_e752aee509d8f8118c6e5b1d8c"`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "image" SET DEFAULT ' '`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "image" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "headingQuantity" SET DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "headingQuantity" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "landAddress" SET DEFAULT ' '`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "landAddress" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "ladnName" SET DEFAULT ' '`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "ladnName" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "phoneNumber" SET DEFAULT ' '`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "phoneNumber" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "name" SET DEFAULT ' '`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "name" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "email" SET DEFAULT ' '`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "email" SET NOT NULL`);
        await queryRunner.query(`CREATE INDEX "IDX_e752aee509d8f8118c6e5b1d8c" ON "users" ("id", "email") `);
    }

}
