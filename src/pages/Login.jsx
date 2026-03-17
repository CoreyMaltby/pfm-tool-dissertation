// Login Component
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { LogIn, Mail, Lock, ArrowRight } from "lucide-react";
import { supabase } from "../lib/supabaseClient";

const uiTheme = {
    input: "w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-accent-main/20 focus:border-accent-main transistion-all text-sm shadow-sm",
    primaryAction: "w-full inline-flex items-center justify-center gap-2 px-8 py-4 bg-accent-main text-white font-black rounded-xl shadow-md shadow-accent-main/30 hover:scale-105 transition-transform text-sm",
};

const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);

        // Auth Call
        const {data, error } = await supabase.auth.signInWithPassword({
            email: email,
            password: password,
        });

        if (error) {
            alert(error.message);
            setLoading(false);
        } else {
            navigate("/dashboard");
        }
    };

    return (
        <main className="w-full bg-background-tertiary min-h-screen flex items-center justify-center py-12 px-6">
            <div className="max-w-md w-full space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                
                <div className="text-center space-y-2">
                    <h1 className="text-4xl font-black text-white">Login</h1>
                    <p className="text-white text-m">Welcome back!</p>
                </div>

                <div className="bg-background-secondary p-8 md:p-10 rounded-3xl shadow-2xl border border-white/5 overflow-hidden">
                    <form className="space-y-6" onSubmit={handleLogin}>
                        <div className="space-y-1.5">
                            <label className="text-gray-300 text-xs font-semibold uppercase tracking-widest" htmlFor="email">Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <input 
                                    type="email" 
                                    id="email" 
                                    value={email} 
                                    onChange={(e) => setEmail(e.target.value)} 
                                    className={uiTheme.input} 
                                    placeholder="user@example.com"
                                    required 
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-gray-300 text-xs font-semibold uppercase tracking-widest" htmlFor="password">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <input 
                                    type="password" 
                                    id="password" 
                                    value={password} 
                                    onChange={(e) => setPassword(e.target.value)} 
                                    className={uiTheme.input} 
                                    placeholder="********"
                                    required 
                                />
                            </div>
                        </div>

                        <div className="pt-2">
                            <button 
                                type="submit" 
                                disabled={loading}
                                className={uiTheme.primaryAction}
                            >
                                {loading ? (
                                    <>
                                        <Loader2 size={18} className="animate-spin" /> Signing in...
                                    </>
                                ) : (
                                    <>
                                        <LogIn size={18} /> Login
                                    </>
                                )}
                            </button>
                        </div>
                    </form>

                    <div className="mt-8 pt-6 border-t border-gray-700 text-center">
                        <p className="text-gray-400 text-xs">
                            Don't have an account?{" "}
                            <Link to="/signup" className="text-accent-main font-bold hover:underline">
                                Sign up here
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </main>
    );
};
export default Login;