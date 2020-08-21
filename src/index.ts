import { MikroORM } from "@mikro-orm/core";
import { __prod__ } from "./constants";
import mikroCofig from "./mikro-orm.config";
import express from "express";
import { ApolloServer } from "apollo-server-express";
import { buildSchema } from "type-graphql";
import { HelloResolver } from "./reslovers/hello";

(async () => {
  const orm = await MikroORM.init(mikroCofig);
  await orm.getMigrator().up();

  const app = express();

  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [HelloResolver],
      validate: false,
    }),
  });

  apolloServer.applyMiddleware({ app });

  app.listen(4000, () => console.log("server started on localhost:4000"));
})().catch((err) => console.error(err));
