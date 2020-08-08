"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const apollo_server_1 = require("apollo-server");
const apollo_server_testing_1 = require("apollo-server-testing");
const graphql_middleware_1 = require("graphql-middleware");
describe('graphql-filter', () => {
    const typeDefs = apollo_server_1.gql `
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
            nullableBook: (_, { id }) => books.find(book => book.id === id),
            nullableBooks: () => books,
        },
    };
    const schema = graphql_middleware_1.applyMiddleware(apollo_server_1.makeExecutableSchema({ typeDefs, resolvers }), async (resolve, root, args, context, info) => {
        const result = await resolve(root, args, context, info);
        if (info.returnType.toString() === '[Book!]!') {
            return result.filter((book) => !book.private);
        }
        if (info.returnType.toString() === 'Book') {
            return result.private ? null : result;
        }
        if (info.returnType.toString() === '[Book]!') {
            return result.map((book) => book.private ? null : book);
        }
        return result;
    });
    const server = new apollo_server_1.ApolloServer({ schema });
    const { query } = apollo_server_testing_1.createTestClient(server);
    it('should filter books', async () => {
        const response = await query({
            query: apollo_server_1.gql `
        query {
          books {
            id
            private
          }
        }
      `,
        });
        expect(response).toMatchSnapshot();
    });
    it('should filter nullableBook', async () => {
        const response = await query({
            query: apollo_server_1.gql `
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
    });
    it('should filter nullableBooks', async () => {
        const response = await query({
            query: apollo_server_1.gql `
        query {
          nullableBooks {
            id
            private
          }
        }
      `,
        });
        expect(response).toMatchSnapshot();
    });
});
//# sourceMappingURL=index.test.js.map