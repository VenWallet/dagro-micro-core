import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1739899005030 implements MigrationInterface {
    name = 'Migration1739899005030'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "headings" ("id" SERIAL NOT NULL, "name" character varying, "description" character varying, "isActive" boolean NOT NULL DEFAULT true, "creation_date" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_fe31b700677d5582bcebefcbf36" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_acad7eac4e3b5c721f9ec2b619" ON "headings" ("id", "name", "creation_date") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_acad7eac4e3b5c721f9ec2b619"`);
        await queryRunner.query(`DROP TABLE "headings"`);
    }

}
