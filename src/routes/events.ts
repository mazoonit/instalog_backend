import express, { Request, Response } from 'express';
const router = express.Router();

router.get('/', async (req: Request, res: Response, next: Function) => {
  return res.status(200).send({
    message: 'Hello World!',
  });
});

router.post('/post', async (req: Request, res: Response): Promise<Response> => {
  return res.status(200).send({
    message: 'Hello World from post!',
  });
});
export default router;
