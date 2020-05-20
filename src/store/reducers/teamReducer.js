const initState = {}

const teamReducer = (state = initState, action) => {
  switch (action.type) {
    case 'CREATE_EVENT_SUCCESS':
      console.log('create event success');
      return state;
    case 'CREATE_EVENT_ERROR':
      console.log('create event error');
      return state;
    default:
      return state;
  }
};

export default teamReducer;