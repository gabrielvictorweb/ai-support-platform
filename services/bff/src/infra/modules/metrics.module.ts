import { Module } from '@nestjs/common';
import { MetricsController } from '../../presentation/http/metrics.controller';

@Module({
  controllers: [MetricsController],
})
export class MetricsModule {}
