import express, { Request, Response } from 'express';
import serializer from '../utilities/serializer';
import { validatorMiddleware } from '../utilities/validator';
import GenericError from '../utilities/GenericError';
import { getObjectIdByAnotherField } from '../utilities/events_utilities/events';
import { prisma } from '../utilities/prisma';
import { create } from 'domain';
const router = express.Router();

const PAGE_SIZE = 10;

router.get(
  '/',
  [
    validatorMiddleware([
      { type: 'string', key: 'actor_email' },
      { type: 'string', key: 'actor_name' },
      { type: 'string', key: 'target_name' },
      { type: 'string', key: 'group_name' },
      { type: 'string', key: 'action_name' },
      { type: 'int', key: 'actor_id' },
      { type: 'int', key: 'target_id' },
      { type: 'int', key: 'group_id' },
      { type: 'int', key: 'action_id' },
      { type: 'string', key: 'searchValue' },
      { type: 'int', key: 'pageNumber' },
    ]),
  ],
  async (req: Request, res: Response, next: Function) => {
    try {
      let {
        pageNumber,
        searchValue,
        group_id,
        group_name,
        actor_id,
        actor_name,
        actor_email,
        target_id,
        target_name,
        action_id,
        action_name,
      } = req.body;
      if (!pageNumber) {
        pageNumber = 1;
      }
      const events = await prisma.event.findMany({
        where: {
          AND: [
            {
              OR: [
                {
                  actor: {
                    name: { contains: searchValue },
                  },
                },
                {
                  actor: {
                    email: { contains: searchValue },
                  },
                },
                {
                  target: {
                    name: { contains: searchValue },
                  },
                },
                {
                  action: {
                    name: { contains: searchValue },
                  },
                },
                {
                  group: {
                    name: { contains: searchValue },
                  },
                },
              ],
            },
            {
              actor_id: actor_id,
              target_id: target_id,
              action_id: action_id,
              group_id: group_id,
              actor: {
                name: { contains: actor_name },
                email: { contains: actor_email },
              },
              target: {
                name: { contains: target_name },
              },
              action: {
                name: { contains: action_name },
              },
              group: {
                name: { contains: group_name },
              },
            },
          ],
        },
        include: {
          actor: true,
          action: true,
          group: true,
          target: true,
        },
        skip: PAGE_SIZE * ((!pageNumber || pageNumber < 1 ? 1 : pageNumber) - 1),
        take: PAGE_SIZE,
      });

      return res.status(200).send(events);
    } catch (error) {
      next(error);
    }
  },
);

router.post(
  '/',
  [
    validatorMiddleware([
      { type: 'string', key: 'actor_email', required: true },
      { type: 'string', key: 'actor_name', required: true },
      { type: 'string', key: 'target_name', required: true },
      { type: 'string', key: 'group', required: true },
      { type: 'date', key: 'occurred_at', required: true },
      { type: 'string', key: 'location', required: true },
    ]),
  ],
  async (req: Request, res: Response, next: Function) => {
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
  },
);
export default router;
