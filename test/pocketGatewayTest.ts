import test from "ava";

import PocketGateway from "../src/main/gateway/PocketGateway";

test("retrieve", async (t) => {
    const gateway = new PocketGateway();

    const articles = await gateway.retrieve("access token");
    t.is(0, articles.length);
});
