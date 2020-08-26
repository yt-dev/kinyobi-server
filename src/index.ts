import "reflect-metadata"; // [TypeGraphQL] required to make the type reflection work
import { MikroORM } from "@mikro-orm/core";
import { __prod__ } from "./constants";
import mikroCofig from "./mikro-orm.config";
import express from "express";
import { ApolloServer } from "apollo-server-express";
import { buildSchema } from "type-graphql";
import { HelloResolver } from "./resolvers/hello";
import { PostResolver } from "./resolvers/post";
import { UserResolver } from "./resolvers/user";
import redis from "redis";
import session from "express-session";
import connectReids from "connect-redis";
import cors from "cors";

(async () => {
  const orm = await MikroORM.init(mikroCofig);
  await orm.getMigrator().up();

  const app = express();

  const RedisStore = connectReids(session);
  const redisClient = redis.createClient();

  app.use(
    cors({
      origin: "http://localhost:3000",
      credentials: true,
    })
  );

  app.use(
    session({
      name: "qid",
      store: new RedisStore({
        client: redisClient,
        disableTouch: true,
      }),
      cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 365 * 10, // 10 years
        httpOnly: true, // JS cannot access cookie
        sameSite: "lax", // csrf
        secure: __prod__, // cookies only works in https
      },
      saveUninitialized: false,
      secret: "pJf7daPOSOmMbfFQAuNeuA",
      resave: false,
    })
  );

  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [HelloResolver, PostResolver, UserResolver],
      validate: false,
    }),
    context: ({ req, res }) => ({ em: orm.em, req, res }),
  });

  apolloServer.applyMiddleware({
    app,
    cors: false,
  });

  app.listen(4000, () => console.log("server started on localhost:4000"));
})().catch((err) => console.error(err));
