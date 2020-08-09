"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const graphql_1 = require("graphql");
const graphQLFilter = async ({ filterMap, resolve, parent, args, context, info, }) => {
    const result = await resolve(parent, args, context, info);
    const filter = filterMap[info.returnType.toString()];
    if (!filter) {
        return result;
    }
    if (Array.isArray(result)) {
        return {
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
            throw: () => result.forEach((resultElement) => {
                if (!filter.function({
                    result: resultElement,
                    parent,
                    args,
                    context,
                    info,
                })) {
                    throw new graphql_1.GraphQLError('graphql-filter detected inconsistent data by throw mode. ');
                }
            }),
        }[filter.mode]();
    }
    return {
        null: () => filter.function({ result, parent, args, context, info }) ? result : null,
        remove: () => {
            throw new graphql_1.GraphQLError("graphql-filter doesn't support remove mode not for array. ");
        },
        throw: () => {
            if (!filter.function({
                result,
                parent,
                args,
                context,
                info,
            })) {
                throw new graphql_1.GraphQLError('graphql-filter detected inconsistent data by throw mode. ');
            }
        },
    }[filter.mode]();
};
exports.default = graphQLFilter;
//# sourceMappingURL=index.js.map