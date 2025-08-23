import { Column, Entity } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity('otps')
export class Otp extends BaseEntity {
  @Column()
  email: string;

  @Column()
  otp_code: string;

  @Column({ default: 'password_reset' })
  type: string; // 'password_reset', 'email_verification', etc.

  @Column({ default: false })
  is_used: boolean;

  @Column({ name: 'expires_at' })
  expires_at: Date;
}
