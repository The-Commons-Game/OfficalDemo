// Optional cloud services. The game still works offline/local-only.
(function () {
  const cfg = window.COMMONS_CONFIG || {};
  if (!window.supabase || !cfg.SUPABASE_URL || !cfg.SUPABASE_PUBLISHABLE_KEY) {
    window.commonsAuth = {
      ready: false,
      user: null,
      async signInDiscord(){ throw new Error("Supabase is not configured."); },
      async signOut(){},
      async getUser(){ return null; }
    };
    return;
  }

  const client = window.supabase.createClient(
    cfg.SUPABASE_URL,
    cfg.SUPABASE_PUBLISHABLE_KEY
  );

  window.commonsSupabase = client;
  window.commonsAuth = {
    ready: true,
    user: null,
    async signInDiscord() {
      const { error } = await client.auth.signInWithOAuth({
        provider: "discord",
        options: { redirectTo: window.location.origin + window.location.pathname }
      });
      if (error) throw error;
    },
    async signOut() {
      const { error } = await client.auth.signOut();
      if (error) throw error;
    },
    async getUser() {
      const { data } = await client.auth.getUser();
      return data?.user || null;
    }
  };

  client.auth.onAuthStateChange((_event, session) => {
    window.commonsAuth.user = session?.user || null;
    window.dispatchEvent(new CustomEvent("commons-auth-changed", {
      detail: { user: window.commonsAuth.user }
    }));
  });

  window.commonsAuth.getUser().then(user => {
    window.commonsAuth.user = user;
    window.dispatchEvent(new CustomEvent("commons-auth-changed", { detail: { user } }));
  });
})();
