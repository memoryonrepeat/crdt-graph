// Last-write-win CRDT for set, based on the official paper
class LWWSet {
  constructor(addSet = new Map(), removeSet = new Map()){
    this.addSet = addSet
    this.removeSet = removeSet
  }

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

  // Util method to return all existing elements
  entries(){
    const entries = new Set()

    for (const key of Array.from(this.addSet.keys())){
      if (this.lookup(key) === true){
        entries.add(key)
      }
    }

    return entries
  }

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