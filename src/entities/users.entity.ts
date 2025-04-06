import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  BaseEntity,
  CreateDateColumn,
  Index,
  ManyToOne,
} from "typeorm";

import { Headings } from "./";

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
    nullable: true
  })
  name!: string;

  @Column({
    nullable: true
  })
  phoneNumber!: string;
  
  @Column({
    nullable: true
  })
  ladnName!: string;

  @Column({
    nullable: true
  })
  landAddress!: string;

  @Column({
    unique: true,
    nullable: false
  })
  wallet!: string;

  @ManyToOne(() => Headings, heading => heading.id, { nullable: true })
  heading!: Headings;

  @Column({
    nullable: true
  })
  headingQuantity!: string;

  @Column({
    nullable: true
  })
  image!: string;

  @Column({
    nullable: true
  })
  telegram!: string;

  @Column({
    nullable: false,
    default: " "
  })
  token!: string;

  @Column({
    nullable: false,
    default: " "
  })
  secret!: string;

  @CreateDateColumn({type: "timestamptz"})
  creation_date!: Date;
}