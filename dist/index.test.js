"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const apollo_server_1 = require("apollo-server");
const apollo_server_testing_1 = require("apollo-server-testing");
const graphql_middleware_1 = require("graphql-middleware");
const _1 = require(".");
const numberOfBooks = 1000;
const typeDefs = apollo_server_1.gql `
  type Book {
    id: ID!
    private: Boolean!
  }

  type Query {
    books: [Book!]!
    manyBooks: [Book!]!
    nullableBook(id: ID!): Book
    nullableBooks: [Book]!
  }
`;
const manyBooks = [...Array(numberOfBooks).keys()].map(index => ({
    id: String(index + 1),
    private: index % 2 === 1 ? true : false,
}));
const resolvers = {
    Query: {
        books: () => manyBooks.slice(0, 2),
        manyBooks: () => manyBooks,
        nullableBook: (_, { id }) => manyBooks.find((book) => book.id === id) || null,
        nullableBooks: () => [...manyBooks.slice(0, 2), null],
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
test(`performance test with ${numberOfBooks} books`, async () => query({
    query: apollo_server_1.gql `
      query {
        manyBooks {
          id
          private
        }
      }
    `,
}));
//# sourceMappingURL=index.test.js.map