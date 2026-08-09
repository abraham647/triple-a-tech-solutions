import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Shield, LogIn, UserPlus, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Auth = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();

  // Only same-origin relative paths are honoured as a post-login redirect.
  const rawNext = searchParams.get("next") ?? "";
  const nextPath = rawNext.startsWith("/") && !rawNext.startsWith("//") ? rawNext : "";

  const goNext = (fallback: string) => {
    if (nextPath) {
      window.location.href = nextPath;
      return;
    }
    navigate(fallback);
  };

  const routeAfterLogin = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { goNext("/"); return; }
    if (nextPath) { goNext("/"); return; }
    const { data: roles } = await supabase.from("user_roles").select("role").eq("user_id", user.id);
    if (roles?.some((r: any) => r.role === "admin")) { navigate("/admin"); return; }
    if (roles?.some((r: any) => r.role === "employee")) {
      const { data: emp } = await supabase.from("employees").select("is_active").eq("user_id", user.id).maybeSingle();
      if (emp && emp.is_active) { navigate("/employee"); return; }
      await supabase.auth.signOut();
      toast({
        title: "Account deactivated",
        description: "Your account has been deactivated. Please contact your administrator.",
        variant: "destructive",
      });
      return;
    }
    navigate("/");
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isForgotPassword) {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-password`,
        });
        if (error) throw error;
        toast({
          title: "Reset email sent!",
          description: "Check your inbox for a password reset link.",
        });
        setIsForgotPassword(false);
      } else if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { display_name: displayName },
            emailRedirectTo: `${window.location.origin}${nextPath || "/"}`,
          },
        });
        if (error) throw error;
        toast({
          title: "Account created!",
          description: "You are now logged in.",
        });
        goNext("/");

      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        await routeAfterLogin();
      }
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      const result = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: window.location.origin,
      });
      if (result.error) {
        toast({ title: "Error", description: String(result.error), variant: "destructive" });
        return;
      }
      if (result.redirected) return;
      await routeAfterLogin();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-primary/5 blur-3xl" />

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2.5 mb-4">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Shield className="w-6 h-6 text-primary" />
            </div>
            <span className="font-display font-bold text-2xl">Triple A Tech</span>
          </div>
          <h1 className="text-2xl font-bold font-display mb-2">
            {isForgotPassword ? "Reset Password" : isSignUp ? "Create Account" : "Welcome Back"}
          </h1>
          <p className="text-muted-foreground text-sm">
            {isForgotPassword
              ? "Enter your email to receive a reset link"
              : isSignUp
              ? "Sign up to access our security services"
              : "Sign in to your account"}
          </p>
        </div>

        <div className="bg-card border border-border rounded-xl p-6 glow-card">
          {!isForgotPassword && (
            <Button
              variant="outline"
              className="w-full h-11 rounded-xl mb-4"
              onClick={handleGoogleSignIn}
              disabled={loading}
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Continue with Google
            </Button>
          )}

          {!isForgotPassword && (
            <div className="relative mb-4">
              <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-border" /></div>
              <div className="relative flex justify-center text-xs uppercase"><span className="bg-card px-2 text-muted-foreground">Or continue with email</span></div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && !isForgotPassword && (
              <div className="space-y-2">
                <Label htmlFor="displayName">Full Name</Label>
                <Input id="displayName" placeholder="Your full name" value={displayName} onChange={e => setDisplayName(e.target.value)} required className="h-11 rounded-xl" />
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="your@email.com" value={email} onChange={e => setEmail(e.target.value)} required className="h-11 rounded-xl" />
            </div>
            {!isForgotPassword && (
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required minLength={6} className="h-11 rounded-xl" />
              </div>
            )}
            <Button type="submit" className="w-full h-11 rounded-xl glow-primary" disabled={loading}>
              {loading ? "Please wait..." : isForgotPassword ? "Send Reset Link" : isSignUp ? (
                <><UserPlus className="w-4 h-4 mr-2" /> Sign Up</>
              ) : (
                <><LogIn className="w-4 h-4 mr-2" /> Sign In</>
              )}
            </Button>
          </form>

          <div className="mt-4 text-center space-y-2">
            {!isForgotPassword && !isSignUp && (
              <button onClick={() => setIsForgotPassword(true)} className="text-sm text-muted-foreground hover:text-primary transition-colors block w-full">
                Forgot your password?
              </button>
            )}
            {isForgotPassword ? (
              <button onClick={() => setIsForgotPassword(false)} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Back to sign in
              </button>
            ) : (
              <button onClick={() => setIsSignUp(!isSignUp)} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                {isSignUp ? "Already have an account? Sign in" : "Don't have an account? Sign up"}
              </button>
            )}
          </div>
        </div>

        <div className="text-center mt-4">
          <button onClick={() => navigate("/")} className="text-sm text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1">
            <ArrowLeft className="w-3 h-3" /> Back to home
          </button>
        </div>
      </div>
    </div>
  );
};

export default Auth;
