// src/wallet/schemas/wallet.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type AssetDocument = Asset & Document;
export type WalletDocument = Wallet & Document;

@Schema()
export class Pnl {
  @Prop({ type: Number, required: true, default: 0 })
  value: number;

  @Prop({ type: String, required: true, default: '0.00' })
  percentage: string;
}

@Schema()
export class Asset {
  _id?: Types.ObjectId; // Явное определение _id для типа Asset

  @Prop({ type: String, required: true })
  symbol: string;

  @Prop({ type: String, required: true })
  name: string;

  @Prop({ type: Number, required: true })
  balance: number;

  @Prop({ type: Number, required: true })
  equivalent: number;

  @Prop({ type: String, required: true, default: 'USD' })
  equivalentCurrency: string;

  @Prop({ type: String, required: true, default: 'tether' })
  icon: any;
}

export const AssetSchema = SchemaFactory.createForClass(Asset);

@Schema()
export class Wallet {
  _id?: Types.ObjectId; // Явное определение _id для типа Wallet

  @Prop({ type: Number, required: true, default: 0 })
  balance: number;

  @Prop({ type: String, required: true, default: 'USDT' })
  currency: string;

  @Prop({ type: Number, required: true, default: 0 })
  equivalentBalance: number;

  @Prop({ type: String, required: true, default: 'USD' })
  equivalentCurrency: string;

  @Prop({ type: Pnl, required: true, default: { value: 0, percentage: '0.00' } })
  pnl: Pnl;

  @Prop({ type: [AssetSchema], default: [] })
  assets: Asset[];
}

export const WalletSchema = SchemaFactory.createForClass(Wallet);