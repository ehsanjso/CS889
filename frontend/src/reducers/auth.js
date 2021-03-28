// eslint-disable-next-line import/no-anonymous-default-export
export default (state = {}, action) => {
  switch (action.type) {
    case "LOGIN":
      return { ...action.user };
    case "UPDATE_USER":
      return { ...state, ...action.userData };
    case "LOGOUT":
      return {};
    default:
      return state;
  }
};
