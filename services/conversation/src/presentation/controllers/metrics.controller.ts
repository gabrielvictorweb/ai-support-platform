import { Controller, Get, Header } from '@nestjs/common';
import { collectDefaultMetrics, register } from 'prom-client';

collectDefaultMetrics();

@Controller('metrics')
export class MetricsController {
    @Get()
    @Header('Content-Type', 'text/plain; version=0.0.4; charset=utf-8')
    getMetrics(): Promise<string> {
        return register.metrics();
    }
}
