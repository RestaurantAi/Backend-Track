import {
  Controller,
  All,
  Req,
  Res,
  Param,
  UseGuards,
} from '@nestjs/common';
import express from 'express';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { ProxyService } from './proxy.service';
import { JwtAuthGuard } from '@app/common/gaurds';


@ApiTags('Proxy')
@ApiBearerAuth()
@Controller('api/v1')
@UseGuards(JwtAuthGuard)
export class ProxyController {
  constructor(private readonly proxyService: ProxyService) {}

  @All('auth/*')
  async proxyAuth(
    @Req() req: express.Request,
    @Res() res: express.Response,
    @Param() params: any,
  ) {
    return this.proxyService.proxyRequest(req, res, 'auth-service', 3001);
  }

  @All('organizations/*')
  async proxyOrganizations(
    @Req() req: express.Request,
    @Res() res: express.Response,
  ) {
    return this.proxyService.proxyRequest(req, res, 'organization-service', 3002);
  }

  @All('procurement/*')
  async proxyProcurement(
    @Req() req: express.Request,
    @Res() res: express.Response,
  ) {
    return this.proxyService.proxyRequest(req, res, 'procurement-service', 3003);
  }

  @All('stock/*')
  async proxyStock(
    @Req() req: express.Request,
    @Res() res: express.Response,
  ) {
    return this.proxyService.proxyRequest(req, res, 'stock-control-service', 3004);
  }

  @All('processing/*')
  async proxyProcessing(
    @Req() req: express.Request,
    @Res() res: express.Response,
  ) {
    return this.proxyService.proxyRequest(req, res, 'processing-service', 3005);
  }

  @All('kitchen/*')
  async proxyKitchen(
    @Req() req: express.Request,
    @Res() res: express.Response,
  ) {
    return this.proxyService.proxyRequest(req, res, 'kitchen-service', 3006);
  }

  @All('pos/*')
  async proxyPOS(
    @Req() req: express.Request,
    @Res() res: express.Response,
  ) {
    return this.proxyService.proxyRequest(req, res, 'pos-service', 3007);
  }

  @All('accounting/*')
  async proxyAccounting(
    @Req() req: express.Request,
    @Res() res: express.Response,
  ) {
    return this.proxyService.proxyRequest(req, res, 'accounting-service', 3008);
  }

  @All('analytics/*')
  async proxyAnalytics(
    @Req() req: express.Request,
    @Res() res: express.Response,
  ) {
    return this.proxyService.proxyRequest(req, res, 'analytics-service', 3009);
  }
}