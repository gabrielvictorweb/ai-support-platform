import { Module } from '@nestjs/common';
import { MetricsController } from '../../interface/controllers/metrics.controller';

@Module({
    controllers: [MetricsController],
})
export class MetricsModule {}
