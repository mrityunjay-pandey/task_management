import { IsString, IsNotEmpty, MaxLength } from 'class-validator';

export class CreateCommentDto {
  @IsString()
  @IsNotEmpty({ message: 'Comment cannot be empty' })
  @MaxLength(1000, { message: 'Comment must be 1000 characters or fewer' })
  content: string;
}
