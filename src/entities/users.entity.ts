import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  BaseEntity,
  CreateDateColumn,
  Index,
  
} from "typeorm";


@Entity({ name: "users" })
@Index(["id", "email"])
export class Users extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number;
  
  @Column({
    nullable: true
  })
  email!: string;

  @Column({
    nullable: true,
  })
  name!: string;

  @Column({
    nullable: true,
  })
  ladnName!: string;

  @Column({
    nullable: true,
  })
  landAddress!: string;

  @Column({
    unique: true,
    nullable: false
  })
  wallet!: string;

  @Column({
    nullable: true,
  })
  heading!: string;

  @Column({
    nullable: true,
  })
  headingQuantity!: string;

  @Column({
    nullable: true,
  })
  image!: string;

  @CreateDateColumn({type: "timestamptz"})
  creation_date!: Date;
}