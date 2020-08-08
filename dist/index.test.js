"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const apollo_server_1 = require("apollo-server");
const apollo_server_testing_1 = require("apollo-server-testing");
const graphql_middleware_1 = require("graphql-middleware");
const _1 = require(".");
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
    },
];
const resolvers = {
    Query: {
        books: () => books,
        nullableBook: (_, { id }) => books.find((book) => book.id === id) || null,
        nullableBooks: () => [...books, null],
    },
};
const bookFilterFunction = ({ result }) => result ? !result.private : false;
const filterMap = {
    Book: {
        // Replace private book to null.
        mode: 'null',
        function: bookFilterFunction,
    },
    '[Book]!': {
        // Replace private books in array to null.
        mode: 'null',
        function: bookFilterFunction,
    },
    '[Book!]!': {
        // Remove private books from array.
        mode: 'remove',
        function: bookFilterFunction,
    },
};
const schema = graphql_middleware_1.applyMiddleware(apollo_server_1.makeExecutableSchema({ typeDefs, resolvers }), (resolve, parent, args, context, info) => _1.default({
    filterMap,
    resolve,
    parent,
    args,
    context,
    info,
}));
const server = new apollo_server_1.ApolloServer({ schema });
const { query } = apollo_server_testing_1.createTestClient(server);
test('filter books', async () => {
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
test('filter nullableBook', async () => {
    const response = await query({
        query: apollo_server_1.gql `
      query {
        book1: nullableBook(id: 1) {
          id
          private
        }
        book2: nullableBook(id: 2) {
          id
          private
        }
        notExistedBook: nullableBook(id: -1) {
          id
          private
        }
      }
    `,
    });
    expect(response).toMatchSnapshot();
});
test('filter nullableBooks', async () => {
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
//# sourceMappingURL=index.test.js.map