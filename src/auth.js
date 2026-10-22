export function createAuth(client){
 const redirect=()=>new URL('./',location.href).href;
 return {
  async ensureGuest(){const result=await client.auth.getSession();if(result.error||result.data.session)return result;return client.auth.signInAnonymously();},
  signUp:(email,password)=>client.auth.signUp({email,password,options:{emailRedirectTo:redirect()}}),
  signIn:(email,password)=>client.auth.signInWithPassword({email,password}),
  signOut:()=>client.auth.signOut(),
  sendRecovery:email=>client.auth.resetPasswordForEmail(email,{redirectTo:redirect()}),
  updatePassword:password=>client.auth.updateUser({password}),
  subscribe:callback=>client.auth.onAuthStateChange(callback),
 };
}
