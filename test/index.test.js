const LWWSet = require('../class/LWWSet')

describe('LWWSet', () => {

  let lwwSet

  beforeEach(() => {
    lwwSet = new LWWSet()
  })

  afterEach(() => {
    lwwSet = null
  })

  describe('basic add and remove', () => {
    test('should be able to add a new element', () => {
      lwwSet.add('a')
      
      expect(lwwSet.lookup('a')).toBe(true)
    })

    test('should be able to remove an existing element', () => {
      lwwSet.add('a', 1)
      
      expect(lwwSet.lookup('a')).toBe(true)

      lwwSet.remove('a', 2)

      expect(lwwSet.lookup('a')).toBe(false)
    })

    test('should not be able to remove a non-existing element', () => {
      lwwSet.remove('a', 1)
      
      expect(lwwSet.lookup('a')).toBe(false)
      expect(lwwSet.addSet.get('a')).toBe(undefined)
      expect(lwwSet.removeSet.get('a')).toBe(undefined)
    })

    test('should be able to add an element multiple times and keep the latest timestamp', () => {
      lwwSet.add('a', 1)
      
      expect(lwwSet.lookup('a')).toBe(true)
      expect(lwwSet.addSet.get('a')).toBe(1)
      
      lwwSet.add('a', 2)

      expect(lwwSet.lookup('a')).toBe(true)
      expect(lwwSet.addSet.get('a')).toBe(2)
    })

    test('should be able to remove an element multiple times and keep the latest timestamp', () => {
      lwwSet.add('a', 1)

      expect(lwwSet.lookup('a')).toBe(true)

      lwwSet.remove('a', 0)

      expect(lwwSet.lookup('a')).toBe(true) // still exists since remove happened earlier

      lwwSet.remove('a', 1)
      
      expect(lwwSet.lookup('a')).toBe(false)
      expect(lwwSet.addSet.get('a')).toBe(1)
      expect(lwwSet.removeSet.get('a')).toBe(1)
    })

    test('should be able to lookup an element that was removed then added again later', () => {
      lwwSet.add('a', 1)
      
      expect(lwwSet.lookup('a')).toBe(true)

      lwwSet.remove('a', 2)

      expect(lwwSet.lookup('a')).toBe(false)

      lwwSet.add('a', 3)

      expect(lwwSet.lookup('a')).toBe(true)
    })
  })

  describe('merging', () => {
    test('should be able to correctly merge two add-only sets', () => {
      lwwSet.add('a', 1)
      lwwSet.add('b', 2)
      lwwSet.add('c', 3)

      otherSet = new LWWSet()

      otherSet.add('a', 5)
      otherSet.add('b', 1)
      otherSet.add('c', 3)
      otherSet.add('d', 4)

      const mergedSet = lwwSet.merge(otherSet)

      expect(mergedSet.lookup('a')).toBe(true)
      expect(mergedSet.lookup('b')).toBe(true)
      expect(mergedSet.lookup('c')).toBe(true)
      expect(mergedSet.lookup('d')).toBe(true)

      expect(mergedSet.addSet.get('a')).toBe(5)
      expect(mergedSet.addSet.get('b')).toBe(2)
      expect(mergedSet.addSet.get('c')).toBe(3)
      expect(mergedSet.addSet.get('d')).toBe(4)
    })

    test('should be able to correctly merge two sets with both add and remove operations', () => {
      lwwSet.add('a', 1)
      lwwSet.add('b', 2)
      lwwSet.add('c', 3)
      lwwSet.add('d', 4)
      lwwSet.remove('b', 5)
      lwwSet.add('e',7)

      let otherSet = new LWWSet()

      otherSet.remove('a', 5)
      otherSet.add('b', 1)
      otherSet.add('c', 4)
      otherSet.remove('d', 3)
      otherSet.remove('b',6)
      otherSet.add('e', 6)
      otherSet.remove('e',8)

      const mergedSet = lwwSet.merge(otherSet)

      // remove 'a' was never executed in other set since a was not added first (precondition)
      expect(mergedSet.lookup('a')).toBe(true)
      expect(mergedSet.lookup('b')).toBe(false)
      expect(mergedSet.lookup('c')).toBe(true)
      expect(mergedSet.lookup('d')).toBe(true)
      expect(mergedSet.lookup('e')).toBe(false)

      expect(mergedSet.addSet.get('a')).toBe(1)
      expect(mergedSet.removeSet.get('b')).toBe(6)
      expect(mergedSet.addSet.get('c')).toBe(4)
      expect(mergedSet.addSet.get('d')).toBe(4)
      expect(mergedSet.removeSet.get('e')).toBe(8)
    })
  })
})