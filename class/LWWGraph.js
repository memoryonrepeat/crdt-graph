const LWWSet = require('./LWWSet')

class LWWGraph {
  constructor(vertexSet = new LWWSet(), edgeSet = new LWWSet()){
    this.vertexSet = vertexSet
    this.edgeSet = edgeSet
  }

  
}

module.exports = LWWGraph