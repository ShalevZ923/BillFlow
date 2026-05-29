export type SignupResult = {
  success: boolean;
  error?: string;
};

export async function signupWithEmail(_email: string, _password: string): Promise<SignupResult> {
  // Placeholder: integrate with Supabase Auth
  return { success: true };
}
