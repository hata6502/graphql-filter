import { ApolloServer, gql } from 'apollo-server';
import type { QueryResolvers, Resolvers } from './generated/graphql';

const typeDefs = gql`
  type Book {
    title: String!
    author: String!
  }

  type Query {
    books: [Book!]!
  }
`;

const queryResolvers: Required<QueryResolvers> = {
  books: () => [
    {
      title: 'title',
      author: 'author',
    },
  ],
};

const resolvers: Resolvers = {
  Query: queryResolvers,
};

const server = new ApolloServer({ typeDefs, resolvers });

server.listen().then(({ url }) => {
  console.log(`🚀  Server ready at ${url}`);
});
