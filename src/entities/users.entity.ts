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
    default: " "
  })
  email!: string;

  @Column({
    default: " "
  })
  name!: string;

  @Column({
    default: " "
  })
  phoneNumber!: string;
  
  @Column({
    default: " "
  })
  ladnName!: string;

  @Column({
    default: " "
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
    default: "0"
  })
  headingQuantity!: string;

  @Column({
    default: " "
  })
  image!: string;

  @CreateDateColumn({type: "timestamptz"})
  creation_date!: Date;
}