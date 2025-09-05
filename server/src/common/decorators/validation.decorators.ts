import { registerDecorator, ValidationOptions, ValidationArguments } from 'class-validator';

// 한국어 텍스트 길이 검증 (한글 1글자 = 1, 영문/숫자 1글자 = 1)
export function IsKoreanTextLength(min: number, max: number, validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isKoreanTextLength',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [min, max],
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          if (typeof value !== 'string') return false;
          const length = value.length;
          const [minLength, maxLength] = args.constraints;
          return length >= minLength && length <= maxLength;
        },
        defaultMessage(args: ValidationArguments) {
          const [minLength, maxLength] = args.constraints;
          return `${args.property} must be between ${minLength} and ${maxLength} characters`;
        },
      },
    });
  };
}

// 한국 주소 형식 검증
export function IsKoreanAddress(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isKoreanAddress',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any) {
          if (typeof value !== 'string') return false;
          // 한국 주소 패턴: 시/도 + 시/군/구 + 동/읍/면 + 상세주소
          const koreanAddressPattern = /^[가-힣\s\d\-]+$/;
          return koreanAddressPattern.test(value);
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} must be a valid Korean address`;
        },
      },
    });
  };
}

// 한국어 이름 검증 (한글만 허용)
export function IsKoreanName(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isKoreanName',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any) {
          if (typeof value !== 'string') return false;
          const koreanNamePattern = /^[가-힣\s]+$/;
          return koreanNamePattern.test(value) && value.trim().length >= 2;
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} must be a valid Korean name (at least 2 characters)`;
        },
      },
    });
  };
}

// URL 형식 검증 (이미지 URL 등)
export function IsValidUrl(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isValidUrl',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any) {
          if (typeof value !== 'string') return false;
          try {
            new URL(value);
            return true;
          } catch {
            return false;
          }
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} must be a valid URL`;
        },
      },
    });
  };
}

// 카테고리 검증 (특정 값들만 허용)
export function IsValidCategory(allowedValues: string[], validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isValidCategory',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [allowedValues],
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          const [allowed] = args.constraints;
          return allowed.includes(value);
        },
        defaultMessage(args: ValidationArguments) {
          const [allowed] = args.constraints;
          return `${args.property} must be one of: ${allowed.join(', ')}`;
        },
      },
    });
  };
}
