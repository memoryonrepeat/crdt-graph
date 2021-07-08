# crdt-graph

State-based LWW-Element-Graph CRDT built on top of LWW-Element-Set with test cases.

Supported operations:
- Add/remove vertex/edge.
- Query if vertex is in graph.
- Query for all vertices connected to a vertex.
- Find any path between 2 vertices.
- Merge with concurrent changes from other replicas.

## How to run
- Prerequisite: Node.js >= 12.16.1
- `npm install` then `npm test`
- Test coverage is also generated and available in user-friendly format. Checkout `coverage/lcov-report/index.html` file.

## Background
- Conflict-free replicated data type (CRDT) is a data structure that helps resolving potential conflicts between replicas in distributed environment, thereby safeguarding them from producing inconsistencies when operating independently. Thanks to this characteristic, they are commonly used in collaborative editing apps or large-scale distributed databases (check out https://crdt.tech/ for more details).
- Following the [official paper](https://hal.inria.fr/inria-00555588/document), I first implemented the LWW Set that helps handling set operations between replicas, where conflicts are resolved in a last-write-wins manner. Then I reused that to implement the LWW Graph, where dependencies between vertices and edge operations are resolved by causal delivery thanks to the underlying LWW Set mechanism.
