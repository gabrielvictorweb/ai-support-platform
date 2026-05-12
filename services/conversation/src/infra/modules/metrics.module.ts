import { Module } from '@nestjs/common';
import { MetricsController } from '../../presentation/controllers/metrics.controller';

@Module({
    controllers: [MetricsController],
})
export class MetricsModule {}
