import { Controller, Get } from '@nestjs/common';
import { collectDefaultMetrics, register } from 'prom-client';

@Controller('metrics')
export class MetricsController {
    constructor() {
        collectDefaultMetrics();
    }

    @Get()
    getMetrics(): Promise<string> {
        return register.metrics();
    }
}
