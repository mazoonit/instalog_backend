import express, { Application, Request, Response } from 'express';
import dotenv from 'dotenv';
import bodyParser from 'body-parser';
import events from './routes/events';
const app: Application = express();
const PORT = process.env.PORT || 7070;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//controllers
app.use('/events', events);

//error sink

app.use((error: any, req: express.Request, res: express.Response, next: Function) => {
  res.send(error);
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
