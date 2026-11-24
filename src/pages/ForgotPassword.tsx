import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/use-auth";

const ForgotPassword = () => {
  const { configured, requestPasswordReset } = useAuth();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await requestPasswordReset(email);
      setSent(true);
    } catch (resetError) {
      setError(resetError instanceof Error ? resetError.message : "Unable to send a password reset email.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-bg">
      <Header />
      <main className="container mx-auto px-4 py-16">
        <Card className="glass-card border-glass-border mx-auto max-w-md">
          <CardHeader>
            <CardTitle className="text-center text-2xl">Reset your password</CardTitle>
          </CardHeader>
          <CardContent>
            {!configured ? (
              <p className="text-sm text-muted-foreground">Connect a Supabase project to reset your password.</p>
            ) : sent ? (
              <p role="status" className="text-sm text-muted-foreground">
                If an account exists for that email, Supabase will send a password reset link. Check your inbox and spam folder.
              </p>
            ) : (
              <form className="space-y-4" onSubmit={handleSubmit}>
                <p className="text-sm text-muted-foreground">
                  Enter your account email and we’ll send a link to choose a new password.
                </p>
                <div className="space-y-2">
                  <Label htmlFor="reset-email">Email</Label>
                  <Input
                    id="reset-email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                  />
                </div>
                {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
                <Button type="submit" className="w-full bg-gradient-primary" disabled={submitting}>
                  {submitting ? "Sending…" : "Send reset link"}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
        <p className="mt-6 text-center text-sm text-muted-foreground">
          <Link to="/login" className="text-primary hover:underline">Back to sign in</Link>
        </p>
      </main>
      <Footer />
    </div>
  );
};

export default ForgotPassword;
