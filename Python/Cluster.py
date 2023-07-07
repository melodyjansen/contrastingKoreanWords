import pandas as pd
from typing import List

class Cluster(object):

    def __init__(self, words: List[str], sim_matrix: pd.DataFrame):
        self.words = words
        self.size = len(words)
        self.sim_matrix = sim_matrix

    # compute overall within-cluster similarity
    def compute_avg_similarity(self):
        similarities = []
        for i in range(self.size):
            for j in range(i + 1, self.size):
                word1 = self.words[i]
                word2 = self.words[j]
                sim = self.sim_matrix.loc[word1, word2]
                similarities.append(sim)
        if sum(similarities) == 0 or len(similarities) == 0:
            return
        avg_similarity = sum(similarities) / len(similarities)
        return avg_similarity

    # check is clusters consists of exactly 5 words
    def is_valid(self):
        return len(set(self.words)) == 5

    def __str__(self):
        return f"Cluster (Avg similarity: {self.compute_avg_similarity():.3f}): {', '.join(self.words)}"

