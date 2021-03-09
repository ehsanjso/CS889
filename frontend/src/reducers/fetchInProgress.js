const FetchInProgressDefaultState = false;

// eslint-disable-next-line import/no-anonymous-default-export
export default (state = FetchInProgressDefaultState, action) => {
  switch (action.type) {
    case "CHNAGE_PROGRESS":
      return action.fetchInProgress;
    default:
      return state;
  }
};
