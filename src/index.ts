import { MikroORM } from "@mikro-orm/core";
import { __prod__ } from "./constants";
import { Post } from "./entities/Post";
import mikroCofig from "./mikro-orm.config";

(async () => {
  const orm = await MikroORM.init(mikroCofig);
  await orm.getMigrator().up();

  const post = orm.em.create(Post, { title: "my first post" });
  await orm.em.persistAndFlush(post);

  const posts = await orm.em.find(Post, {});
  console.log(posts);
})().catch((err) => console.error(err));
