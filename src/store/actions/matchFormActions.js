export const createMatchForm = (match_form) => {
    return (dispatch, getState, {getFirestore}) => {
      const firestore = getFirestore();
      const profile = getState().firebase.profile;
      const authorId = getState().firebase.auth.uid;
      firestore.collection('match_forms').add({
        ...match_form,
        authorFirstName: profile.firstName,
        authorLastName: profile.lastName,
        authorId: authorId,
        createdAt: new Date()
      }).then(() => {
        dispatch({ type: 'CREATE_FORM_SUCCESS' });
      }).catch(err => {
        dispatch({ type: 'CREATE_FORM_ERROR' }, err);
      });
    }
  };
  