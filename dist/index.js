"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const apollo_server_1 = require("apollo-server");
const typeDefs = apollo_server_1.gql `
  type Book {
    title: String!
    author: String!
  }

  type Query {
    books: [Book!]!
  }
`;
const resolvers = {
    Query: {
        books: () => [{
                title: 'title',
                author: 'author'
            }],
    },
};
const server = new apollo_server_1.ApolloServer({ typeDefs, resolvers });
server.listen().then(({ url }) => {
    console.log(`🚀  Server ready at ${url}`);
});
//# sourceMappingURL=index.js.map