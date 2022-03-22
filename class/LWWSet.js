// Last-write-win CRDT for set, based on the official paper
class LWWSet {

  // Using map instead of objects because:
  // - Map allows keys of any type, unlike objects where only strings / symbols is allowed
  // - It also means Map preserves the type of the key (no conversion)
  // - Map is more performant on frequent adding / removals which fits the use case
  // - Map doesn't have any key by default. Object has prototypes which might cause conflicts and reduce performance
  // - Map preserves insertion order, might be useful later
  constructor(addSet = new Map(), removeSet = new Map()){
    this.addSet = addSet
    this.removeSet = removeSet
  }

  // Update utility to add any element to add / remove set
  _update(element, timestamp = Date.now(), targetSet = this.addSet){
    if (targetSet.has(element) === false){
      targetSet.set(element, timestamp)
  
      return
    }

    const currentTimestamp = targetSet.get(element)

    if (currentTimestamp < timestamp){
      targetSet.set(element, timestamp)
    }
  }

  add(element, timestamp = Date.now()){
    this._update(element, timestamp, this.addSet)
  }

  remove(element, timestamp = Date.now()){
    if (this.lookup(element) === false){
      return
    }
    
    this._update(element, timestamp, this.removeSet)
  }

  lookup(element){
    if (this.addSet.has(element) === false){
      return false
    }

    if (this.removeSet.has(element) === false){
      return true
    }

    // In case of equal timestamp, give priority to remove operation
    if (this.addSet.get(element) <= this.removeSet.get(element)){
      return false
    }

    return true
  }

  // Util method to return all existing elements to use later in adjacency matrix construction
  entries(){
    const entries = new Set()

    for (const key of Array.from(this.addSet.keys())){
      if (this.lookup(key) === true){
        entries.add(key)
      }
    }

    return entries
  }

  // Merge with another set in LWW manner
  merge(otherSet){
    let mergedSet = new LWWSet()
    
    mergedSet.addSet = new Map([...this.addSet])
    mergedSet.removeSet = new Map([...this.removeSet])

    otherSet.addSet.forEach((value, key) => {
      if (mergedSet.addSet.has(key) === false){
        mergedSet.addSet.set(key, value)
        
        return
      }

      if (mergedSet.addSet.get(key) < value){
        mergedSet.addSet.set(key, value)
      }
    })

    otherSet.removeSet.forEach((value, key) => {
      if (mergedSet.removeSet.has(key) === false){
        mergedSet.removeSet.set(key, value)
        
        return
      }

      if (mergedSet.removeSet.get(key) < value){
        mergedSet.removeSet.set(key, value)
      }
    })

    return mergedSet
  }
}

module.exports = LWWSet