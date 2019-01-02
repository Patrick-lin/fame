import { map, merge } from 'lodash';
import { gql } from 'apollo-server-express';

import * as player from './player';
import * as game from './game';

const baseTypes = `
  type Query {
    hello: String
  }
  type Mutation {
    hello: String
  }
  type Subscription {
    hello: String
  }

  type BaseResult {
    success: Boolean
    message: BaseResultMessage
  }

  enum BaseResultMessage {
    SUCCESS
    NOT_AUTHORIZED
  }
`;

const schemas = [
  player,
  game,
];

export const typeDefs = [
  gql(baseTypes),
  ...map(schemas, schema => gql(schema.typeDefs)),
];

export const resolvers = merge(
  {
    Query: {
      hello: () => 'hello',
    },
    Mutation: {
      hello: () => 'hello',
    },
  },
  ...map(schemas, 'resolvers'),
);