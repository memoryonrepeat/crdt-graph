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
}

module.exports = LWWSet