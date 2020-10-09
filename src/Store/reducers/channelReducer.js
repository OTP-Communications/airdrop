const initialState = {
  loading: true,
  channels: [],
  empty: false,
  fetch: false,
  visited: [],
};

export default (state = initialState, { type, payload }) => {
  switch (type) {
    case 'FETCH_SUCCESS':
      return {
        ...state,
        loading: false,
        fetch: true,
        empty: false,
        channels: [...state.channels, payload.pro],
      };
    case 'FETCH_ERROR':
      return {
        ...state,
        empty: false,
        loading: false,
      };
    case 'FETCH_EMPTY':
      return {
        ...state,
        channels: [],
        loading: false,
        fetch: false,
        empty: true,
      };
    case 'SUCCESS_IN_UPDATE':
      return {
        ...state,
        visited: [...state.visited, payload.slug],
      };
    default:
      return state;
  }
};
