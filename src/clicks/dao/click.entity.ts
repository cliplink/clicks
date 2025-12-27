import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity('clicks')
@Index('IDX_CLICKS_LINK_ID', ['linkId'])
export class ClickEntity {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  public id: string;

  @Column({ type: 'bigint', name: 'link_id' })
  public linkId: string;

  @CreateDateColumn({ type: 'timestamptz', default: 'now()', name: 'occurred_at' })
  public occurredAt: Date;

  @Column({ type: 'varchar', name: 'ip_hash', nullable: true })
  public ipHash: string | null;

  @Column({ type: 'varchar', name: 'user_agent', nullable: true })
  public userAgent: string | null;

  @Column({ type: 'varchar', name: 'referrer', nullable: true })
  public referer: string | null;

  @Column({ type: 'varchar', name: 'country', nullable: true })
  public country: string | null;

  @Column({ type: 'varchar', name: 'forwarded_for', nullable: true })
  public forwardedFor: string | null;
}
