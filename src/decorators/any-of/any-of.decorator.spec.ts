import { plainToInstance, Type } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsArray,
  IsEmail,
  IsString,
  validate,
  ValidateNested,
} from 'class-validator';

import { AnyOf } from './any-of.decorator';

@AnyOf(['email', 'phone'])
class CreateUserDto {
  @IsString()
  email: string;

  @IsString()
  phone: string;
}

class NestedExampleDto {
  @ValidateNested()
  @Type(() => CreateUserDto)
  user: CreateUserDto;
}

export class AdminUserInput {
  @IsEmail()
  email: string;
}

export class ModeratorUserInput {
  @IsEmail()
  email: string;

  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  accessRights: string[];
}

@AnyOf(['admin', 'moderator'])
export class DefineUserInput {
  @ValidateNested()
  @Type(() => AdminUserInput)
  admin?: AdminUserInput;

  @ValidateNested()
  @Type(() => ModeratorUserInput)
  moderator?: ModeratorUserInput;
}

describe('AnyOf', () => {
  it.each([{ email: 'email@em.cc' }, { phone: '0123456789' }])(
    'should pass when email or phone is provided',
    async (data) => {
      const user = plainToInstance(CreateUserDto, data);

      const errors = await validate(user);

      expect(errors).toHaveLength(0);
    },
  );

  it('should throw an error when nor email or phone is provided', async () => {
    const user = plainToInstance(CreateUserDto, {});

    const errors = await validate(user);

    expect(errors).toHaveLength(2);
    expect(errors[0].constraints).toStrictEqual({
      isDefined: 'email should not be null or undefined',
      isString: 'email must be a string',
    });
    expect(errors[1].constraints).toStrictEqual({
      isDefined: 'phone should not be null or undefined',
      isString: 'phone must be a string',
    });
  });

  it.each([
    { user: { email: 'email@em.cc' } },
    { user: { phone: '0123456789' } },
  ])(
    'should pass when email or phone is provided in the nested object',
    async (data) => {
      const user = plainToInstance(NestedExampleDto, data);

      const errors = await validate(user);

      expect(errors).toHaveLength(0);
    },
  );

  it('should throw an error when nor email or phone is provided in the nested object', async () => {
    const user = plainToInstance(NestedExampleDto, { user: {} });

    const errors = await validate(user);

    expect(errors).toHaveLength(1);
    expect(errors[0].children![0].constraints).toEqual({
      isDefined: 'email should not be null or undefined',
      isString: 'email must be a string',
    });
    expect(errors[0].children![1].constraints).toEqual({
      isDefined: 'phone should not be null or undefined',
      isString: 'phone must be a string',
    });
  });

  it.each([
    { admin: { email: 'admin@em.cc' } },
    {
      moderator: {
        email: 'moderator@em.cc',
        accessRights: ['read', 'write'],
      },
    },
  ])(
    'should pass when either "admin" or "moderator" is provided',
    async (data) => {
      const res = plainToInstance(DefineUserInput, data);

      const errors = await validate(res);

      expect(errors).toHaveLength(0);
    },
  );

  it('should throw an error when neither "admin" nor "moderator" is provided', async () => {
    const res = plainToInstance(DefineUserInput, {});

    const errors = await validate(res);

    expect(errors).toHaveLength(2);
    expect(errors[0].constraints).toEqual({
      isDefined: 'admin should not be null or undefined',
    });
    expect(errors[1].constraints).toEqual({
      isDefined: 'moderator should not be null or undefined',
    });
  });
});
