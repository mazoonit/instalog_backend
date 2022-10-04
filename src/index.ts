import express, { Application, Request, Response } from 'express';
import dotenv from 'dotenv';
import bodyParser from 'body-parser';
import events from './routes/events';
import { PrismaError } from './constants/prismaErrorCodes';
const app: Application = express();
const PORT = process.env.PORT || 7070;
const cors = require('cors');

app.use(cors({ origin: '*' }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//controllers
app.use('/events', events);
//init db connection

//error sink

app.use((error: any, req: express.Request, res: express.Response, next: Function) => {
  let errorParent = error.constructor.name;
  if (errorParent.includes('Prisma')) {
    errorParent = 'Prisma';
  }
  switch (errorParent) {
    case 'GenericError':
      let genericErr = error.getResponse();
      res.status(genericErr.httpCode).send(genericErr.errorMessage);
      break;
    case 'Prisma':
      //TO FIX
      let prismaErrorMessage = 'Database Error, ';
      for (const prop in PrismaError) {
        if (PrismaError[prop as keyof typeof PrismaError] == error.code) {
          prismaErrorMessage += prop;
        }
      }
      //console.log(error);
      res.status(400).send(prismaErrorMessage);
      break;
    default:
      res.status(500).send('Internal Server Error.');
      break;
  }
});

//not found sink

app.use((req: express.Request, res: express.Response, next: Function) => {
  res.status(404).send('404 Not Found!');
});

try {
  app.listen(PORT, (): void => {
    console.log(`Connected successfully on port ${PORT}`);
  });
} catch (error: any) {
  console.error(`Error occured: ${error.message}`);
}
