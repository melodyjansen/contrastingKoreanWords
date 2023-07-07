import pandas as pd
import numpy as np
from KoreanSimilarity import KoreanSimilarity
from Cluster import Cluster
import sys
import io
from sklearn.cluster import KMeans

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

# Read in the CSV file and extract the words from the "ITEMS" column
df = pd.read_csv("korean.csv", encoding="utf-8", delimiter=";")
word_list = df["ITEM"].tolist()

def Kmeans(wordlist, clusters_necessary, maximize, clusters_possible):
    # Create a similarity matrix
    calculator = KoreanSimilarity()
    n = len(wordlist)
    sim_matrix = pd.DataFrame(index=wordlist, columns=wordlist)
    for i in range(n):
        for j in range(n):
            sim_matrix.iloc[i, j] = calculator.calculate_similarity(wordlist[i], wordlist[j])

    # Store cluster averages and clusters for later
    averages = []
    best_clusters = []

    # Loop through cluster size possibilities
    for n_clusters in range(clusters_necessary, clusters_possible + 1):
        # Cluster the data using K-means
        kmeans = KMeans(n_clusters=n_clusters, n_init=10, random_state=42)
        labels = kmeans.fit_predict(sim_matrix)

        if not maximize:
            print(sim_matrix)

        # Create a list of clusters
        clusters = []
        for i in range(n_clusters):
            cluster_indices = np.where(labels == i)[0]
            cluster_words = [wordlist[idx] for idx in cluster_indices]
            cluster = Cluster(cluster_words, sim_matrix)
            if cluster.is_valid() and len(set(len(word) for word in cluster_words)) == 1:
                clusters.append(cluster)

        # Sort the list of clusters in descending order based on their average similarity
        clusters = [c for c in clusters if c.compute_avg_similarity() != 0]  # Skip clusters with no words
        if maximize:
            clusters = sorted(clusters, key=lambda c: c.compute_avg_similarity(), reverse=True)
        else:
            clusters = sorted(clusters, key=lambda c: -c.compute_avg_similarity(), reverse=True)

        # Store the top clusters and their average similarities
        if len(clusters) >= clusters_necessary:
            best_clusters = clusters[:clusters_necessary]
            averages = [cluster.compute_avg_similarity() for cluster in best_clusters]
            break

    six_cluster_avg = [[np.mean(averages[-6:]), len(best_clusters)]] if best_clusters else []

    return best_clusters, averages, six_cluster_avg

best_clusters, averages, six_cluster_avg = Kmeans(word_list, 6, True, 80)
for cluster in best_clusters:
    print(cluster.words)


########################################################################################
# trying to find the best ways to deconstruct similar clusters into dissimilar clusters
########################################################################################
import random
import numpy as np
from sklearn.cluster import AgglomerativeClustering

list1 = ['내용물', '목요일', '화요일', '미용실', '화장실', '사정', '사랑', '사장', '시장', '사탕','문', '운', '면', '눈', '분']
list2 =['에너지', '어머니', '이미지', '메시지', '나머지', '기후', '기차', '기도', '기회', '기대', '물', '불', '풀', '꿀', '줄']
# Set the number of clusters
num_clusters = 3

# Shuffle the list to randomize the order
random.shuffle(list1)
random.shuffle(list2)

def recluster(list, num_clusters):
    # Calculate similarity matrix
    calculator = KoreanSimilarity()
    n = len(list)
    similarity_matrix = pd.DataFrame(index=list, columns=list)
    for i in range(n):
        for j in range(n):
            similarity_matrix.iloc[i, j] = calculator.calculate_similarity(list[i], list[j])

    # Perform Agglomerative Clustering
    clustering = AgglomerativeClustering(n_clusters=num_clusters, affinity='precomputed', linkage='complete')
    cluster_labels = clustering.fit_predict(similarity_matrix)

    # Create empty clusters
    clusters = [[] for _ in range(num_clusters)]

    # Assign elements to clusters based on labels
    for i, word in enumerate(list):
        cluster_index = cluster_labels[i]
        clusters[cluster_index].append(word)

    # Adjust cluster sizes to be equal
    target_size = len(list) // num_clusters

    if any(len(cluster) != target_size for cluster in clusters):
        # Create a flat list of elements and their cluster labels
        flat_list = [(word, cluster_index) for cluster_index, cluster in enumerate(clusters) for word in cluster]

        # Sort the flat list based on cluster labels and similarity
        sorted_list = sorted(flat_list, key=lambda x: (x[1], -calculator.calculate_similarity(x[0], clusters[x[1]][0])))

        # Reassign elements to clusters to balance their sizes
        for i, (word, cluster_index) in enumerate(sorted_list):
            clusters[cluster_index].remove(word)
            new_cluster_index = i % num_clusters
            clusters[new_cluster_index].append(word)

    # Print the clusters
    for i, cluster in enumerate(clusters):
        print(f"Cluster {i+1}: {cluster}")
        cluster = Cluster(cluster, similarity_matrix)
        print(cluster.compute_avg_similarity())

recluster(list1, num_clusters)
recluster(list2, num_clusters)
