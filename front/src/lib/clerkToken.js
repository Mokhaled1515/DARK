let tokenGetter = null;

export const setTokenGetter = (getter) => {
  tokenGetter = getter;
};

export const getClerkToken = async () => {
  if (!tokenGetter) {
    return null;
  }

  return await tokenGetter();
};