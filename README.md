# crdt-graph

State-based LWW-Element-Graph CRDT built on top of LWW-Element-Set with test cases.

Supported operations:
- Add/remove vertex/edge
- Query if vertex is in graph
- Query for all vertices connected to a vertex
- Find any path between 2 vertices
- Merge with concurrent changes from other replicas