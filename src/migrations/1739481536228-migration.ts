import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1739481536228 implements MigrationInterface {
    name = 'Migration1739481536228'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "users" ("id" SERIAL NOT NULL, "email" character varying, "name" character varying, "ladnName" character varying, "landAddress" character varying, "wallet" character varying NOT NULL, "heading" character varying, "headingQuantity" character varying, "image" character varying, "creation_date" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "UQ_c5a97c2e62b0c759e2c16d411cd" UNIQUE ("wallet"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_e752aee509d8f8118c6e5b1d8c" ON "users" ("id", "email") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_e752aee509d8f8118c6e5b1d8c"`);
        await queryRunner.query(`DROP TABLE "users"`);
    }

}
