// src/wallet/dto/wallet.dto.ts
import { IsString, IsNumber, IsArray, ValidateNested, IsOptional, IsMongoId } from 'class-validator';
import { Type } from 'class-transformer';

export class PnlDto {
  @IsNumber()
  value: number;

  @IsString()
  percentage: string;
}

export class AssetDto {
  @IsOptional()
  @IsMongoId()
  _id?: string;

  @IsString()
  symbol: string;

  @IsString()
  name: string;

  @IsNumber()
  balance: number;

  @IsNumber()
  equivalent: number;

  @IsString()
  equivalentCurrency: string;

  @IsString()
  icon: any;
}

export class WalletDto {
  @IsOptional()
  @IsMongoId()
  _id?: string;
  
  @IsNumber()
  balance: number;

  @IsString()
  currency: string;

  @IsNumber()
  equivalentBalance: number;

  @IsString()
  equivalentCurrency: string;

  @ValidateNested()
  @Type(() => PnlDto)
  pnl: PnlDto;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AssetDto)
  assets: AssetDto[];
}

export class UpdateWalletDto extends WalletDto {}

export class CreateAssetDto {
  @IsString()
  symbol: string;

  @IsString()
  name: string;

  @IsNumber()
  balance: number;

  @IsNumber()
  equivalent: number;

  @IsString()
  equivalentCurrency: string;

  @IsString()
  @IsOptional()
  icon?: any = 'tether';
}

export class UpdateAssetDto extends CreateAssetDto {
  @IsMongoId()
  _id: string;
}