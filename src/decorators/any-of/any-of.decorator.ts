import { applyDecorators } from '@nestjs/common';
import { IsDefined, ValidateIf } from 'class-validator';

/**
 * @description
 * Do not annotate the fields with `@IsOptional` since it will not validate them at all.
 */
export function AnyOf(properties: string[]) {
  return function (target: any) {
    for (const property of properties) {
      const otherProps = properties.filter(
        (prop) => prop !== property,
      );
      const decorators = [
        ValidateIf((obj: Record<string, unknown>) => {
          const isCurrentPropDefined = obj[property] !== undefined;
          const areOtherPropsUndefined = otherProps.reduce(
            (acc, prop) => acc && obj[prop] === undefined,
            true,
          );

          return isCurrentPropDefined || areOtherPropsUndefined;
        }),
      ];

      // For properties that have validators that don't fail on undefined (like @ValidateNested), we need to add IsDefined when all properties are undefined.
      const areAllPropsUndefinedValidator = ValidateIf(
        (obj: Record<string, unknown>) => {
          const areAllPropsUndefined = properties.every(
            (prop) => obj[prop] === undefined,
          );

          return areAllPropsUndefined;
        },
      );

      decorators.push(areAllPropsUndefinedValidator);
      decorators.push(IsDefined());

      for (const decorator of decorators) {
        applyDecorators(decorator)(target.prototype, property);
      }
    }
  };
}
