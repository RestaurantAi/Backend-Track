import { Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { Request, Response } from 'express';
import { firstValueFrom } from 'rxjs';
import { AxiosRequestConfig } from 'axios';

@Injectable()
export class ProxyService {
  private readonly logger = new Logger(ProxyService.name);

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  async proxyRequest(
    req: Request,
    res: Response,
    serviceName: string,
    defaultPort: number,
  ): Promise<void> {
    try {
      const serviceHost = this.configService.get(
        `${serviceName.toUpperCase().replace('-', '_')}_HOST`,
        'localhost',
      );
      const servicePort = this.configService.get(
        `${serviceName.toUpperCase().replace('-', '_')}_PORT`,
        defaultPort,
      );

      const targetUrl = `http://${serviceHost}:${servicePort}${req.originalUrl}`;

      const config: AxiosRequestConfig = {
        method: req.method as any,
        url: targetUrl,
        headers: {
          ...req.headers,
          'x-forwarded-for': req.ip,
          'x-original-url': req.originalUrl,
        },
        data: req.body,
        params: req.query,
        timeout: 30000, // 30 seconds
      };

      const response = await firstValueFrom(this.httpService.request(config));

      // Forward headers
      Object.keys(response.headers).forEach((key) => {
        if (key !== 'transfer-encoding') {
          res.setHeader(key, response.headers[key]);
        }
      });

      res.status(response.status).json(response.data);
    } catch (error) {
      this.logger.error(
        `Proxy error for ${serviceName}: ${error.message}`,
        error.stack,
      );

      if (error.code === 'ECONNREFUSED') {
        throw new ServiceUnavailableException(
          `${serviceName} is currently unavailable`,
        );
      }

      const status = error.response?.status || 500;
      const data = error.response?.data || { error: 'Internal server error' };
      res.status(status).json(data);
    }
  }
}