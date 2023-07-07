/**
 * @author Melody Jansen <melody.jansen@ru.nl>
 * Used code from RandomItemSelect.ts
 */


let past = new Set(); // Set to keep track of last item
let trial = new Set(); // Set to keep track of trial in game

/**
 * Selects the next question by iterating over clusters such that it selects
 * a different cluster next, also updates the myCoodinates variable
 * @returns index of next question
 */
export default function random3CoordinatesItemSelect(): number {
  let i: number;
  const length = this.itemPairs.length;
  if (past.size === 0 || trial.size % length === 0) { // if we are at question 1 or at the start of a new trial
    past.clear();
    i = 0;
  } else if (past.size > 0) {
    const lastItem = Array.from(past).pop(); // find last item
    if (lastItem.index >= (length-5)) { // if last item was in the last cluster, go back to cluster 1
      i = lastItem.index - (length-6);
    } else {
      i = lastItem.index + 5; // else move on to the next cluster
    }
  } 

  coordinates = updateToDoCoordinates()
  const index = this.todo.findIndex(element => element.index === i);
  past.add(this.todo[index]); // add current item as last item
  trial.add(trial.size + 1); // add sum of current amount of total questions

  return i;
}
  
  // Code by Maud van Zundert
  export let coordinates: number[] = updateToDoCoordinates();

  /**
 * (semi) randomizes order of list of coordinates 
 * @author Maud van Zunder <maud.vanzundert@ru.nl>
 * @returns list of coordinates
 */
  export function updateToDoCoordinates(): number[]{
    let coordinates: number[] = [100, 200, 300]
    let randomized_coordinates = coordinates
    .map(value => ({ value, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ value }) => value)

    return randomized_coordinates
}
