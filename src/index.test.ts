import { ApolloServer, gql, makeExecutableSchema } from 'apollo-server';
import { createTestClient } from 'apollo-server-testing';
import { GraphQLError } from 'graphql';
import { applyMiddleware } from 'graphql-middleware';
import graphQLFilter from '.';
import type { GraphQLFilterFunction, GraphQLFilterMap } from '.';
import type { Book, Resolvers } from './generated/graphql';

const numberOfBooks = 1000;

const typeDefs = gql`
  type Book {
    id: ID!
    private: Boolean!
  }

  type Query {
    nullableBook(id: ID!): Book
    book(id: ID!): Book!
    nullableBooks: [Book]
    books: [Book!]
    strictBooks: [Book!]!
    manyBooks: [Book!]
  }
`;

const manyBooks: Book[] = [...Array(numberOfBooks).keys()].map((index) => ({
  id: String(index + 1),
  private: index % 2 === 1 ? true : false,
}));

const resolvers: Resolvers = {
  Query: {
    nullableBook: (_, { id }) =>
      manyBooks.find((book) => book.id === id) || null,
    book: (_, { id }) => {
      const book = manyBooks.find((book) => book.id === id);

      if (!book) {
        throw new GraphQLError('Not found. ');
      }

      return book;
    },
    nullableBooks: () => [...manyBooks.slice(0, 2), null],
    books: () => manyBooks.slice(0, 2),
    strictBooks: () => manyBooks.slice(0, 2),
    manyBooks: () => manyBooks,
  },
};

const bookFilterFunction: GraphQLFilterFunction<Book> = ({ result }) =>
  result ? !result.private : false;

const filterMap: GraphQLFilterMap = {
  Book: {
    // Replace private book to null.
    mode: 'null',
    function: bookFilterFunction,
  },
  'Book!': {
    // Throw error with private book.
    mode: 'throw',
    function: bookFilterFunction,
  },
  '[Book]': {
    // Replace private books in array to null.
    mode: 'null',
    function: bookFilterFunction,
  },
  '[Book!]': {
    // Remove private books from array.
    mode: 'remove',
    function: bookFilterFunction,
  },
  '[Book!]!': {
    // Throw error with private books in array.
    mode: 'throw',
    function: bookFilterFunction,
  },
};

const schema = applyMiddleware(
  makeExecutableSchema({ typeDefs, resolvers }),
  (resolve, parent, args, context, info) =>
    graphQLFilter({
      filterMap,
      resolve,
      parent,
      args,
      context,
      info,
    })
);

const server = new ApolloServer({ schema });
const { query } = createTestClient(server);

test('replace private book to null', async () => {
  const response = await query({
    query: gql`
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

test('throw error with private book', async () => {
  const response = await query({
    query: gql`
      query {
        book(id: 2) {
          id
          private
        }
      }
    `,
  });

  expect(response).toMatchSnapshot();
});

test('replace private books in array to null', async () => {
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
});

test('remove private books from array', async () => {
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
});

test('throw error with private books in array', async () => {
  const response = await query({
    query: gql`
      query {
        strictBooks {
          id
          private
        }
      }
    `,
  });

  expect(response).toMatchSnapshot();
});

test(`performance test with ${numberOfBooks} books`, async () =>
  query({
    query: gql`
      query {
        manyBooks {
          id
          private
        }
      }
    `,
  }));
