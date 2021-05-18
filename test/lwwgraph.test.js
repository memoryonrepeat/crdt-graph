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
      lwwGraph.removeVertex('e', 6)
      
      expect(lwwGraph.lookupVertex('a')).toBe(false)
      expect(lwwGraph.lookupVertex('b')).toBe(true)
      expect(lwwGraph.lookupVertex('c')).toBe(true)
      expect(lwwGraph.lookupVertex('d')).toBe(true) // still true since add happened after remove
    })

    test('should be able to correctly add/remove/query edges and vertices', () => {
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
      expect(lwwGraph.lookupEdge('b','d')).toBe(true) // edge removal happened earlier than adding

      lwwGraph.addEdge('b', 'e', 13)

      expect(lwwGraph.lookupEdge('b','e')).toBe(true)

      lwwGraph.removeVertex('b')

      // Edges that connected to removed vertex must be removed together
      expect(lwwGraph.lookupVertex('b')).toBe(false)
      expect(lwwGraph.lookupEdge('b','e')).toBe(false)
      expect(lwwGraph.lookupEdge('b','d')).toBe(false)
    })

    test('should be able to merge two graphs without conflict and construct the correct adjacency matrix', () => {
      lwwGraph.addVertex('a', 1)
      lwwGraph.addVertex('b', 2)
      lwwGraph.addVertex('c', 3)
      lwwGraph.addVertex('d', 4)
      lwwGraph.addVertex('e', 5)

      lwwGraph.addEdge('a','b',6)
      lwwGraph.addEdge('a','c',7)
      lwwGraph.addEdge('b','c',8)
      lwwGraph.addEdge('d','c',9)
      lwwGraph.addEdge('d','e',10)

      expect(lwwGraph.lookupEdge('a','b')).toBe(true)
      expect(lwwGraph.lookupEdge('a','c')).toBe(true)
      expect(lwwGraph.lookupEdge('b','c')).toBe(true)
      expect(lwwGraph.lookupEdge('d','c')).toBe(true)
      expect(lwwGraph.lookupEdge('d','e')).toBe(true)

      expect(lwwGraph.graph).toEqual(new Map(Object.entries({
        'a': new Set(['b', 'c']),
        'b': new Set(['a','c']),
        'c': new Set(['a', 'b', 'd']),
        'd': new Set(['c', 'e']),
        'e': new Set(['d'])
      })))
      
      const otherGraph = new LWWGraph()

      otherGraph.addVertex('a', 2)
      otherGraph.removeVertex('a', 3) // will take precedence over addijng edges to a later
      otherGraph.addVertex('f',4)
      otherGraph.addVertex('g',5)
      otherGraph.addVertex('h',6)
      otherGraph.addEdge('f','g',7)
      otherGraph.addEdge('h','g',8)
      otherGraph.addEdge('f','h',9)
      otherGraph.removeEdge('f','g', 10)

      expect(otherGraph.graph).toEqual(new Map(Object.entries({
        'f': new Set(['h']),
        'g': new Set(['h']),
        'h': new Set(['f', 'g'])
      })))

      const mergedGraph = lwwGraph.merge(otherGraph)

      expect(mergedGraph.lookupEdge('a','b')).toBe(false)
      expect(mergedGraph.lookupEdge('a','c')).toBe(false)
      expect(mergedGraph.lookupEdge('b','c')).toBe(true)
      expect(mergedGraph.lookupEdge('d','c')).toBe(true)
      expect(mergedGraph.lookupEdge('d','e')).toBe(true)

      expect(mergedGraph.graph).toEqual(new Map(Object.entries({
        'b': new Set(['c']),
        'c': new Set(['b', 'd']),
        'd': new Set(['c', 'e']),
        'e': new Set(['d']),
        'f': new Set(['h']),
        'g': new Set(['h']),
        'h': new Set(['f', 'g'])
      })))
    })

    test('should be able to find a path between 2 vertices', () => {
      lwwGraph.addVertex('a',1)
      lwwGraph.addVertex('b',2)
      lwwGraph.addVertex('c',3)
      lwwGraph.addVertex('d',4)
      lwwGraph.addVertex('e',5)

      lwwGraph.addEdge('a','b',6)
      lwwGraph.addEdge('a','c',7)
      lwwGraph.addEdge('c','d',8)
      lwwGraph.addEdge('d','b',9)
      lwwGraph.addEdge('d','e',10)

      expect(lwwGraph.graph).toEqual(new Map(Object.entries({
        'a': new Set(['b', 'c']),
        'b': new Set(['a', 'd']),
        'c': new Set(['a','d']),
        'd': new Set(['b', 'c', 'e']),
        'e': new Set(['d'])
      })))

      expect(lwwGraph.findPath('a','e')).toEqual(['a','b','d','e'])

      // Remove b -> d to test if can find an alternative path from a to c
      lwwGraph.removeEdge('b','d', 11)

      expect(lwwGraph.findPath('a','e')).toEqual(['a','c','d','e'])

      // Disconnect graph --> should return empty path
      lwwGraph.removeEdge('c','d', 12)

      expect(lwwGraph.findPath('a','e')).toEqual([])

      // Should be able to find direct path
      lwwGraph.addEdge('a','e',13)

      expect(lwwGraph.findPath('a','e')).toEqual(['a','e'])
    })
  })
})