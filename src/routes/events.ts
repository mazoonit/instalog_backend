import express, { Request, Response } from 'express';
import serializer from '../utilities/serializer';
import { validatorMiddleware } from '../utilities/validator';
import GenericError from '../utilities/GenericError';
import { getObjectIdByAnotherField } from '../utilities/events_utilities/events';
import { prisma } from '../utilities/prisma';
const router = express.Router();

router.get('/', async (req: Request, res: Response, next: Function) => {
  return res.status(200).send({
    message: 'Hello World!',
  });
});
/*
{
  "id": "evt_15B56WILKW5K",
  "object": "event",
  "actor_id": "user_3VG74289PUA2",
  "actor_name": "Ali Salah",
  "group": "instatus.com",
  "action": {
    "id": "evt_action_PGTD81NCAOQ2",
    "object": "event_action",
    "name": "user.login_succeeded"
  },
  "target_id": "user_DOKVD1U3L030",
  "target_name": "ali@instatus.com",
  "location": "105.40.62.95",
  "occurred_at": "2022-01-05T14:31:13.607Z",
  "metadata": {
    "redirect": "/setup",
    "description": "User login succeeded.",
    "x_request_id": "req_W1Y13QOHMI5H"
  },
}
*/
router.post('/', async (req: Request, res: Response, next: Function) => {
  //serializer
  try {
    let event = serializer(
      ['actor_name', 'target_name', 'location', 'occurred_at', 'metadata', 'action', 'group'],
      req.body,
    );
    await getObjectIdByAnotherField({
      searchField: 'name',
      value: 'ali@instatus.com',
      tableName: 'actor',
      data: { name: 'ali', email: 'ali@instatus.com' },
    });
    //get actor_id, target_id, group_id

    return res.status(200).send(event);
  } catch (error) {
    next(error);
  }
});
export default router;
