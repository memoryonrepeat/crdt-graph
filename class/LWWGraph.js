const LWWSet = require('./LWWSet')

// Last-write-win CRDT for undirected graph, based on LWWSet
class LWWGraph {
  constructor(vertexSet = new LWWSet(), edgeSet = new LWWSet()){
    this.vertexSet = vertexSet
    this.edgeSet = edgeSet
    this.graph = new Map() // Model graph as adjacency list to optimize querying about neighbors
  }

  lookupVertex(vertex){
    return this.vertexSet.lookup(vertex)
  }

  lookupEdge(start, end){
    return this.lookupVertex(start) && 
      this.lookupVertex(end) && 
      (this.edgeSet.lookup([start, end]) || this.edgeSet.lookup[end, start])
  }

  getNeighboringVertices(vertex){
    return this.graph.get(vertex)
  }

  addVertex(vertex, timestamp = Date.now()){
    this.vertexSet.add(vertex, timestamp)

    // Only update adjacency list if new vertex is added eventually
    if (this.lookupVertex(vertex) === true && this.graph.has(vertex) === false){
      this.graph.set(vertex, new Set())
    }
  }

  addEdge(start, end, timestamp = Date.now()){
    if (this.lookupVertex(start) === false || this.lookupVertex(end) === false){
      return
    }

    this.edgeSet.add([start, end], timestamp)

    // Only update adjacency list if new edge is added eventually
    if (this.lookupEdge(start, end) === true){
      this.graph.get(start).add(end)
      this.graph.get(end).add(start)
    }
  }

  removeEdge(start, end, timestamp = Date.now()){
    if (this.lookupVertex(start) === false || this.lookupVertex(end) === false){
      return
    }

    // Edge might have been added in reverse order --> need to consider both cases
    this.edgeSet.remove([start, end], timestamp)
    this.edgeSet.remove([end, start], timestamp)

    // Update adjacency list on both ends
    this.graph.get(start).delete(end)
    this.graph.get(end).delete(start)
  }

  removeVertex(vertex, timestamp = Date.now()){
    if (this.lookupVertex(vertex) === false){
      return
    }

    for (const neighbor in this.getNeighboringVertices(vertex)){
      this.removeEdge(vertex, neighbor, timestamp)
    }

    this.vertexSet.remove(vertex, timestamp)
  }
}

module.exports = LWWGraph