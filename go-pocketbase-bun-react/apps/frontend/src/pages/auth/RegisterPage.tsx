import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { useAuth } from "../../hooks/useAuth";

export const RegisterPage = () => {
  const navigate = useNavigate();
  const { register, isLoading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== passwordConfirm) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long");
      return;
    }

    try {
      await register(email, password, passwordConfirm);
      navigate("/");
    } catch (error_: unknown) {
      setError(error_ instanceof Error ? error_.message : "Registration failed. Please try again.");
    }
  };

  return (
    <div className="flex justify-center items-center py-12 px-4 min-h-screen bg-gray-50 sm:px-6 lg:px-8">
      <div className="space-y-8 w-full max-w-md">
        <div>
          <h2 className="mt-6 text-3xl font-extrabold text-center text-gray-900">Create a new account</h2>
          <p className="mt-2 text-sm text-center text-gray-600">
            Or{" "}
            <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
              sign in to your existing account
            </Link>
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                className="block relative py-2 px-3 mt-1 w-full placeholder-gray-500 text-gray-900 rounded-md border border-gray-300 appearance-none sm:text-sm focus:z-10 focus:border-indigo-500 focus:ring-indigo-500 focus:outline-none"
                placeholder="Enter your email"
                value={email}
                required
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                className="block relative py-2 px-3 mt-1 w-full placeholder-gray-500 text-gray-900 rounded-md border border-gray-300 appearance-none sm:text-sm focus:z-10 focus:border-indigo-500 focus:ring-indigo-500 focus:outline-none"
                placeholder="Enter your password"
                value={password}
                required
                onChange={(e) => setPassword(e.target.value)}
              />
              <p className="mt-1 text-sm text-gray-500">Must be at least 8 characters long</p>
            </div>
            <div>
              <label htmlFor="password-confirm" className="block text-sm font-medium text-gray-700">
                Confirm Password
              </label>
              <input
                id="password-confirm"
                name="password-confirm"
                type="password"
                autoComplete="new-password"
                className="block relative py-2 px-3 mt-1 w-full placeholder-gray-500 text-gray-900 rounded-md border border-gray-300 appearance-none sm:text-sm focus:z-10 focus:border-indigo-500 focus:ring-indigo-500 focus:outline-none"
                placeholder="Confirm your password"
                value={passwordConfirm}
                required
                onChange={(e) => setPasswordConfirm(e.target.value)}
              />
            </div>
          </div>

          {error && (
            <div className="p-4 bg-red-50 rounded-md">
              <div className="flex">
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">{error}</h3>
                </div>
              </div>
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="flex relative justify-center py-2 px-4 w-full text-sm font-medium text-white bg-indigo-600 rounded-md border border-transparent hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed group"
            >
              {isLoading ? "Creating account..." : "Create account"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

