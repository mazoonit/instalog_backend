import GenericError from '../GenericError';
import { prisma } from '../prisma';
const prismaModels = {
  actor: prisma.actor,
  target: prisma.target,
  group: prisma.group,
  action: prisma.action,
  event: prisma.event,
};
export const getObjectIdByAnotherField = async (props: {
  searchField: string;
  value: string;
  tableName: string;
  data: any;
}) => {
  try {
    //getting data
    let { value, searchField, tableName, data } = props;
    //casting to get the model from the array based on the string variable.
    type ObjectKey = keyof typeof prismaModels;
    const tableNameCasted = tableName as ObjectKey;
    let prismaModel: any = prismaModels[tableNameCasted];

    //casting to create custom where object to search of different fields

    let whereObject: any = {};
    let searchFieldCasted = searchField as keyof typeof whereObject;
    whereObject[searchFieldCasted] = value;

    // checking for object if already exists

    let obj = await prismaModel.findUnique({
      where: { ...whereObject },
    });

    if (obj) {
      //exists ? return Id.
      return obj.id;
    } else {
      // else ? create new obj
      let newObj = await prismaModel.create({ data: data });
      return newObj.id;
    }
  } catch (error) {
    throw new GenericError(500, 'Internal Server Error!');
  }
};

export const checkUniqueId = async (props: { id: string; tableName: string }) => {
  //getting data
  let { id, tableName } = props;
  //casting to get the model from the array based on the string variable.
  type ObjectKey = keyof typeof prismaModels;
  const tableNameCasted = tableName as ObjectKey;
  let prismaModel: any = prismaModels[tableNameCasted];
  // checking for object if already exists

  let obj = await prismaModel.findUnique({
    where: { id: id },
  });

  if (obj) {
    throw new GenericError(400, tableName + ' id already exists!');
  }
  return;
};
