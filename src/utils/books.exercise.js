import { client } from "./api-client.exercise";
import bookPlaceholderSvg from 'assets/book-placeholder.svg';
import { useQuery, queryCache } from "react-query";

const loadingBook = {
  title: 'Loading...',
  author: 'loading...',
  coverImageUrl: bookPlaceholderSvg,
  publisher: 'Loading Publishing',
  synopsis: 'Loading...',
  loadingBook: true,
};

const loadingBooks = Array.from({ length: 10 }, (v, index) => ({
  id: `loading-book-${index}`,
  ...loadingBook,
}));

const getBookSearchConfig = (query, user) => {
  return {
    queryKey: ['bookSearch', { query }],
    queryFn: () => client(`books?query=${encodeURIComponent(query)}`, {
      token: user.token,
    }).then(data => data.books),
    config: {
      onSuccess: (books) => books.forEach(setQueryDataForBook)
    }
  }
}

const useBook = (bookId, user) => {
  const { data: book = loadingBook, ...result } = useQuery({
    queryKey: ['book', { bookId }],
    queryFn: () => client(`books/${bookId}`, { token: user.token }).then(data => data.book)
  });

  return { book, ...result };
};

const useBookSearch = (query, user) => {
  const result = useQuery(getBookSearchConfig(query, user));

  return { books: result.data ?? loadingBooks, ...result };
};

const refetchBookSearchQuery = async (user) => {
  queryCache.removeQueries('bookSearch')
  await queryCache.prefetchQuery(getBookSearchConfig('', user))
}

const setQueryDataForBook = (book) => {
  queryCache.setQueryData(['book', {bookId: book.id}], book)
}

export { useBook, useBookSearch, refetchBookSearchQuery, setQueryDataForBook };