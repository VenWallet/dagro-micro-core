import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  BaseEntity,
  CreateDateColumn,
  Index,
} from "typeorm";


@Entity({ name: "headings" })
@Index(["id", "name", "creation_date"])
export class Headings extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number;
  
  @Column({
    nullable: true
  })
  name!: string;

  @Column({
    nullable: true,
  })
  description!: string;


  @Column({
    default: true
  })
  isActive!: boolean;

  @CreateDateColumn({type: "timestamptz"})
  creation_date!: Date;
}