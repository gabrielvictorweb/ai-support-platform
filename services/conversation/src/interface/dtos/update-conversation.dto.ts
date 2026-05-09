import { IsString, IsNotEmpty, IsOptional, IsArray } from 'class-validator';

export class UpdateConversationDto {
    @IsString()
    @IsNotEmpty()
    id: string;

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    participantIds?: string[];
}
