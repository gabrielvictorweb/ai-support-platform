import { IsString, IsNotEmpty } from 'class-validator';

export class UpdateInviteStatusDto {
    @IsString()
    @IsNotEmpty()
    id: string;
}
