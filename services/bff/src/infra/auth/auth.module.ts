import { Module } from '@nestjs/common';
import { JwtService } from './jwt.service';
import { UserInfoService } from './userinfo.service';

@Module({
  providers: [JwtService, UserInfoService],
  exports: [JwtService, UserInfoService],
})
export class AuthModule {}
