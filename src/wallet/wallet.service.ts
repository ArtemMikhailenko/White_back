// src/wallet/wallet.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Wallet, WalletDocument, Asset } from './schemas/wallet.schema';
import { WalletDto, UpdateWalletDto, CreateAssetDto, UpdateAssetDto } from './dto/wallet.dto';

@Injectable()
export class WalletService {
  constructor(
    @InjectModel(Wallet.name) private walletModel: Model<WalletDocument>,
  ) {
    // Инициализация данных при первом запуске
    this.initializeWallet();
  }

  // Преобразование ObjectId в строку для безопасной передачи
  private toObjectId(id: string): Types.ObjectId {
    return new Types.ObjectId(id);
  }

  // Преобразование документа из MongoDB в DTO для клиента
  private mapWalletToDto(wallet: WalletDocument): WalletDto {
    return {
      _id: wallet._id?.toString(),
      balance: wallet.balance,
      currency: wallet.currency,
      equivalentBalance: wallet.equivalentBalance,
      equivalentCurrency: wallet.equivalentCurrency,
      pnl: wallet.pnl,
      assets: wallet.assets.map(asset => ({
        _id: asset._id?.toString(),
        symbol: asset.symbol,
        name: asset.name,
        balance: asset.balance,
        equivalent: asset.equivalent,
        equivalentCurrency: asset.equivalentCurrency,
        icon: asset.icon,
      })),
    };
  }

  // Инициализация данных кошелька, если они еще не созданы
  private async initializeWallet() {
    const walletCount = await this.walletModel.countDocuments().exec();
    
    if (walletCount === 0) {
      // Создаем начальный кошелек
      const initialWallet = new this.walletModel({
        balance: 68.09,
        currency: 'USDT',
        equivalentBalance: 68.08,
        equivalentCurrency: 'USD',
        pnl: {
          value: 0,
          percentage: '0.00',
        },
        assets: [
          {
            symbol: 'USDT',
            name: 'Tether',
            balance: 68.09720717,
            equivalent: 68.09,
            equivalentCurrency: 'USD',
            icon: 'tether',
          }
        ]
      });

      await initialWallet.save();
    }
  }

  // Получить данные кошелька
  async getWallet(): Promise<WalletDto> {
    const wallet = await this.walletModel.findOne().exec();

    if (!wallet) {
      throw new NotFoundException('Wallet not found');
    }

    return this.mapWalletToDto(wallet);
  }

  // Обновить данные кошелька
  async updateWallet(updateWalletDto: UpdateWalletDto): Promise<WalletDto> {
    const wallet = await this.walletModel.findOne().exec();

    if (!wallet) {
      throw new NotFoundException('Wallet not found');
    }

    // Обновляем основные данные кошелька
    wallet.balance = updateWalletDto.balance;
    wallet.currency = updateWalletDto.currency;
    wallet.equivalentBalance = updateWalletDto.equivalentBalance;
    wallet.equivalentCurrency = updateWalletDto.equivalentCurrency;
    wallet.pnl = updateWalletDto.pnl;
    
    // Преобразуем активы из DTO в нужный формат для MongoDB
    const mappedAssets: Asset[] = updateWalletDto.assets.map(assetDto => {
      const asset: Asset = {
        symbol: assetDto.symbol,
        name: assetDto.name,
        balance: assetDto.balance,
        equivalent: assetDto.equivalent,
        equivalentCurrency: assetDto.equivalentCurrency,
        icon: assetDto.icon,
      };

      // Если есть ID, сохраняем его
      if (assetDto._id) {
        asset._id = new Types.ObjectId(assetDto._id);
      }

      return asset;
    });

    wallet.assets = mappedAssets;
    const updatedWallet = await wallet.save();

    return this.mapWalletToDto(updatedWallet);
  }

  // Добавить новый актив
  async addAsset(createAssetDto: CreateAssetDto): Promise<any> {
    const wallet = await this.walletModel.findOne().exec();

    if (!wallet) {
      throw new NotFoundException('Wallet not found');
    }

    // Создаем новый актив
    const newAsset: Asset = {
      _id: new Types.ObjectId(),
      symbol: createAssetDto.symbol,
      name: createAssetDto.name,
      balance: createAssetDto.balance,
      equivalent: createAssetDto.equivalent,
      equivalentCurrency: createAssetDto.equivalentCurrency,
      icon: createAssetDto.icon || 'tether',
    };

    // Добавляем актив в массив
    wallet.assets.push(newAsset);
    await wallet.save();

    // Возвращаем добавленный актив с его ID
    return {
      _id: newAsset._id?.toString(),
      symbol: newAsset.symbol,
      name: newAsset.name,
      balance: newAsset.balance,
      equivalent: newAsset.equivalent,
      equivalentCurrency: newAsset.equivalentCurrency,
      icon: newAsset.icon,
    };
  }

  // Обновить существующий актив
  async updateAsset(id: string, updateAssetDto: UpdateAssetDto): Promise<any> {
    const wallet = await this.walletModel.findOne().exec();

    if (!wallet) {
      throw new NotFoundException('Wallet not found');
    }

    // Находим индекс актива по ID
    const assetIndex = wallet.assets.findIndex(asset => 
      asset._id && asset._id.toString() === id
    );

    if (assetIndex === -1) {
      throw new NotFoundException(`Asset with ID ${id} not found`);
    }

    // Обновляем данные актива с сохранением ID
    const existingId = wallet.assets[assetIndex]._id;
    wallet.assets[assetIndex] = {
      _id: existingId,
      symbol: updateAssetDto.symbol,
      name: updateAssetDto.name,
      balance: updateAssetDto.balance,
      equivalent: updateAssetDto.equivalent,
      equivalentCurrency: updateAssetDto.equivalentCurrency,
      icon: updateAssetDto.icon,
    };

    await wallet.save();

    // Возвращаем обновленный актив
    const updatedAsset = wallet.assets[assetIndex];
    
    return {
      _id: updatedAsset._id?.toString(),
      symbol: updatedAsset.symbol,
      name: updatedAsset.name,
      balance: updatedAsset.balance,
      equivalent: updatedAsset.equivalent,
      equivalentCurrency: updatedAsset.equivalentCurrency,
      icon: updatedAsset.icon,
    };
  }

  // Удалить актив
  async deleteAsset(id: string): Promise<void> {
    const wallet = await this.walletModel.findOne().exec();

    if (!wallet) {
      throw new NotFoundException('Wallet not found');
    }

    // Находим индекс актива по ID
    const assetIndex = wallet.assets.findIndex(asset => 
      asset._id && asset._id.toString() === id
    );

    if (assetIndex === -1) {
      throw new NotFoundException(`Asset with ID ${id} not found`);
    }

    // Удаляем актив
    wallet.assets.splice(assetIndex, 1);
    await wallet.save();
  }
}