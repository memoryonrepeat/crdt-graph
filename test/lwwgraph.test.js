const LWWGraph = require('../class/LWWGraph')

describe('LWWGraph', () => {
  let lwwGraph

  beforeEach(() => {
    lwwGraph = new LWWGraph()
  })

  afterEach(() => {
    lwwGraph = null
  })

  describe('basic operations', () => {
    test('should be able to intialize an empty graph', () => {
      expect(lwwGraph).toBeInstanceOf(LWWGraph)
    })

    test('should correctly stringify edges', () => {
      expect(lwwGraph.stringify('a','b')).toBe('a->b')
    })

    test('should correctly parse stringified edges', () => {
      expect(lwwGraph.parseEdge('a->b')).toStrictEqual(['a','b'])
    })

    test('should be able to correctly add/remove/query vertices', () => {
      lwwGraph.addVertex('a', 1)
      lwwGraph.addVertex('b', 2)
      lwwGraph.addVertex('c', 3)
      lwwGraph.addVertex('d', 4)
      lwwGraph.removeVertex('a', 5)
      lwwGraph.removeVertex('d', 3)
      
      expect(lwwGraph.lookupVertex('a')).toBe(false)
      expect(lwwGraph.lookupVertex('b')).toBe(true)
      expect(lwwGraph.lookupVertex('c')).toBe(true)
      expect(lwwGraph.lookupVertex('d')).toBe(true) // still true since add happened after remove
    })

    test('should be able to correctly add/remove/query edges', () => {
      lwwGraph.addVertex('a', 1)
      lwwGraph.addVertex('b', 2)
      lwwGraph.addVertex('c', 3)
      lwwGraph.addVertex('d', 4)
      lwwGraph.removeVertex('a', 5)
      lwwGraph.removeVertex('d', 3)
      lwwGraph.addVertex('e', 6)
      
      expect(lwwGraph.lookupVertex('a')).toBe(false)
      expect(lwwGraph.lookupVertex('b')).toBe(true)
      expect(lwwGraph.lookupVertex('c')).toBe(true)
      expect(lwwGraph.lookupVertex('d')).toBe(true)
      expect(lwwGraph.lookupVertex('e')).toBe(true)

      lwwGraph.addEdge('a', 'b', 7)
      lwwGraph.addEdge('b', 'c', 8)

      expect(lwwGraph.lookupEdge('b','c')).toBe(true)
      expect(lwwGraph.lookupEdge('c','b')).toBe(true)

      lwwGraph.addEdge('c', 'b', 9)

      lwwGraph.removeEdge('b', 'c', 10)

      expect(lwwGraph.lookupEdge('b','c')).toBe(false)
      expect(lwwGraph.lookupEdge('c','b')).toBe(false)

      lwwGraph.addEdge('c', 'c', 10)
      lwwGraph.addEdge('c', 'd', 11)
      lwwGraph.addEdge('b', 'd', 12)
      lwwGraph.removeEdge('b', 'd', 6)

      expect(lwwGraph.lookupEdge('a','b')).toBe(false) // vertex a was deleted before
      expect(lwwGraph.lookupEdge('c','c')).toBe(false)
      expect(lwwGraph.lookupEdge('c','d')).toBe(true)
      expect(lwwGraph.lookupEdge('d','c')).toBe(true)
      expect(lwwGraph.lookupEdge('b','d')).toBe(true)
    })
  })
})