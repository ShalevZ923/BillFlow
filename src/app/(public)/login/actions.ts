export type LoginResult = {
  success: boolean;
  error?: string;
};

export async function loginWithEmail(_email: string, _password: string): Promise<LoginResult> {
  // Placeholder: integrate with Supabase Auth
  return { success: true };
}

export async function loginWithGoogle(): Promise<LoginResult> {
  // Placeholder: initiate Supabase Google OAuth
  return { success: true };
}
