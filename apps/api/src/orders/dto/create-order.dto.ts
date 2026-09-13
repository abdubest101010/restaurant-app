import { Type } from 'class-transformer';
import { IsArray, IsIn, IsOptional, IsString, IsUUID, ValidateNested, IsInt, Min, ArrayMinSize } from 'class-validator';

export class CartItemDto {
  @IsUUID()
  menuItemId!: string;

  @IsInt()
  @Min(1)
  quantity!: number;

  @IsOptional()
  @IsString()
  note?: string;

  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  modifierOptionIds?: string[];
}

export class CreateOrderDto {
  @IsUUID()
  branchId!: string;

  @IsOptional()
  @IsUUID()
  tableId?: string;

  @IsIn(['dine_in', 'pickup', 'delivery'])
  orderType!: 'dine_in' | 'pickup' | 'delivery';

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CartItemDto)
  items!: CartItemDto[];

  @IsOptional()
  @IsString()
  specialInstructions?: string;
}
