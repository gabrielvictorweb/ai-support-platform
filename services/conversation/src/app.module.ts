import { Module } from '@nestjs/common';
import { HealthModule } from './infra/modules/health.module';
import { MetricsModule } from './infra/modules/metrics.module';
import { ConversationModule } from './infra/modules/conversation.module';
import { InviteModule } from './infra/modules/invite.module';
import { ConfigModule } from '@nestjs/config';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
        }),
        HealthModule,
        MetricsModule,
        ConversationModule,
        InviteModule,
    ],
    controllers: [],
    providers: [],
})
export class AppModule {}
