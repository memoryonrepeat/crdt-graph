const LWWSet = require('./LWWSet')

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
    return this.lookupVertex(start) && this.lookupVertex(end) && this.edgeSet.lookup([start, end])
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
    }
  }

  removeEdge(start, end, timestamp = Date.now()){
    if (this.lookupVertex(start) === false || this.lookupVertex(end) === false){
      return
    }

    this.edgeSet.remove([start, end], timestamp)

    // TODO update
  }

  removeVertex(vertex, timestamp){
    if (this.lookupVertex(vertex) === false){
      return
    }

    for (const neighbor in this.getNeighboringVertices(vertex)){
      // TODO: remove edges
      // Problem: must consider both going in / going out edges
      // How about storing edges as tuples ?
    }
  }
}

module.exports = LWWGraph