import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class UpdateMessageDto {
    @IsString()
    @IsNotEmpty()
    id: string;

    @IsString()
    @IsOptional()
    content?: string;
}
