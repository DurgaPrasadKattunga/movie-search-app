import { Client, Databases, ID, Query } from "appwrite";

const PROJECT_ID = import.meta.env.VITE_APP_PROJECT_ID;
const DATABASE_ID = import.meta.env.VITE_APP_DATABASE_ID;
const COLLECTION_ID = import.meta.env.VITE_APP_COLLECTION_ID;

const client = new Client()
    .setEndpoint("https://cloud.appwrite.io/v1")
    .setProject(PROJECT_ID);

const database = new Databases(client);

// ✅ Trending movies (ordered by count)
export const getTrendMovies = async () => {
    try {
        const result = await database.listDocuments(
            DATABASE_ID,
            COLLECTION_ID,
            [
                Query.orderDesc("count"),
                Query.limit(5),
            ]
        );
        return result.documents;
    } catch (error) {
        console.error("Error fetching trending movies:", error);
    }
};

// ✅ Track searched movie
export const updateSearchCount = async (SearchTerm, movie) => {
    try {
        const result = await database.listDocuments(
            DATABASE_ID,
            COLLECTION_ID,
            [Query.equal("SearchTerm", SearchTerm)]
        );

        if (result.documents.length > 0) {
            const doc = result.documents[0];
            await database.updateDocument(
                DATABASE_ID,
                COLLECTION_ID,
                doc.$id,
                {
                    count: doc.count + 1,
                }
            );
        } else {
            await database.createDocument(
                DATABASE_ID,
                COLLECTION_ID,
                ID.unique(),
                {
                    SearchTerm,
                    count: 1,
                    movie_id: movie.id,
                    poster_url: `https://image.tmdb.org/t/p/w500/${movie.poster_path}`,
                }
            );
        }
    } catch (error) {
        console.error("Error updating search count:", error);
    }
};
