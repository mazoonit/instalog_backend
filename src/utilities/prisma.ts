import { PrismaClient } from '@prisma/client';

//export const prisma = new PrismaClient();
class PrismaConnector {
  static prismaClient: PrismaClient = new PrismaClient();
  constructor() {
    if (!PrismaConnector.prismaClient) {
      PrismaConnector.prismaClient = new PrismaClient();
    }
    //return this.prismaClient;
  }
  getConnection() {
    return PrismaConnector.prismaClient;
  }
}
let con = new PrismaConnector();
export default con.getConnection();
