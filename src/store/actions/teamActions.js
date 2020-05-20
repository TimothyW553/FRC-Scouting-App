export const createEvent = (event) => {
    return (dispatch, getState, {getFirestore}) => {
      const firestore = getFirestore();
      firestore.collection('events').add({
        ...event,
        createdAt: new Date()
      }).then(() => {
        dispatch({ type: 'CREATE_EVENT_SUCCESS' });
      }).catch(err => {
        dispatch({ type: 'CREATE_EVENT_ERROR' }, err);
      });
    }
  };