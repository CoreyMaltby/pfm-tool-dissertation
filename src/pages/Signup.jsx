// Signup Component
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { UserPlus, Mail, Lock, User, UserCheck } from "lucide-react";
import { supabase } from "../lib/supabaseClient";

const uiTheme = {
    input: "w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-accent-main/20 focus:border-accent-main transition-all text-sm shadow-sm",
    primaryAction: "w-full inline-flex items-center justify-center gap-2 px-8 py-4 bg-accent-main text-white font-black rounded-xl shadow-md shadow-accent-main/30 hover:scale-105 transition-transform text-sm",
};

const Signup = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        firstName: "",
        secondName: "",
        email: "",
        password: "",
        confirmPassword: ""
    });

    const handleSignup = async (e) => {
        e.preventDefault();

        // Validate Password
        if (formData.password !== formData.confirmPassword) {
            alert("Passwords do not match.");
            return;
        }

        // Auth Call
        // Ensure these keys are all lowercase with underscores
        const { data, error } = await supabase.auth.signUp({
            email: formData.email,
            password: formData.password,
            options: {
                data: {
                    first_name: formData.firstName,
                    last_name: formData.secondName,
                }
            }
        });

        if (error) {
            alert(error.message);
            setLoading(false);
        } else {
            alert("Signup Successfull!")
            navigate("/login");
        }
    };

    return (
        <main className="w-full bg-background-tertiary min-h-screen flex items-center justify-center py-12 px-6">
            <div className="max-w-lg w-full space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">

                {/* Header Branding */}
                <div className="text-center space-y-2">
                    <h1 className="text-4xl font-black text-white">Create Account</h1>
                </div>

                <div className="bg-background-secondary p-8 md:p-10 rounded-3xl shadow-2xl border border-white/5">
                    <form className="space-y-5" onSubmit={handleSignup}>
                        {/* Name Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-gray-300 text-xs font-semibold uppercase tracking-widest">First Name</label>
                                <div className="relative">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                    <input
                                        type="text"
                                        className={uiTheme.input}
                                        placeholder="First Name"
                                        required
                                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-gray-300 text-xs font-semibold uppercase tracking-widest">Second Name</label>
                                <div className="relative">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                    <input
                                        type="text"
                                        className={uiTheme.input}
                                        placeholder="Second Name"
                                        required
                                        onChange={(e) => setFormData({ ...formData, secondName: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Email */}
                        <div className="space-y-1.5">
                            <label className="text-gray-300 text-xs font-semibold uppercase tracking-widest">Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <input
                                    type="email"
                                    className={uiTheme.input}
                                    placeholder="user@example.com"
                                    required
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div className="space-y-1.5">
                            <label className="text-gray-300 text-xs font-semibold uppercase tracking-widest">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <input
                                    type="password"
                                    className={uiTheme.input}
                                    placeholder="********"
                                    required
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-gray-300 text-xs font-semibold uppercase tracking-widest">Confirm Password</label>
                            <div className="relative">
                                <UserCheck className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <input
                                    type="password"
                                    className={uiTheme.input}
                                    placeholder="********"
                                    required
                                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="pt-4">
                            <button type="submit" className={uiTheme.primaryAction}>
                                <UserPlus size={18} /> Create Account
                            </button>
                        </div>
                    </form>

                    {/* Footer Links */}
                    <div className="mt-8 pt-6 border-t border-gray-700 text-center">
                        <p className="text-gray-400 text-xs">
                            Already have an account?{" "}
                            <Link to="/login" className="text-accent-main font-bold hover:underline">
                                Login here
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </main>
    );
};

export default Signup;