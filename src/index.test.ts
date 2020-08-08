import { ApolloServer, gql, makeExecutableSchema } from 'apollo-server';
import { createTestClient } from 'apollo-server-testing';
import { applyMiddleware } from 'graphql-middleware';

describe('graphql-filter', () => {
  const typeDefs = gql`
    type Book {
      title: String!
    }

    type Query {
      book: Book
      books: [Book]!
    }
  `;

  const resolvers = {
    Query: {
      book: () => ({
        title: 'title',
      }),
      books: () => [
        {
          title: 'title',
        },
      ],
    },
  };

  const schema = applyMiddleware(
    makeExecutableSchema({ typeDefs, resolvers }),
    async (resolve, root, args, context, info) => {
      const result = await resolve(root, args, context, info)

      console.log(info.returnType.toString());
      console.log(result);

      if (info.returnType.toString() === '[Book]!'){
        return [{}];
      }

      return result;
    }
  );

  const server = new ApolloServer({ schema });
  const { query } = createTestClient(server);

  it('should filter book', async () => {
    const response = await query({
      query: gql`
        query {
          book {
            title
          }
        }
      `,
    });

    expect(response).toMatchSnapshot();
  })

  it('should filter books', async () => {
    const response = await query({
      query: gql`
        query {
          books {
            title
          }
        }
      `,
    });

    expect(response).toMatchSnapshot();
  })
});
