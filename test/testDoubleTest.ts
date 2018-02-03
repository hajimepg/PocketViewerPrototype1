// tslint:disable:max-classes-per-file

import * as ava from "ava";
import * as td from "testdouble";

function contexualize<T>(getContext: () => T): ava.RegisterContextual<T> {
    ava.test.beforeEach((t) => {
        Object.assign(t.context, getContext());
    });

    return ava.test;
}

const test = contexualize(() => {
    return {
        createRandomProblem: undefined as any,
        savesProblem: undefined as any,
        subject: undefined as any,
        submitProblem: undefined as any,
    };
});

class MathProblem {
    public constructor(
        private createRandomProblem: any,
        private savesProblem: SavesProblem,
        private submitProblem: any
    ) {}

    public generate() {
        const problem = this.createRandomProblem();
        const savedProblem = this.savesProblem.save(problem);

        this.submitProblem(savedProblem);
    }
}

class SavesProblem {
    // tslint:disable-next-line:no-empty
    public constructor() {}
    // tslint:disable-next-line:no-empty
    public save(problem: string) {}
}

test.beforeEach(async (t) => {
    t.context.createRandomProblem = td.function("createRandomProblem");
    t.context.savesProblem = td.constructor(SavesProblem);
    t.context.submitProblem = td.function("submitProblem");

    t.context.subject = new MathProblem(
        t.context.createRandomProblem,
        new t.context.savesProblem(),
        t.context.submitProblem
    );
});

test("MathProblem", (t) => {
    td.when(t.context.createRandomProblem()).thenReturn("some problem");
    td.when(t.context.savesProblem.prototype.save("some problem")).thenReturn("saved problem");

    t.context.subject.generate();

    t.notThrows(() => {
        td.verify(t.context.submitProblem("saved problem"));
    });
});
