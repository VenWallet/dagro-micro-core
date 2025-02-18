import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1739912792643 implements MigrationInterface {
    name = 'Migration1739912792643'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "heading"`);
        await queryRunner.query(`ALTER TABLE "users" ADD "phoneNumber" character varying NOT NULL DEFAULT ' '`);
        await queryRunner.query(`ALTER TABLE "users" ADD "headingId" integer`);
        await queryRunner.query(`DROP INDEX "public"."IDX_e752aee509d8f8118c6e5b1d8c"`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "email" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "email" SET DEFAULT ' '`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "name" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "name" SET DEFAULT ' '`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "ladnName" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "ladnName" SET DEFAULT ' '`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "landAddress" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "landAddress" SET DEFAULT ' '`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "headingQuantity" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "headingQuantity" SET DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "image" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "image" SET DEFAULT ' '`);
        await queryRunner.query(`CREATE INDEX "IDX_e752aee509d8f8118c6e5b1d8c" ON "users" ("id", "email") `);
        await queryRunner.query(`ALTER TABLE "users" ADD CONSTRAINT "FK_1b188d0e7e01eb7371704ca7584" FOREIGN KEY ("headingId") REFERENCES "headings"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "FK_1b188d0e7e01eb7371704ca7584"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_e752aee509d8f8118c6e5b1d8c"`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "image" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "image" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "headingQuantity" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "headingQuantity" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "landAddress" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "landAddress" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "ladnName" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "ladnName" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "name" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "name" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "email" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "email" DROP NOT NULL`);
        await queryRunner.query(`CREATE INDEX "IDX_e752aee509d8f8118c6e5b1d8c" ON "users" ("id", "email") `);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "headingId"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "phoneNumber"`);
        await queryRunner.query(`ALTER TABLE "users" ADD "heading" character varying`);
    }

}
