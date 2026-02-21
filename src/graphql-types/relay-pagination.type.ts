import { Type } from '@nestjs/common';
import { Field, ObjectType } from '@nestjs/graphql';

type ClassRef<T> = Type<T>;

export interface Edge<TNode> {
  cursor: string;
  node: TNode;
}

export interface Connection<TEdge> {
  edges: TEdge[];
  pageInfo: PageInfo;
}

@ObjectType()
export class PageInfo {
  @Field(() => String, {
    nullable: true,
    description:
      'The opaque cursor representing the end of the current page',
  })
  endCursor: string | null;

  @Field({
    description:
      'Indicates if there are more items after the current page',
  })
  hasNextPage: boolean;

  @Field({
    description:
      'Indicates if there are more items before the current page',
  })
  hasPreviousPage: boolean;

  @Field(() => String, {
    nullable: true,
    description:
      'The opaque cursor representing the start of the current page',
  })
  startCursor: string | null;
}

export function EdgeType<TNode>(
  classRef: ClassRef<TNode>,
): ClassRef<Edge<TNode>> {
  @ObjectType({ isAbstract: true })
  class EdgeTypeClass {
    @Field(() => String, {
      description: 'An opaque cursor for pagination',
    })
    cursor: string;

    @Field(() => classRef, {
      description: 'The item at the end of the edge',
    })
    node: TNode;
  }

  return EdgeTypeClass;
}

export function ConnectionType<TNode, TEdge extends Edge<TNode>>(
  classRef: ClassRef<TNode>,
  edgeRef?: ClassRef<TEdge>,
): ClassRef<Connection<TEdge>> {
  const resolvedEdgeRef =
    edgeRef ?? (EdgeType(classRef) as ClassRef<TEdge>);

  @ObjectType({ isAbstract: true })
  class ConnectionTypeClass {
    @Field(() => [resolvedEdgeRef], {
      description: 'A list of edges in the connection',
    })
    edges: TEdge[];

    @Field(() => PageInfo, {
      description: 'Information about the current page of results',
    })
    pageInfo: PageInfo;
  }

  return ConnectionTypeClass;
}
