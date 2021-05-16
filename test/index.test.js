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

    test('should be able to remove a non-existing element', () => {
      lwwSet.remove('a', 1)
      
      expect(lwwSet.lookup('a')).toBe(false)
      expect(lwwSet.addSet.get('a')).toBe(undefined)
      expect(lwwSet.removeSet.get('a')).toBe(1)
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
      lwwSet.remove('a', 1)
      
      expect(lwwSet.lookup('a')).toBe(false)
      expect(lwwSet.addSet.get('a')).toBe(undefined)
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
})