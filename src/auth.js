export function createAuth(client){
  return {
    async ensureGuest(){
      const result=await client.auth.getSession();
      if(result.error||result.data.session)return result;
      return client.auth.signInAnonymously();
    },
    subscribe:callback=>client.auth.onAuthStateChange(callback),
  };
}
