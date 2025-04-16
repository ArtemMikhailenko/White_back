// src/wallet/wallet.controller.ts
import { Controller, Get, Put, Post, Delete, Body, Param, ValidationPipe } from '@nestjs/common';
import { WalletService } from './wallet.service';
import { WalletDto, UpdateWalletDto, CreateAssetDto, UpdateAssetDto } from './dto/wallet.dto';

@Controller('api/wallet')
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @Get()
  async getWallet(): Promise<WalletDto> {
    return this.walletService.getWallet();
  }

  @Put()
  async updateWallet(@Body(new ValidationPipe()) updateWalletDto: UpdateWalletDto): Promise<WalletDto> {
    return this.walletService.updateWallet(updateWalletDto);
  }

  @Post('assets')
  async addAsset(@Body(new ValidationPipe()) createAssetDto: CreateAssetDto) {
    return this.walletService.addAsset(createAssetDto);
  }

  @Put('assets/:id')
  async updateAsset(
    @Param('id') id: string,
    @Body(new ValidationPipe()) updateAssetDto: UpdateAssetDto,
  ) {
    return this.walletService.updateAsset(id, updateAssetDto);
  }

  @Delete('assets/:id')
  async deleteAsset(@Param('id') id: string) {
    return this.walletService.deleteAsset(id);
  }
}