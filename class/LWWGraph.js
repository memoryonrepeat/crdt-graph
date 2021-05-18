const LWWSet = require('./LWWSet')
const EDGE_NOTATION = '->'

// Last-write-win CRDT for undirected graph, based on LWWSet
class LWWGraph {
  constructor(vertexSet = new LWWSet(), edgeSet = new LWWSet()){
    this.vertexSet = vertexSet
    this.edgeSet = edgeSet
    // Model graph as adjacency list to optimize querying about neighbors
    this.constructGraph()
  }

  /*
  Due to JavaScript design, non-primitive keys in map are compared using their reference not their values.
  This means we can't look up using (start,end) tuple after using them as a key, unless we assign them to 
  a variable and refer to it later, which is cumbersome.
  There is no support for custom comparator either, so we can't override this behavior.
  So I decided to stringify the edge notation so that we can simply look them up as a string.
  As long as there is no vertex using same notation, we are good to go. This solution is also more performant
  than other workarounds available, which attempts to provide an alternative interface.
  References:
  - https://stackoverflow.com/a/32660218/1442280
  - https://stackoverflow.com/q/21838436/1442280
  - https://github.com/leafac/collections-deep-equal
  */ 
  stringify(start, end){
    return `${start}${EDGE_NOTATION}${end}`
  }

  // Util method to parse back the stringified edge
  parseEdge(edge){
    return edge.split(EDGE_NOTATION)
  }

  lookupVertex(vertex){
    return this.vertexSet.lookup(vertex)
  }

  lookupEdge(start, end){
    return this.lookupVertex(start) && 
      this.lookupVertex(end) && 
      ( // Since we are dealing with undirected graph, need to consider both directions
        this.edgeSet.lookup(this.stringify(start, end)) || 
        this.edgeSet.lookup(this.stringify(end, start))
      )
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
    if (
      start === end ||
      this.lookupVertex(start) === false || 
      this.lookupVertex(end) === false
    ){
      return
    }

    // Only need to add once to save space. Look up will consider both directions anyway.
    this.edgeSet.add(this.stringify(start, end), timestamp)

    // Only update adjacency list if new edge is added eventually
    if (this.lookupEdge(start, end) === true){
      this.graph.get(start).add(end)
      this.graph.get(end).add(start)
    }
  }

  removeEdge(start, end, timestamp = Date.now()){
    // Edge might have been added in reverse order --> need to consider both cases
    this.edgeSet.remove(this.stringify(start, end), timestamp)
    this.edgeSet.remove(this.stringify(end, start), timestamp)

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

    for (const edge of this.edgeSet.entries()){
      const [start, end] = this.parseEdge(edge)
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