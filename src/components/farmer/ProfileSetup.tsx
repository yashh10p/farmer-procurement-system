import { useState } from "react";
import { useAppStore } from "@/store";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserPlus, ChevronRight, LogIn, Lock, Phone } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTranslation } from "@/lib/translations";

interface ProfileSetupProps {
  onComplete: () => void;
}

export function ProfileSetup({ onComplete }: ProfileSetupProps) {
  const language = useAppStore((state) => state.language);
  const t = useTranslation(language);
  
  const [activeTab, setActiveTab] = useState("login");
  const [errorMsg, setErrorMsg] = useState("");

  // Signup state
  const [name, setName] = useState("");
  const [signupPhone, setSignupPhone] = useState("");
  const [village, setVillage] = useState("");
  const [signupPassword, setSignupPassword] = useState("");

  // Login state
  const [loginPhone, setLoginPhone] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  
  const addFarmer = useAppStore((state) => state.addFarmer);
  const farmers = useAppStore((state) => state.farmers);
  const setActiveFarmerId = useAppStore((state) => state.setActiveFarmerId);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !signupPhone || !village || !signupPassword) return;
    
    // Check if phone already exists
    if (farmers.some(f => f.phone === signupPhone)) {
      setErrorMsg("A profile with this phone number already exists.");
      return;
    }

    const newFarmer = await addFarmer({
      name,
      phone: signupPhone,
      password: signupPassword,
      village,
      landRegistered: true, // Auto-verified for demo
      eligibleQuantity: 0 // Will be overridden in booking flow
    });
    
    setActiveFarmerId(newFarmer.id);
    onComplete();
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    const farmer = farmers.find(f => f.phone === loginPhone);
    if (!farmer) {
      setErrorMsg("No account found with this phone number.");
      return;
    }

    if (farmer.password !== loginPassword) {
      setErrorMsg("Incorrect password.");
      return;
    }

    setActiveFarmerId(farmer.id);
    onComplete();
  };

  return (
    <div className="flex flex-col h-full bg-slate-50">
      <header className="bg-emerald-700 text-white p-6 pb-8 pt-16 shadow-md">
        <h2 className="text-2xl font-bold">{t('profileTitle')}</h2>
        <p className="text-emerald-100 text-sm opacity-90">{t('profileSubtitle')}</p>
      </header>

      <div className="flex-1 p-4 -mt-4 overflow-y-auto pb-24">
        
        <Card className="p-4 rounded-2xl shadow-lg border-0 bg-white/90 backdrop-blur animate-in fade-in slide-in-from-right-4 duration-300">
          <Tabs defaultValue="login" onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6 bg-slate-100 p-1 rounded-xl">
              <TabsTrigger value="login" className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-emerald-700 data-[state=active]:shadow-sm py-2">
                {t('loginTab')}
              </TabsTrigger>
              <TabsTrigger value="signup" className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-emerald-700 data-[state=active]:shadow-sm py-2">
                {t('signupTab')}
              </TabsTrigger>
            </TabsList>
            
            {errorMsg && (
              <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-200">
                {errorMsg}
              </div>
            )}

            <TabsContent value="login" className="mt-0">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <LogIn className="w-8 h-8" />
              </div>
              
              <h3 className="text-xl font-bold text-slate-800 text-center mb-6">{t('welcomeBack')}</h3>
              
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="loginPhone" className="text-slate-600">{t('phone')}</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3.5 h-5 w-5 text-slate-400" />
                    <Input 
                      id="loginPhone" 
                      type="tel"
                      placeholder="e.g. 9876543210" 
                      className="h-12 bg-slate-50 pl-10"
                      value={loginPhone}
                      onChange={(e) => setLoginPhone(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="loginPassword" className="text-slate-600">{t('password')}</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3.5 h-5 w-5 text-slate-400" />
                    <Input 
                      id="loginPassword" 
                      type="password"
                      placeholder="Enter your password" 
                      className="h-12 bg-slate-50 pl-10"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <Button 
                  type="submit"
                  className="w-full mt-8 h-14 text-lg bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-md"
                  disabled={!loginPhone || !loginPassword}
                >
                  {t('loginBtn')} <ChevronRight className="ml-2 w-5 h-5" />
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup" className="mt-0">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <UserPlus className="w-8 h-8" />
              </div>
              
              <h3 className="text-xl font-bold text-slate-800 text-center mb-6">{t('createNewProfile')}</h3>
              
              <form onSubmit={handleSignup} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-slate-600">{t('fullName')}</Label>
                  <Input 
                    id="name" 
                    placeholder="e.g. Ramesh Patil" 
                    className="h-12 bg-slate-50"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="signupPhone" className="text-slate-600">{t('phone')}</Label>
                  <Input 
                    id="signupPhone" 
                    type="tel"
                    placeholder="e.g. 9876543210" 
                    className="h-12 bg-slate-50"
                    value={signupPhone}
                    onChange={(e) => setSignupPhone(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signupPassword" className="text-slate-600">{t('password')}</Label>
                  <Input 
                    id="signupPassword" 
                    type="password"
                    placeholder="Create a password" 
                    className="h-12 bg-slate-50"
                    value={signupPassword}
                    onChange={(e) => setSignupPassword(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="village" className="text-slate-600">{t('village')}</Label>
                  <Input 
                    id="village" 
                    placeholder="e.g. Shirur" 
                    className="h-12 bg-slate-50"
                    value={village}
                    onChange={(e) => setVillage(e.target.value)}
                    required
                  />
                </div>

                <Button 
                  type="submit"
                  className="w-full mt-8 h-14 text-lg bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-md"
                  disabled={!name || !signupPhone || !village || !signupPassword}
                >
                  {t('register')} <ChevronRight className="ml-2 w-5 h-5" />
                </Button>
              </form>
            </TabsContent>

          </Tabs>
        </Card>
      </div>
    </div>
  );
}
