import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1746026718260 implements MigrationInterface {
    name = 'Migration1746026718260'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "headings" ("id" SERIAL NOT NULL, "name" character varying, "description" character varying, "isActive" boolean NOT NULL DEFAULT true, "creation_date" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_fe31b700677d5582bcebefcbf36" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_acad7eac4e3b5c721f9ec2b619" ON "headings" ("id", "name", "creation_date") `);
        await queryRunner.query(`CREATE TABLE "users" ("id" SERIAL NOT NULL, "email" character varying, "name" character varying, "phoneNumber" character varying, "ladnName" character varying, "landAddress" character varying, "wallet" character varying NOT NULL, "headingQuantity" character varying, "image" character varying, "telegram" character varying, "token" character varying NOT NULL DEFAULT ' ', "secret" character varying NOT NULL DEFAULT ' ', "creation_date" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "headingId" integer, CONSTRAINT "UQ_c5a97c2e62b0c759e2c16d411cd" UNIQUE ("wallet"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_e752aee509d8f8118c6e5b1d8c" ON "users" ("id", "email") `);
        await queryRunner.query(`ALTER TABLE "users" ADD CONSTRAINT "FK_1b188d0e7e01eb7371704ca7584" FOREIGN KEY ("headingId") REFERENCES "headings"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "FK_1b188d0e7e01eb7371704ca7584"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_e752aee509d8f8118c6e5b1d8c"`);
        await queryRunner.query(`DROP TABLE "users"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_acad7eac4e3b5c721f9ec2b619"`);
        await queryRunner.query(`DROP TABLE "headings"`);
    }

}
