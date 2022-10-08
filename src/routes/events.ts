import express, { Request, Response } from 'express';
import { serialize, queryParser } from '../utilities/serializer';
import { validatorMiddleware } from '../utilities/validator';
import GenericError from '../utilities/GenericError';
import { checkUniqueId, getObjectIdByAnotherField } from '../utilities/events_utilities/events';
import prisma from '../utilities/prisma';
import { create } from 'domain';
import { v4 as uuidv4 } from 'uuid';
import { auth } from '../utilities/auth';
const router = express.Router();

const PAGE_SIZE = 3;

router.get('/', [auth(), queryParser()], async (req: Request, res: Response, next: Function) => {
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
    //parsing pageNumber because query strings are mainly strings :"
    pageNumber = parseInt(pageNumber);
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
});

router.post(
  '/',
  [
    auth(),
    validatorMiddleware([
      { type: 'string', key: 'id' },
      { type: 'string', key: 'actor_id' },
      { type: 'string', key: 'actor_email', required: true },
      { type: 'string', key: 'actor_name', required: true },
      { type: 'string', key: 'target_id' },
      { type: 'string', key: 'target_name', required: true },
      { type: 'string', key: 'group', required: true },
      { type: 'date', key: 'occurred_at', required: true },
      { type: 'string', key: 'location', required: true },
      { type: 'action', key: 'action', required: true },
    ]),
  ],
  async (req: Request, res: Response, next: Function) => {
    //serializer
    try {
      let event = serialize(['id', 'location', 'occurred_at'], req.body);
      let { actor_id, actor_email, actor_name, target_id, target_name, group, action, metadata } = req.body;
      //generate Ids if not exist
      if (!actor_id) {
        actor_id = 'user_' + uuidv4();
      }
      if (!target_id) {
        target_id = 'user_' + uuidv4();
      }
      if (!event.id) {
        event.id = 'evt_' + uuidv4();
      }
      if (!action.id) {
        action.id = 'evt_action_' + uuidv4();
      }

      //create group if not exist or return the id.
      let group_id = await getObjectIdByAnotherField({
        searchField: 'name',
        value: group,
        tableName: 'group',
        data: { name: group },
      });

      //checking if already exists or create new ones.
      let fields = [
        {
          searchField: 'id',
          value: actor_id,
          tableName: 'actor',
          data: { name: actor_name, email: actor_email, id: actor_id },
        },
        { searchField: 'id', value: target_id, tableName: 'target', data: { name: target_name, id: target_id } },
        { searchField: 'id', value: action.id, tableName: 'action', data: { name: action.name, id: action.id } },
      ];
      await Promise.all(
        fields.map(async (field) => {
          await getObjectIdByAnotherField({
            searchField: field.searchField,
            value: field.value,
            tableName: field.tableName,
            data: field.data,
          });
        }),
      );

      //Glowing ids to the event object.

      event.group_id = group_id;
      event.target_id = target_id;
      event.actor_id = actor_id;
      event.action_id = action.id;
      //check unique Id
      await checkUniqueId({ id: event.id, tableName: 'event' });

      //parse metadata into string. and glowing it to the event object.
      event.meta_data = JSON.stringify(metadata);

      //create event id unique.
      let createdEvent = await prisma.event.create({
        data: { ...event },
      });
      return res.status(200).send(createdEvent);
    } catch (error) {
      next(error);
    }
  },
);
export default router;
