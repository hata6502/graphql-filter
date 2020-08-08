import type { GraphQLResolveInfo } from 'graphql';
import type { MergeInfo } from 'graphql-tools';
export declare type GraphQLFilterFunction<Result = any, Parent = any, Context = any, Args = any> = (args: {
    result: Result | null;
    parent: Parent;
    args: Args;
    context: Context;
    info: GraphQLResolveInfo;
}) => boolean;
interface GraphQLFilter {
    mode: 'null' | 'remove';
    function: GraphQLFilterFunction;
}
export declare type GraphQLFilterMap = {
    [key: string]: GraphQLFilter | undefined;
};
declare const graphQLFilter: <Parent = any, Context = any, Args = any>({ filterMap, resolve, parent, args, context, info, }: {
    filterMap: GraphQLFilterMap;
    resolve: (source?: Parent | undefined, args?: Args | undefined, context?: Context | undefined, info?: (GraphQLResolveInfo & {
        mergeInfo?: MergeInfo | undefined;
    }) | undefined) => any;
    parent: Parent;
    args: Args;
    context: Context;
    info: GraphQLResolveInfo;
}) => Promise<any>;
export default graphQLFilter;
