import { ApolloServer, gql, makeExecutableSchema } from 'apollo-server';
import { createTestClient } from 'apollo-server-testing';
import { applyMiddleware } from 'graphql-middleware';

describe('graphql-filter', () => {
  const typeDefs = gql`
    type Book {
      id: ID!
      private: Boolean!
    }

    type Query {
      books: [Book!]!
      nullableBook(id: ID!): Book
      nullableBooks: [Book]!
    }
  `;

  const books = [
    {
      id: '1',
      private: false,
    },
    {
      id: '2',
      private: true,
    }
  ];

  const resolvers = {
    Query: {
      books: () => books,
      nullableBook: (_: any, {id}: {id: string}) => books.find(book => book.id === id),
      nullableBooks: () => books,
    },
  };

  const schema = applyMiddleware(
    makeExecutableSchema({ typeDefs, resolvers }),
    async (resolve, root, args, context, info) => {
      const result = await resolve(root, args, context, info)

      if (info.returnType.toString() === '[Book!]!'){
        return result.filter((book: any) => !book.private);
      }

      if (info.returnType.toString() === 'Book'){
        return result.private ? null : result;
      }

      if (info.returnType.toString() === '[Book]!'){
        return result.map((book: any) => book.private ? null : book);
      }

      return result;
    }
  );

  const server = new ApolloServer({ schema });
  const { query } = createTestClient(server);

  it('should filter books', async () => {
    const response = await query({
      query: gql`
        query {
          books {
            id
            private
          }
        }
      `,
    });

    expect(response).toMatchSnapshot();
  })

  it('should filter nullableBook', async () => {
    const response = await query({
      query: gql`
        query {
          nullableBook1: nullableBook(id: 1) {
            id
            private
          }
          nullableBook2: nullableBook(id: 2) {
            id
            private
          }
        }
      `,
    });

    expect(response).toMatchSnapshot();
  })

  it('should filter nullableBooks', async () => {
    const response = await query({
      query: gql`
        query {
          nullableBooks {
            id
            private
          }
        }
      `,
    });

    expect(response).toMatchSnapshot();
  })
});
