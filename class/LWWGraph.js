const LWWSet = require('./LWWSet')

// Last-write-win CRDT for undirected graph, based on LWWSet
class LWWGraph {
  constructor(vertexSet = new LWWSet(), edgeSet = new LWWSet()){
    this.vertexSet = vertexSet
    this.edgeSet = edgeSet
    // Model graph as adjacency list to optimize querying about neighbors
    this.constructGraph()
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
    // Edge might have been added in reverse order --> need to consider both cases
    this.edgeSet.remove([start, end], timestamp)
    this.edgeSet.remove([end, start], timestamp)

    // Update adjacency list on both ends
    if (this.graph.has(start)){
      this.graph.get(start).delete(end)
    }

    if (this.graph.has(end)){
      this.graph.get(end).delete(start)
    }
  }

  removeVertex(vertex, timestamp = Date.now()){
    if (this.lookupVertex(vertex) === false){
      return
    }

    for (const neighbor of this.getNeighboringVertices(vertex)){
      // removeEdge will take care of updating on both ends --> only need to call once
      this.removeEdge(vertex, neighbor, timestamp)
    }

    this.vertexSet.remove(vertex, timestamp)
  }

  findPath(start, end, path = []){
    path.push(start)

    if (start === end){
      return path
    }

    // dead end --> return empty path
    if (this.graph.get(start).size === 0){
      return []
    }

    for (const neighbor of this.graph.get(start)){
      if (path.includes(neighbor) === false){ // not visited --> search deeper
        const pathFromHere = this.findPath(neighbor, end, path)
        
        if (pathFromHere.length > 0){
          return pathFromHere
        }
      }
    }

    return []
  }

  // Represent graph as adjacency list for use later
  // Upon merging, this will also resolve potential conflicts
  constructGraph(){
    this.graph = new Map()
    
    for (const vertex of this.vertexSet.entries()){
      this.graph.set(vertex, new Set())
    }

    for (const [start,end] of this.edgeSet.entries()){
      // Remove vertex takes priority over adding edge, as decided in paper
      if (this.lookupVertex(start) === false || this.lookupVertex(end) === false){
        this.removeEdge(start, end)
      }

      this.graph.get(start).add(end)
      this.graph.get(end).add(start)
    }    
  }

  merge(otherGraph){
    const mergedVertexSet = this.vertexSet.merge(otherGraph.vertexSet)
    const mergedEdgeSet = this.edgeSet.merge(otherGraph.edgeSet)

    return new LWWGraph(mergedVertexSet, mergedEdgeSet)
  }
}

module.exports = LWWGraph