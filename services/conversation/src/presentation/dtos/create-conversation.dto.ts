import { IsString, IsOptional, IsArray } from 'class-validator';

export class CreateConversationDto {
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    participantIds?: string[];
}
