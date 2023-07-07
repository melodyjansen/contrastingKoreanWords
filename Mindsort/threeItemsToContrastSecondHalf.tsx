/*
 * @author Melody Jansen <melody.jansen@ru.nl>
 * Used code from ItemToMap
 * Co-authored-by: Zegelaar, M.J. (Miriam) <miriam.zegelaar@ru.nl>
 * Co-authored-by: van Zundert, M. (Maud) <maud.vanzundert@ru.nl>
 */

import React, { useContext, useState } from 'react';
import ItemPair from '../core/item';
import useDragAndDrop from '../hooks/useDragAndDrop';
import FlashCard from './FlashCard';
import { PlayModeProps } from './GameInterface';
import { GameStateContext } from './GameProvider';
import Map from './Map';
import { coordinates } from '../algorithms/item-select/random3CoordinatesItemSelect';
import { clickedItems } from '../core/game';

export default function ThreeItemsToContrastSecondHalf({
  editMode,
  cardZoom,
  mapDimensions,
}: PlayModeProps) {
  const { gameState, gameActions } = useContext(GameStateContext);

  const {
    items,
    onMouseDown,
    onMouseMove,
    onMouseUp,
    zoom,
    setZoom,
    size,
    dragging,
  } = useDragAndDrop(gameState.itemPairs, mapDimensions, editMode);
  
  const clickHandle = (pair: ItemPair) => {
    gameActions.processAnswer(pair.index);
  };

  const threeItems: ItemPair[] = newListToContrast(gameState.itemPairs, gameState?.current);
  return (
    <Map
      dragging={dragging}
      onMouseMove={onMouseMove}
      cardZoom={cardZoom}
      zoom={zoom}
      setZoom={setZoom}
      size={size}
      editMode={editMode}
      onMouseUp={onMouseUp}
      showBack={true}
      backgroundImage={gameState.backgroundImage}
    >      
      {threeItems.map((item: ItemPair) => (
        <FlashCard  
          key={item.index}
          editMode={editMode}
          x={300}  
          y={(item === threeItems[0])? coordinates[0]:(item === threeItems[1])? coordinates[1]:coordinates[2]}  
          zoom={zoom}
          pair={item}
          showBack={true}
          isClickable={true}       
          isActive={threeItems.includes(gameState?.current)}
          isVisible = {threeItems.includes(gameState?.current)}
          onClickCapture={() => clickHandle(item)}
          onMouseDown={onMouseDown(item)}
        />
      ))}
    </Map>
  );
}
  
/**
 * Finds current cluster and selects two ItemPairs from this cluster
 * to contrast with the activePair. Returns the two selected ItemPairs as well as 
 * the current activePair.
 * @param allItems list of all possible item pairs 
 * @param activePair the item pair that is being asked for
 * @returns list with three item pairs, including the active item pair
 */
export function newListToContrast(allItems: ItemPair[], activePair: ItemPair): ItemPair[] {
  let clusters: number[] = [];
  // create a list of all cluster associated with item index: [1,1,1,1,1,2,2,...,3,3,3]
  for (let i = 1; i <= allItems.length/5; i++) {
    for (let j = 1; j <= 5; j++) {
      clusters.push(i);
    }
  }
  let options: ItemPair[][] = GenerateWordTuples(allItems, clusters); // generate list of possible within-cluster 3-element combinations
  let correctOptions: ItemPair[][] = [] // all possible lists for a specific word
  let chosenTuple: ItemPair[] = [];
  for (let i = 0; i < options.length; i++) { // loop through all options
    if (chosenTuple.length < 1) { // if no tuple chosen yet
      let tuple: ItemPair[] = options[i]; 
      if (tuple[0].from === activePair.from) { // if tuple is appropriate for the current activePair
        correctOptions.push(tuple);
      }
    }
  }

  // if first appearance of itempair then nthElement = 0
  let currentTuple: number = nthElementOfTuples(activePair);
  if (clickedItems.size > 0) {
    const lastItem = Array.from(clickedItems).pop();
    if (clusters[lastItem.index] === clusters[activePair.index]) {
      currentTuple = currentTuple - 1;
    }
  }

  for (let i = 0; i < correctOptions.length; i++) {  // loop through all correct options
    if (currentTuple === i) {
      for (let j = 0; j < options[i].length; j++) { // loop through the tuple itself to pick each element from tuple from the allItems list
              const matchingItem = allItems.find(item => {
                return item.from === correctOptions[i][j].from && item.to === correctOptions[i][j].to;
                });
              if (matchingItem) {
                chosenTuple.push(matchingItem);
              }
      }
    }
  }
  return chosenTuple;
}

/**
 * Generates list of possible within-cluster 3-element combinations
 * @param allItems list of all possible item pairs 
 * @param clusters a list with the assigned cluster for each word at their respective index 
 * @returns list with six different possible tuple combinations for each item in allItems
 */
export function GenerateWordTuples(allItems: ItemPair[], clusters: number[]): ItemPair[][] {
  const tuples: ItemPair[][] = [];
  const clusterWords: ItemPair[][] = [];

  // Create a list of clusters, where each cluster consists elements from allItems
  for (let i = 0; i < allItems.length; i++) {
      const targetCluster = clusters[i];

      const cluster: ItemPair[] = [];

      for (let j = 0; j < allItems.length; j++) {
          if (clusters[j] === targetCluster) {
              cluster.push(allItems[j]);
          }
      }
      clusterWords.push(cluster);
    }
  
  // Ensure the list consists of only distinct combinations
  const distClusterWords: ItemPair[][] = distinctListOfLists(clusterWords);

  for (let i=0; i < distClusterWords.length; i++) { // for every cluster in clusters
    const cluster: ItemPair[] = distClusterWords[i];
    for (let j = 0; j < cluster.length; j++) { // for every itempair in that cluster, let it be a targetword
      const targetWord: ItemPair = cluster[j];
      for (let n = 0; n < cluster.length; n++) {  // for every itempair in that cluster let it be a possible combination
        for (let m = n + 1; m < cluster.length; m++) {
          if (n !== j && m !== j) { // except if that combination includes targetword itself
            tuples.push([targetWord,cluster[n],cluster[m]]);
          }
        }
      }
    }
  }
  return tuples;
}

/**
 * Computes amount of times an activePair has been asked so far
 * @param activePair current ItemPair that is being asked
 * @returns sum of how many times activePair has been correctly and incorrectly selected
 */
export function nthElementOfTuples(activePair: ItemPair): number {
  return activePair.getIncorrect() + activePair.getCorrect() + 3;
}

/**
 * Removed duplicates from input list
 * @param listOfLists a list of lists 
 * @returns an array containing a set of lists with no duplicates
 */
function distinctListOfLists(listOfLists: any[][]): any[][] {
  const setOfLists = new Set(listOfLists.map(list => JSON.stringify(list))); // convert each list to a string and add to set
  return Array.from(setOfLists).map(listString => JSON.parse(listString)); // convert each string back to a list and return as an array
}
