import { IsString, IsUUID } from 'class-validator';

export class CreateIntentDto {
  @IsUUID()
  orderId!: string;
}

export class MarkCashDto {
  @IsUUID()
  orderId!: string;
}

export class CommissionDto {
  @IsUUID()
  restaurantId!: string;

  rate!: number;
}
