import GenericError from './GenericError';
interface ValidatorObject {
  data: any;
  requiredFields?: string[];
  mustIntFields?: string[];
  fieldsValidation?: { type: string; key: string }[];
}

interface FieldValidationObject {
  type: string;
  key: string;
  required?: boolean;
  objectArrayType?: FieldValidationObject[];
  primitiveArrayType?: string;
}

export function validator({ data, fieldsValidation }: ValidatorObject) {
  if (fieldsValidation) {
  }
}

const validatePrimitiveType = (value: any, key: string, type: string) => {
  switch (type) {
    case 'number':
      if (typeof value !== 'number' || isNaN(value)) {
        throw new GenericError(400, `${key} field must be a number!`);
      }
      break;
    case 'int':
      if (!Number.isInteger(value)) {
        throw new GenericError(400, `${key} field must be an Integer!`);
      }
      break;
    case 'string':
      if (typeof value !== 'string') {
        throw new GenericError(400, `${key} field must be a string!`);
      }
      break;
    case 'boolean':
      if (typeof value !== 'boolean') {
        throw new GenericError(400, `${key} field must be a boolean!`);
      }
      break;
    case 'date':
      const date = new Date(value);
      if (date instanceof Date && isNaN(date.valueOf())) {
        throw new GenericError(400, `${key} field must be a date!`);
      }
      break;
  }
};

const validate = (data: any, field: FieldValidationObject) => {
  const { type, key, required } = field;
  const fieldData = data[key];

  if (!fieldData && required) {
    throw new GenericError(400, `${key} field is required!`);
  }

  if (!fieldData) return;

  if (type === 'arrayObject') {
    if (!Array.isArray(fieldData)) throw new GenericError(400, `${key} field must be an array!`);

    const { objectArrayType } = field;
    fieldData.forEach((obj: any) => {
      objectArrayType?.forEach((fieldValidation) => validate(obj, fieldValidation));
    });
    return;
  }

  if (type === 'arrayPrimitive') {
    if (!Array.isArray(fieldData)) throw new GenericError(400, `${key} field must be an array!`);

    const { primitiveArrayType } = field;
    if (primitiveArrayType) fieldData.forEach((val: any) => validatePrimitiveType(val, key, primitiveArrayType));
    return;
  }

  validatePrimitiveType(fieldData, key, type);
};

export function validatorMiddleware(fieldsValidation: FieldValidationObject[]) {
  return (req: any, res: any, next: any) => {
    const data = req.body;

    fieldsValidation.forEach((fieldValidation) => validate(data, fieldValidation));
    next();
  };
}
