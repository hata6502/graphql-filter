import type { GraphQLResolveInfo } from 'graphql';
import type { MergeInfo } from 'graphql-tools';

export type GraphQLFilterFunction<
  Result = any,
  Parent = any,
  Context = any,
  Args = any
> = (args: {
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

export type GraphQLFilterMap = { [key: string]: GraphQLFilter | undefined };

const graphQLFilter = async <Parent = any, Context = any, Args = any>({
  filterMap,
  resolve,
  parent,
  args,
  context,
  info,
}: {
  filterMap: GraphQLFilterMap;
  resolve: (
    source?: Parent,
    args?: Args,
    context?: Context,
    info?: GraphQLResolveInfo & {
      mergeInfo?: MergeInfo;
    }
  ) => any;
  parent: Parent;
  args: Args;
  context: Context;
  info: GraphQLResolveInfo;
}) => {
  const result = await resolve(parent, args, context, info);
  const filter = filterMap[info.returnType.toString()];

  if (!filter) {
    return result;
  }

  if (Array.isArray(result)) {
    const modeFunctionMap = {
      null: () =>
        result.map((resultElement) =>
          filter.function({
            result: resultElement,
            parent,
            args,
            context,
            info,
          })
            ? resultElement
            : null
        ),
      remove: () =>
        result.filter((resultElement) =>
          filter.function({
            result: resultElement,
            parent,
            args,
            context,
            info,
          })
        ),
    };

    return modeFunctionMap[filter.mode]();
  }

  return filter.function({ result, parent, args, context, info })
    ? result
    : null;
};

export default graphQLFilter;
