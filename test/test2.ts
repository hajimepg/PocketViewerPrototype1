import test from "ava";

const fn = async () => Promise.resolve("hoge");

test(async (t) => {
    t.is(await fn(), "hoge");
});
