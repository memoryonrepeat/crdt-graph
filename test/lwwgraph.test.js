const LWWGraph = require('../class/LWWGraph')

describe('LWWSet', () => {
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
  })
})