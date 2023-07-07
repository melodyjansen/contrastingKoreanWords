import editdistance
from hangul_utils import split_syllables, join_jamos

class KoreanSimilarity(object):
    def __init__(self):
        pass

    # similarity algorithm
    def calculate_similarity(self, word1, word2):
        word1 = self.transform(word1)
        word2 = self.transform(word2)
        edit_distance = editdistance.eval(split_syllables(word1), split_syllables(word2))
        syl_length1 = len(word1)
        syl_length2 = len(word2)
        max_syl_length = max(3 * syl_length1, 3 * syl_length2)
        distance = edit_distance / max_syl_length
        similarity = 1 - distance
        return similarity

    def calculate_dissimilarity(self, word1, word2):
        word1 = self.transform(word1)
        word2 = self.transform(word2)
        edit_distance = editdistance.eval(split_syllables(word1), split_syllables(word2))
        syl_length1 = len(word1)
        syl_length2 = len(word2)
        max_syl_length = max(3 * syl_length1, 3 * syl_length2)
        distance = edit_distance / max_syl_length
        return distance

    # Phoneme normalization
    def transform(self, word):
        k_consonants = ["ᄀ", "ᄏ", "ᄁ"]
        t_consonants = ["ᄃ", "ᄄ", "ᄐ"]
        b_consonants = ["ᄇ", "ᄈ", "ᄑ"]
        s_consonants = ["ᄉ", "ᄊ"]
        j_consonants = ["ᄌ", "ᄍ", "ᄎ"]
        # deconstruct Korean words with split_syllables
        word = split_syllables(word)
        # replace
        for letter in word:
            if letter in k_consonants:
                word = word.replace(letter, "ᄀ")
            if letter in t_consonants:
                word = word.replace(letter, "ᄃ")
            if letter in b_consonants:
                word = word.replace(letter, "ᄇ")
            if letter in s_consonants:
                word = word.replace(letter, "ᄉ")
            if letter in j_consonants:
                word = word.replace(letter, "ᄌ")
        # reconstruct Korean words with join_jamos
        word = join_jamos(word)
        return word
