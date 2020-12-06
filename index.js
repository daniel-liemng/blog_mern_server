const mongoose = require("mongoose");
const dotenv = require("dotenv");
const { PubSub, ApolloServer } = require("apollo-server");

const typeDefs = require("./graphql/typeDefs");
const resolvers = require("./graphql/resolvers/index");

dotenv.config();

const pubsub = new PubSub();

const PORT = process.env.PORT || 5000;

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: ({ req }) => ({ req, pubsub }),
});

// DB
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("DB Connected");
    return server.listen({ port: PORT });
  })
  .then((res) => {
    console.log(`Server OK at ${res.url}`);
  })
  .catch((err) => {
    console.error(err);
  });
