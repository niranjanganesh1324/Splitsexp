import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login, signup, loginWithGoogle } from '../services/db';

function Landing({ onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      let user;
      if (isLogin) {
        user = await login(email, password);
      } else {
        if (!name.trim()) {
          throw new Error("Full name is required.");
        }
        user = await signup(name.trim(), email, password);
      }
      onLoginSuccess(user);
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      setError(err.message || "Authentication failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    setLoading(true);
    try {
      const user = await loginWithGoogle();
      onLoginSuccess(user);
      navigate('/dashboard');
    } catch (err) {
      console.error("Google auth error:", err);
      // Clean up common cancel error to make it user friendly
      if (err.code === 'auth/popup-closed-by-user') {
        setError("Sign-in popup was closed before completing.");
      } else {
        setError(err.message || "Google Authentication failed.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSignUpClick = () => {
    setIsLogin(false);
    setError('');
  };

  return (
    <main className="max-w-[1280px] mx-auto px-margin-mobile md:px-margin-desktop py-lg w-full flex-1">
      {/* Hero Section + Login Integrated */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-lg items-center mb-xl">
        <div className="lg:col-span-7 space-y-md">
          <div className="inline-flex items-center px-sm py-xs bg-secondary-container text-on-secondary-fixed-variant rounded-full font-label-sm">
            <span className="material-symbols-outlined mr-xs text-[16px]">verified</span>
            Trusted by 2M+ users worldwide
          </div>
          <h1 className="font-headline-xl text-headline-xl md:text-headline-xl leading-tight">
            Stress-free <span className="text-primary">expense splitting</span> for modern harmony.
          </h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant max-w-xl">
            Stop the awkward money talk. Splitexp makes sharing expenses, managing group budgets, and settling debts effortless and transparent.
          </p>
          <div className="flex flex-col sm:flex-row gap-sm pt-md">
            <button onClick={handleSignUpClick} className="bg-primary text-on-primary px-lg py-md rounded-xl font-label-md shadow-lg hover:opacity-90 transition-all">Sign Up Free</button>
          </div>
        </div>
        
        {/* Login Form Card */}
        <div className="lg:col-span-5">
          <div className="bg-surface-container-lowest ambient-shadow p-lg rounded-xl border border-outline-variant border-opacity-30">
            <h2 className="font-headline-md text-headline-md mb-xs text-on-surface">
              {isLogin ? 'Welcome back' : 'Create account'}
            </h2>
            <p className="font-body-sm text-body-sm text-on-surface-variant mb-lg">
              {isLogin ? 'Manage your shared finances with ease.' : 'Get started with Splitexp for free today.'}
            </p>
            
            {error && <div className="text-error mb-sm text-label-sm">{error}</div>}

            <form className="space-y-md" onSubmit={handleLogin}>
              {!isLogin && (
                <div className="space-y-xs">
                  <label className="font-label-md text-label-md text-on-surface-variant">Full Name</label>
                  <input 
                    className="w-full px-md py-sm rounded-lg border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" 
                    placeholder="John Doe" 
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    required
                  />
                </div>
              )}
              <div className="space-y-xs">
                <label className="font-label-md text-label-md text-on-surface-variant">Email Address</label>
                <input 
                  className="w-full px-md py-sm rounded-lg border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" 
                  placeholder="name@company.com" 
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-xs">
                <div className="flex justify-between items-center">
                  <label className="font-label-md text-label-md text-on-surface-variant">Password</label>
                  {isLogin && <a className="text-label-sm text-primary hover:underline" href="#">Forgot?</a>}
                </div>
                <input 
                  className="w-full px-md py-sm rounded-lg border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" 
                  placeholder="••••••••" 
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                />
              </div>
              <div className="flex items-center gap-xs">
                <input className="rounded border-outline-variant text-primary focus:ring-primary" id="remember" type="checkbox"/>
                <label className="text-body-sm text-on-surface-variant" htmlFor="remember">Keep me signed in</label>
              </div>
              <button type="submit" disabled={loading} className="w-full bg-primary text-on-primary py-md rounded-lg font-label-md shadow-sm hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center gap-xs">
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>{isLogin ? 'Signing In...' : 'Signing Up...'}</span>
                  </>
                ) : (
                  isLogin ? 'Sign In' : 'Sign Up'
                )}
              </button>
            </form>
            
            <div className="relative my-lg text-center">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-outline-variant border-opacity-30"></div></div>
              <span className="relative bg-surface-container-lowest px-sm text-label-sm text-on-surface-variant">OR CONTINUE WITH</span>
            </div>
            <div className="grid grid-cols-2 gap-sm mb-md">
              <button 
                type="button"
                onClick={handleGoogleLogin} 
                disabled={loading}
                className="flex items-center justify-center gap-xs border border-outline-variant py-sm rounded-lg hover:bg-surface-container transition-all disabled:opacity-50"
              >
                <img alt="Google" className="w-5 h-5" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBqDujmPF0g6g6TTvxE6UVLO1qwmN2pjKXVry3sdhvknmK6V5U-jLIzFpGakJzPuCz-D4_ftq7PwxW3u719XO0ponw3kQxFctXY_eu76M3Hyz06ipCOcYS6TsTdJqi3YevmhEC7udmi1v6yRQbxmdkpqFaO4M2ACafmHVgFyIDr9My5nLlx_ro7WRTnH4PldXUHDR_JjEtfw05Z_sQ3nMCd7aIVPQj73z1Odpz_DeDE-DIbBQ7YSxZsEDuGVItwRLyDJzkC0EwL7UM"/>
                <span className="font-label-sm">Google</span>
              </button>
              <button className="flex items-center justify-center gap-xs border border-outline-variant py-sm rounded-lg hover:bg-surface-container transition-all">
                <span className="material-symbols-outlined text-on-surface">ios</span>
                <span className="font-label-sm">Apple</span>
              </button>
            </div>
            
            <div className="mt-md text-center pt-xs border-t border-outline-variant/20">
              <button 
                onClick={() => { setIsLogin(!isLogin); setError(''); }}
                className="text-label-sm text-primary hover:underline font-semibold"
              >
                {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Bento Grid: How It Works */}
      <section className="py-xl">
        <div className="text-center mb-lg">
          <h2 className="font-headline-lg text-headline-lg mb-xs">How it works</h2>
          <p className="font-body-md text-body-md text-on-surface-variant max-w-2xl mx-auto">Simplify your financial life in three easy steps. Designed for clarity, built for harmony.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-12 gap-gutter">
          {/* Bento Item 1 */}
          <div className="md:col-span-8 bg-primary-container text-on-primary-container p-lg rounded-xl flex flex-col justify-between overflow-hidden relative min-h-[300px]">
            <div className="relative z-10">
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center mb-md">
                <span className="material-symbols-outlined text-on-primary-container">receipt_long</span>
              </div>
              <h3 className="font-headline-md text-headline-md mb-xs">Snap and Scan Bills</h3>
              <p className="font-body-md text-body-md opacity-80 max-w-sm">Use our advanced OCR to instantly scan physical receipts. Splitexp automatically identifies items and taxes for perfect accuracy.</p>
            </div>
            <img className="absolute -right-20 -bottom-10 w-2/3 h-auto object-contain rotate-[-5deg] rounded-xl opacity-40 md:opacity-100" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBldtyzS9i0W818irxafnxLQY8KeiKY3fNYeg7y3z7yy2GZDbl0LtX5-UaYR_nyJzNlJLfVMZ5BhlVtX4O6WrnSfbf6yhKLATAoQnfb8Sybm6icWqQKxH21EMQBBQrrr3ZvMju1jP6SVUT-I6YQog8d3Gi31BojN3TVmfjIRbORqiaGzUBra1hMoUH3G_Zi6t-AA5FhlQJAKuRL-ACmplQEGNIBArVyZKMmtRs__rg8Cnn0COvvcGfjBCv7SsysL5yEVJCngjld7jQ" alt="Scan Bill" />
          </div>

          {/* Bento Item 2 */}
          <div className="md:col-span-4 bg-surface-container-lowest ambient-shadow p-lg rounded-xl border border-outline-variant border-opacity-30 flex flex-col">
            <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center mb-md">
              <span className="material-symbols-outlined text-secondary">groups</span>
            </div>
            <h3 className="font-headline-md text-headline-md mb-xs">Create Groups</h3>
            <p className="font-body-md text-body-md text-on-surface-variant">Whether it's housemates, a weekend trip, or a dinner date—keep everyone in the loop with dedicated shared spaces.</p>
            <div className="mt-auto pt-lg">
              <div className="flex -space-x-2">
                <div className="w-10 h-10 rounded-full border-2 border-surface-container-lowest bg-surface-container overflow-hidden">
                  <img alt="User 1" src="https://lh3.googleusercontent.com/aida-public/AB6AXuC1zxccveV4IZmglM1RT1C8tvcma_fPNm-HQCCWjTURxb0XQjZLaEB5YGob-OsdM_H2EJXiSNme5FZZUGUy5j-ADObL99V-10SAZEuKAoAP3xPXtM_4wPyIx-gCuw2ZFJlsp4v_I2Oz2UuXd1aI1VAY-T0vOrD7Hp6RXdTLhyg9EKJ_962vQk3CoI0SZCFZABmflXJtApFfCdDbGVKG2h84olVtAA2avzYmI3J9b2sMhVFPwRaaj2vm7YaYHdQyQm9Aequfi_Xo0nw" />
                </div>
                <div className="w-10 h-10 rounded-full border-2 border-surface-container-lowest bg-surface-container overflow-hidden">
                  <img alt="User 2" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAmgZfwLG3Avsib1Ojq5g55xe7htz931F4t_VQDccl_dmDPPiNnMIdnyEMD-2fTUogJQ86I_582jmVATncNk0kFtXhlRTDXpu0bKLjAK8uH8t2B70Wk0t_qlDe9izvFO0O4xXx3J93SxLcACfEdP1GTcqQgVV7iJ8WF-5HIzb1Cq9RB4NHqEbfGxu0agqmg8OuO9qbzJtudD-kDZhZWWWTTMdtch2yp35qKBwRESG7lhPWeiUXMLw3wJd-GvzLjglstpo1_iyYllus" />
                </div>
                <div className="w-10 h-10 rounded-full border-2 border-surface-container-lowest bg-surface-dim flex items-center justify-center text-label-sm font-bold">+5</div>
              </div>
            </div>
          </div>

          {/* Bento Item 3 */}
          <div className="md:col-span-4 bg-surface-container-lowest ambient-shadow p-lg rounded-xl border border-outline-variant border-opacity-30">
            <div className="w-12 h-12 bg-tertiary-fixed text-on-tertiary-fixed rounded-lg flex items-center justify-center mb-md">
              <span className="material-symbols-outlined">account_balance_wallet</span>
            </div>
            <h3 className="font-headline-md text-headline-md mb-xs">One-Tap Settle</h3>
            <p className="font-body-md text-body-md text-on-surface-variant">Connect your favorite payment apps. Settle up with a single tap through integrated payment links and bank transfers.</p>
          </div>

          {/* Bento Item 4 */}
          <div className="md:col-span-8 bg-surface-container-high p-lg rounded-xl border border-outline-variant border-opacity-30 flex items-center overflow-hidden">
            <div className="flex-1">
              <h3 className="font-headline-md text-headline-md mb-xs">Real-time Clarity</h3>
              <p className="font-body-md text-body-md text-on-surface-variant">View beautiful charts of your spending habits and group balances. No more guessing who owes what.</p>
              <div className="mt-md flex gap-sm">
                <div className="px-sm py-xs text-secondary bg-secondary-container rounded-full text-label-sm">Active Monitoring</div>
                <div className="px-sm py-xs text-primary bg-primary-fixed-dim rounded-full text-label-sm">Auto-Reminders</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof Section */}
      <section className="py-xl border-t border-outline-variant border-opacity-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-lg items-center">
          <div>
            <h2 className="font-headline-lg text-headline-lg mb-md">Trusted by roommates and travelers everywhere.</h2>
            <div className="flex items-center gap-md">
              <div className="flex items-center gap-xs">
                <span className="material-symbols-outlined text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                <span className="material-symbols-outlined text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                <span className="material-symbols-outlined text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                <span className="material-symbols-outlined text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                <span className="material-symbols-outlined text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
              </div>
              <span className="font-label-md text-on-surface-variant">4.9/5 from 50k+ reviews</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-md">
            <div className="p-md bg-surface-container-low rounded-xl border border-outline-variant border-opacity-30">
              <p className="font-body-sm text-body-sm italic mb-sm">"Finally, a splitting app that actually looks good and works perfectly."</p>
              <p className="font-label-sm text-on-surface">— Sarah J., Digital Nomad</p>
            </div>
            <div className="p-md bg-surface-container-low rounded-xl border border-outline-variant border-opacity-30">
              <p className="font-body-sm text-body-sm italic mb-sm">"The bill scanning is like magic. Saves us so much time after dinners."</p>
              <p className="font-label-sm text-on-surface">— Mark R., Tech Lead</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

export default Landing;
