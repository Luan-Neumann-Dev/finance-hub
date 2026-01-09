import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/Card';
import { Wallet, Mail, Lock, User } from 'lucide-react';

export const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  
  // Login state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  
  // Signup state
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirmPassword, setSignupConfirmPassword] = useState('');
  
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      await login(loginEmail, loginPassword);
      navigate('/');
    } catch (error) {
      console.error('Erro ao fazer login:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (signupPassword !== signupConfirmPassword) {
      alert('As senhas não coincidem');
      return;
    }
    
    setIsLoading(true);
    
    try {
      await register(signupEmail, signupPassword, signupName);
      navigate('/');
    } catch (error) {
      console.error('Erro ao criar conta:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8 opacity-0 animate-fade-up">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl gradient-primary mb-4 shadow-primary">
            <Wallet className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Seu Dinheiro Claro</h1>
          <p className="text-muted-foreground mt-1">Gerencie suas finanças com facilidade</p>
        </div>

        <Card className="glass-card border-border/50 opacity-0 animate-fade-up" style={{ animationDelay: '100ms' }}>
          {isLogin ? (
            <form onSubmit={handleLogin}>
              <CardHeader>
                <CardTitle>Bem-vindo de volta!</CardTitle>
                <CardDescription>Entre com suas credenciais para acessar sua conta.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="email"
                      placeholder="seu@email.com"
                      className="pl-10"
                      value={loginEmail}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setLoginEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Senha</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="password"
                      placeholder="••••••••"
                      className="pl-10"
                      value={loginPassword}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setLoginPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex-col gap-4">
                <Button 
                  type="submit" 
                  className="w-full gradient-primary hover:opacity-90" 
                  disabled={isLoading}
                >
                  {isLoading ? 'Entrando...' : 'Entrar'}
                </Button>
                <button
                  type="button"
                  onClick={() => setIsLogin(false)}
                  className="text-sm text-primary hover:underline"
                >
                  Não tem conta? Criar conta
                </button>
              </CardFooter>
            </form>
          ) : (
            <form onSubmit={handleSignup}>
              <CardHeader>
                <CardTitle>Crie sua conta</CardTitle>
                <CardDescription>Preencha os dados abaixo para começar.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Nome completo</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="text"
                      placeholder="João Silva"
                      className="pl-10"
                      value={signupName}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSignupName(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="email"
                      placeholder="seu@email.com"
                      className="pl-10"
                      value={signupEmail}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSignupEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Senha</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="password"
                      placeholder="Mínimo 6 caracteres"
                      className="pl-10"
                      value={signupPassword}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSignupPassword(e.target.value)}
                      minLength={6}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Confirmar senha</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="password"
                      placeholder="••••••••"
                      className="pl-10"
                      value={signupConfirmPassword}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSignupConfirmPassword(e.target.value)}
                      required
                    />
                  </div>
                  {signupPassword && signupConfirmPassword && signupPassword !== signupConfirmPassword && (
                    <p className="text-sm text-destructive">As senhas não coincidem</p>
                  )}
                </div>
              </CardContent>
              <CardFooter className="flex-col gap-4">
                <Button 
                  type="submit" 
                  className="w-full gradient-primary hover:opacity-90" 
                  disabled={isLoading || signupPassword !== signupConfirmPassword}
                >
                  {isLoading ? 'Criando conta...' : 'Criar conta'}
                </Button>
                <button
                  type="button"
                  onClick={() => setIsLogin(true)}
                  className="text-sm text-primary hover:underline"
                >
                  Já tem conta? Entrar
                </button>
              </CardFooter>
            </form>
          )}
        </Card>
      </div>
    </div>
  );
};