import { useQuery, useMutation, queryCache } from "react-query";
import { client } from "./api-client.exercise";
import { setQueryDataForBook } from "./books.exercise";

const useListItems = (user) => {
  const { data: listItems, ...result } = useQuery({
    queryKey: 'list-items',
    queryFn: () => client('list-items', { token: user.token }).then((data) => data.listItems),
    config: {
      onSuccess: (books) => books.forEach(({book}) => setQueryDataForBook(book))
    }
  });

  return { listItems, ...result };
};


const useListItem = (user, bookId) => {
  const { listItems } = useListItems(user);

  return listItems?.find(li => li.bookId === bookId) ?? null;
};

const defaultMutationOptions = {
  onSettled: () => queryCache.invalidateQueries('list-items'),
  onError(error, variables, recover) {
    if (typeof recover === 'function') {
      recover()
    }
  },
}

const useUpdateListItem = (user, options) =>
  useMutation((updates) =>
    client(`list-items/${updates.id}`, {
      method: 'PUT',
      data: updates,
      token: user.token,
    }), {
      onMutate(book) {
        const prevData = queryCache.getQueryData('list-items')
        
        queryCache.setQueryData('list-items', oldData => 
          oldData.map(oldBook => oldBook.id === book.id ? {...oldBook, ...book} : oldBook)
        )
    
        return () => queryCache.setQueryData('list-items', prevData)
      },
      ...defaultMutationOptions,
      ...options});

const useRemoveListItem = (user, options) => useMutation(({ id }) =>
  client(`list-items/${id}`, { method: 'DELETE', token: user.token, })
  , {
    onMutate(book) {
      const oldData = queryCache.getQueryData('list-items')

      queryCache.setQueryData('list-items', oldData => 
        oldData.filter(oldBook => oldBook.id !== book.id)
      )

      return () => queryCache.setQueryData('list-items', oldData) 
    },
    ...defaultMutationOptions, 
    ...options}
    );

const useCreateListItem = (user, options) => useMutation(({bookId}) => 
  client(`list-items`, {method: 'POST', data: {bookId}, token: user.token,})
  , {
    ...defaultMutationOptions, 
    ...options}
    )

export { useListItems, useListItem, useUpdateListItem, useRemoveListItem, useCreateListItem };