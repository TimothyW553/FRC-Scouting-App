const initState = {}

const matchFormReducer = (state = initState, action) => {
  switch (action.type) {
    case 'CREATE_FORM_SUCCESS':
      console.log('create form success');
      return state;
    case 'CREATE_FORM_ERROR':
      console.log('create form error');
      return state;
    default:
      return state;
  }
};

export default matchFormReducer;