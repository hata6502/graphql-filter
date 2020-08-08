"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const apollo_server_1 = require("apollo-server");
const apollo_server_testing_1 = require("apollo-server-testing");
const graphql_middleware_1 = require("graphql-middleware");
describe('graphql-filter', () => {
    const typeDefs = apollo_server_1.gql `
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
    const schema = graphql_middleware_1.applyMiddleware(apollo_server_1.makeExecutableSchema({ typeDefs, resolvers }), async (resolve, root, args, context, info) => {
        const result = await resolve(root, args, context, info);
        console.log(info.returnType.toString());
        console.log(result);
        if (info.returnType.toString() === '[Book]!') {
            return [{}];
        }
        return result;
    });
    const server = new apollo_server_1.ApolloServer({ schema });
    const { query } = apollo_server_testing_1.createTestClient(server);
    it('should filter book', async () => {
        const response = await query({
            query: apollo_server_1.gql `
        query {
          book {
            title
          }
        }
      `,
        });
        expect(response).toMatchSnapshot();
    });
    it('should filter books', async () => {
        const response = await query({
            query: apollo_server_1.gql `
        query {
          books {
            title
          }
        }
      `,
        });
        expect(response).toMatchSnapshot();
    });
});
//# sourceMappingURL=index.test.js.map