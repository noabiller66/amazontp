import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { UserService } from '../services/userservice';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  activeTab: 'login' | 'register' | 'forgot' | 'admin' = 'login';
  
  // Login
  loginEmail: string = '';
  loginPassword: string = '';
  showLoginPassword: boolean = false;
  
  // Register
  registerEmail: string = '';
  registerPassword: string = '';
  showRegisterPassword: boolean = false;
  
  // Forgot password
  forgotEmail: string = '';
  resetCode: string = '';
  newPassword: string = '';
  showNewPassword: boolean = false;
  showCodeInput: boolean = false;
  
  // Admin
  adminEmail: string = '';
  adminCode: string = '';
  showAdminCodeInput: boolean = false;
  adminGeneratedCode: string = '';
  
  isLoading: boolean = false;
  errorMessage: string = '';
  successMessage: string = '';

  constructor(private router: Router, private userService: UserService, private cdr: ChangeDetectorRef) {}

  switchTab(tab: 'login' | 'register' | 'forgot' | 'admin') {
    this.activeTab = tab;
    this.errorMessage = '';
    this.successMessage = '';
    this.showCodeInput = false;
    this.showAdminCodeInput = false;
  }

  togglePasswordVisibility(field: string) {
    if (field === 'login') {
      this.showLoginPassword = !this.showLoginPassword;
    } else if (field === 'register') {
      this.showRegisterPassword = !this.showRegisterPassword;
    } else if (field === 'new') {
      this.showNewPassword = !this.showNewPassword;
    }
  }

  onLogin() {
    if (!this.loginEmail || !this.loginPassword) {
      this.errorMessage = 'Remplissez tous les champs';
      return;
    }

    if (!this.validateEmail(this.loginEmail)) {
      this.errorMessage = 'Email invalide';
      return;
    }

    if (this.loginPassword.length < 6) {
      this.errorMessage = 'Mot de passe trop court (min 6)';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.userService.login(this.loginEmail, this.loginPassword).subscribe({
      next: (response) => {
        this.isLoading = false;
        // Sauvegarder l'utilisateur dans localStorage
        localStorage.setItem('currentUser', JSON.stringify(response));
        console.log('✅ Utilisateur connecté et sauvegardé:', response);
        
        // Rediriger selon le rôle
        const isAdmin = response.role?.toUpperCase() === 'ADMIN' || response.admin === true;
        if (isAdmin) {
          console.log('👑 Admin détecté, redirection dashboard');
          this.router.navigate(['/admin']);
        } else {
          console.log('👤 User normal, redirection home');
          this.router.navigate(['/home']);
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = 'Email ou mot de passe incorrect';
      }
    });
  }

  onRegister() {
    console.log('📧 Email saisi:', this.registerEmail);
    console.log('🔑 Mot de passe saisi:', this.registerPassword);
    
    if (!this.registerEmail || !this.registerPassword) {
      this.errorMessage = 'Remplissez tous les champs';
      console.log('❌ Champs vides');
      return;
    }

    console.log('🔍 Validation email:', this.validateEmail(this.registerEmail));
    if (!this.validateEmail(this.registerEmail)) {
      this.errorMessage = 'Email invalide';
      console.log('❌ Email invalide');
      return;
    }

    if (this.registerPassword.length < 6) {
      this.errorMessage = 'Mot de passe trop court (min 6)';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    console.log('🚀 Appel du service register...');
    this.userService.register(this.registerEmail, this.registerPassword).subscribe({
      next: (response) => {
        console.log('✅ Inscription réussie:', response);
        this.isLoading = false;
        this.successMessage = 'Compte créé !';
        // Créer un objet user et le sauvegarder
        const user = { id: response.id, email: response.email, role: 'USER' };
        localStorage.setItem('currentUser', JSON.stringify(user));
        setTimeout(() => {
          this.router.navigate(['/home']);
        }, 1000);
      },
      error: (err) => {
        console.error('❌ Erreur inscription:', err);
        this.isLoading = false;
        this.errorMessage = 'Erreur lors de l\'inscription';
      }
    });
  }

  validateEmail(email: string): boolean {
    // Validation simplifiée : juste vérifier qu'il y a un @ avec du texte avant et après
    return /^[^\s@]+@[^\s@]+$/.test(email);
  }

  private getCurrentUserFromStorage(): any {
    const userStr = localStorage.getItem('currentUser');
    if (!userStr) return null;
    return JSON.parse(userStr);
  }

  onForgotPassword() {
    if (!this.showCodeInput) {
      // ÉTAPE 1: Demander un code de réinitialisation
      console.log('🔐 onForgotPassword - demande code');
      if (!this.forgotEmail) {
        this.errorMessage = 'Entrez votre email';
        return;
      }
      if (!this.validateEmail(this.forgotEmail)) {
        this.errorMessage = 'Email invalide';
        return;
      }
      
      this.isLoading = true;
      this.errorMessage = '';
      console.log('📧 Envoi requête code réinitialisation pour:', this.forgotEmail);
      
      // Appeler le backend pour envoyer le code
      this.userService.requestResetCode(this.forgotEmail).subscribe({
        next: (response) => {
          console.log('✅ Réponse backend:', response);
          this.isLoading = false;
          
          // Afficher le code si le backend le renvoie
          if ((response as any).code) {
            console.log('\n🔐🔐🔐 CODE RÉINITIALISATION (BACKEND) 🔐🔐🔐');
            console.log('🔑 CODE:', (response as any).code);
            console.log('📧 Email:', this.forgotEmail);
            console.log('⏱️ Validité:', (response as any).validityMinutes || 15, 'minutes');
            console.log('🔐🔐🔐🔐🔐🔐🔐🔐🔐🔐🔐🔐🔐🔐🔐\n');
          }
          
          // Force l'affichage des champs
          setTimeout(() => {
            this.showCodeInput = true;
            this.successMessage = 'Code envoyé ! Vérifiez la console du navigateur (F12)';
            this.errorMessage = '';
            console.log('👁️ showCodeInput=', this.showCodeInput);
            this.cdr.detectChanges(); // Force la mise à jour de l'interface
          }, 0);
        },
        error: (err) => {
          console.error('❌ Erreur envoi code:', err);
          this.isLoading = false;
          this.errorMessage = 'Erreur lors de l\'envoi du code. Email inexistant ?';
        }
      });
    } else {
      // ÉTAPE 2: Réinitialiser le mot de passe avec le code
      if (!this.resetCode || !this.newPassword) {
        this.errorMessage = 'Remplissez tous les champs';
        return;
      }
      if (this.newPassword.length < 6) {
        this.errorMessage = 'Mot de passe trop court (min 6)';
        return;
      }
      this.isLoading = true;
      this.errorMessage = '';
      console.log('🔄 Appel resetPassword');
      
      this.userService.resetPassword(this.forgotEmail, this.resetCode, this.newPassword).subscribe({
        next: (response) => {
          console.log('✅ Mot de passe réinitialisé:', response);
          this.isLoading = false;
          this.successMessage = 'Mot de passe réinitialisé avec succès !';
          setTimeout(() => {
            this.switchTab('login');
            this.showCodeInput = false;
            this.resetCode = '';
            this.newPassword = '';
            this.forgotEmail = '';
          }, 1500);
        },
        error: (err) => {
          console.error('❌ Erreur resetPassword:', err);
          this.isLoading = false;
          this.errorMessage = 'Code invalide ou expiré';
        }
      });
    }
  }

  onRequestAdmin() {
    console.log('👑 onRequestAdmin appelé');
    
    if (!this.showAdminCodeInput) {
      // ÉTAPE 1: Générer le code via le BACKEND
      if (!this.adminEmail) {
        this.errorMessage = 'Entrez votre email';
        return;
      }
      if (!this.validateEmail(this.adminEmail)) {
        this.errorMessage = 'Email invalide';
        return;
      }
      
      this.isLoading = true;
      console.log('📞 Appel generateAdminCode() backend...');
      
      // Appeler le backend pour générer un code valide
      this.userService.generateAdminCode().subscribe({
        next: (response) => {
          this.isLoading = false;
          this.adminGeneratedCode = response.code;
          this.errorMessage = '';
          this.successMessage = '';
          
          console.log('\n✨✨✨ CODE ADMIN GÉNÉRÉ (BACKEND) ✨✨✨');
          console.log('🔑 CODE:', response.code);
          console.log('📧 Email:', this.adminEmail);
          console.log('⏱️ Validité:', response.validityMinutes, 'minutes');
          console.log('✨✨✨✨✨✨✨✨✨✨✨✨✨✨\n');
          
          // Force l'affichage du champ
          setTimeout(() => {
            this.showAdminCodeInput = true;
            this.successMessage = 'Code généré ! Entrez-le ci-dessous';
            console.log('👁️ showAdminCodeInput=', this.showAdminCodeInput);
            this.cdr.detectChanges(); // Force la mise à jour de l'interface
          }, 0);
        },
        error: (err) => {
          console.error('❌ Erreur generateAdminCode:', err);
          this.isLoading = false;
          this.errorMessage = 'Erreur: backend non accessible';
        }
      });
      
    } else {
      // ÉTAPE 2: Vérifier le code entré
      if (!this.adminCode) {
        this.errorMessage = 'Entrez le code';
        return;
      }
      
      if (this.adminCode === this.adminGeneratedCode) {
        console.log('✅ Code correct ! Appel du service promoteToAdmin...');
        this.isLoading = true;
        this.errorMessage = '';
        
        // Appeler le vrai service backend
        this.userService.promoteToAdmin(this.adminEmail, this.adminCode).subscribe({
          next: (response) => {
            console.log('✅ Admin promotion réussie:', response);
            this.isLoading = false;
            this.successMessage = 'Vous êtes maintenant admin !';
            
            // Mettre à jour le localStorage avec le nouveau rôle
            const user = this.getCurrentUserFromStorage();
            if (user) {
              user.role = 'ADMIN';
              user.admin = true;
              localStorage.setItem('currentUser', JSON.stringify(user));
              console.log('👑 Rôle admin sauvegardé dans localStorage');
            }
            
            setTimeout(() => {
              const isAdmin = user.role === 'ADMIN' || user.admin === true;
              if (isAdmin) {
                this.router.navigate(['/admin']);
              } else {
                this.router.navigate(['/home']);
              }
            }, 1500);
          },
          error: (err) => {
            console.error('❌ Erreur promoteToAdmin:', err);
            this.isLoading = false;
            this.errorMessage = err?.error?.message || 'Erreur backend';
          }
        });
        
      } else {
        console.log('❌ Code incorrect:', this.adminCode, '!==', this.adminGeneratedCode);
        this.errorMessage = 'Code invalide';
      }
    }
  }
}
