const LWWSet = require('../class/LWWSet')

describe('LWWSet', () => {
  describe('constructor', () => {
    test('should be able to construct a LWWSet instance', () => {
      const instance = new LWWSet()
      expect(instance).toBeInstanceOf(LWWSet)
    })
  })

  describe('add element', () => {
    test('should be able to add an entirely new element', () => {
      const lwwSet = new LWWSet()
      
      lwwSet.add('a')
      
      expect(lwwSet.lookup('a')).toBe(true)
    })

    test('should be able to update an existing element with newer timestamp', () => {
      const lwwSet = new LWWSet()
      
      lwwSet.add('a', 1)
      
      expect(lwwSet.lookup('a')).toBe(true)
      expect(lwwSet.addSet.get('a')).toBe(1)
      
      lwwSet.add('a', 2)

      expect(lwwSet.lookup('a')).toBe(true)
      expect(lwwSet.addSet.get('a')).toBe(2)
    })
  })
})