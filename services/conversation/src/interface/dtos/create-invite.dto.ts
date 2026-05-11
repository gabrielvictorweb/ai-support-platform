import { IsString, IsNotEmpty } from 'class-validator';

export class CreateInviteDto {
    @IsString()
    @IsNotEmpty()
    conversationId: string;

    @IsString()
    @IsNotEmpty()
    userId: string;
}
