"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const graphQLFilter = async ({ filterMap, resolve, parent, args, context, info, }) => {
    const result = await resolve(parent, args, context, info);
    const filter = filterMap[info.returnType.toString()];
    if (!filter) {
        return result;
    }
    if (Array.isArray(result)) {
        const modeFunctionMap = {
            null: () => result.map((resultElement) => filter.function({
                result: resultElement,
                parent,
                args,
                context,
                info,
            })
                ? resultElement
                : null),
            remove: () => result.filter((resultElement) => filter.function({
                result: resultElement,
                parent,
                args,
                context,
                info,
            })),
        };
        return modeFunctionMap[filter.mode]();
    }
    return filter.function({ result, parent, args, context, info })
        ? result
        : null;
};
exports.default = graphQLFilter;
//# sourceMappingURL=index.js.map