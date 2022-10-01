import express, { Request, Response } from 'express';
import serializer from '../utilities/serializer';
import { validatorMiddleware } from '../utilities/validator';
import GenericError from '../utilities/GenericError';
import { getObjectIdByAnotherField } from '../utilities/events_utilities/events';
import { prisma } from '../utilities/prisma';
import { create } from 'domain';
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
    let event = serializer(['location', 'occurred_at'], req.body);
    let { actor_email, actor_name, target_name, group, action, metadata } = req.body;

    // get or create new object of actor/group/target
    //group
    let group_id = await getObjectIdByAnotherField({
      searchField: 'name',
      value: group,
      tableName: 'group',
      data: { name: group },
    });
    //actor
    let actor_id = await getObjectIdByAnotherField({
      searchField: 'email',
      value: actor_email,
      tableName: 'actor',
      data: { name: actor_name, email: actor_email },
    });
    //target
    let target_id = await getObjectIdByAnotherField({
      searchField: 'name',
      value: target_name,
      tableName: 'target',
      data: { name: target_name },
    });
    //Glowing ids to the event object.
    event.group_id = group_id;
    event.target_id = target_id;
    event.actor_id = actor_id;

    //create action and glow its Id to the event object.
    let createdAction = await prisma.action.create({
      data: { name: action.name },
    });
    event.action_id = createdAction.id;

    //parse metadata into string. and glowing it to the event object.
    event.meta_data = JSON.stringify(metadata);

    let createdEvent = await prisma.event.create({
      data: { ...event },
    });

    return res.status(200).send(createdEvent);
  } catch (error) {
    console.log(error);
    next(error);
  }
});
export default router;
