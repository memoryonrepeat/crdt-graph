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
    test('should be able to add an entirely new element', () => {
      lwwSet.add('a')
      
      expect(lwwSet.lookup('a')).toBe(true)
    })

    test('should be able to update an existing element with newer timestamp', () => {
      lwwSet.add('a', 1)
      
      expect(lwwSet.lookup('a')).toBe(true)
      expect(lwwSet.addSet.get('a')).toBe(1)
      
      lwwSet.add('a', 2)

      expect(lwwSet.lookup('a')).toBe(true)
      expect(lwwSet.addSet.get('a')).toBe(2)
    })

    test('should be able to remove an existing element', () => {
      lwwSet.add('a', 1)
      
      expect(lwwSet.lookup('a')).toBe(true)

      lwwSet.remove('a', 2)

      expect(lwwSet.lookup('a')).toBe(false)
    })
  })
})