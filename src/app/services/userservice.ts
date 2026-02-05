import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

export interface User {
  id?: number;
  email: string;
  password?: string;
  salt?: string;
  role?: string;
  admin?: boolean;
}

export interface LoginRequest {
  email: string;
  pass: string;
}

export interface RegisterRequest {
  email: string;
  pass: string;
  salt: string;  // Ajout du salt dans la requête
}

export interface SaltResponse {
  salt: string;
}

export interface RegisterResponse {
  id: number;
  email: string;
  salt: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface VerifyCodeRequest {
  email: string;
  code: string;
}

export interface ResetPasswordRequest {
  email: string;
  code: string;
  newPassword: string;
  salt: string;
}

export interface AdminPromoteRequest {
  email: string;
  code: string;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8080';

  // Headers JSON explicites
  private httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json'
    })
  };

  /**
   * Hacher un mot de passe avec SHA-256 + salt
   */
  private async hashPassword(password: string, salt: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(password + salt);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex;
  }

  /**
   * Inscription d'un nouvel utilisateur
   * 
   * FLUX :
   * 1. Frontend : Récupère un nouveau salt du backend
   * 2. Frontend : Hache le mot de passe avec SHA-256(password + salt)
   * 3. Frontend : Envoie { email, pass: hash, salt }
   * 4. Backend : Ajoute le pepper et stocke
   */
  register(email: string, password: string): Observable<RegisterResponse> {
    console.log('🚀 SERVICE register() appelé avec:', { email, password: '***' });
    // Étape 1: Récupérer un nouveau salt du backend
    return this.http.get<SaltResponse>(`${this.apiUrl}/salt`).pipe(
      switchMap(async (saltResponse) => {
        console.log('🔑 Salt reçu:', saltResponse.salt);
        
        // Étape 2: Hacher le mot de passe avec le salt
        const hashedPassword = await this.hashPassword(password, saltResponse.salt);
        console.log('🔒 Hash généré:', hashedPassword);
        
        // Étape 3: Préparer la requête AVEC le salt
        const request: RegisterRequest = {
          email: email,
          pass: hashedPassword,
          salt: saltResponse.salt  // ✅ Envoyer le salt au backend
        };
        
        return request;
      }),
      switchMap((request) => {
        // Étape 4: Envoyer au backend
        console.log('📤 Requête envoyée:', request);
        return this.http.post<RegisterResponse>(`${this.apiUrl}/user`, request, this.httpOptions).pipe(
          map((response) => {
            console.log('✅ Réponse du backend:', response);
            return response;
          })
        );
      })
    );
  }

  /**
   * Connexion d'un utilisateur
   * 
   * FLUX :
   * 1. Frontend : Récupère le salt de l'utilisateur
   * 2. Frontend : Hache le mot de passe avec SHA-256(password + salt)
   * 3. Frontend : Envoie { email, pass: hash }
   * 4. Backend : Ajoute le pepper et compare
   */
  login(email: string, password: string): Observable<User> {
    // Étape 1: Récupérer le salt de cet utilisateur
    return this.http.get<SaltResponse>(`${this.apiUrl}/salt?email=${encodeURIComponent(email)}`).pipe(
      switchMap(async (saltResponse) => {
        console.log('🔑 Salt reçu:', saltResponse.salt);
        
        // Étape 2: Hacher le mot de passe avec le salt
        const hashedPassword = await this.hashPassword(password, saltResponse.salt);
        console.log('🔒 Hash généré:', hashedPassword);
        
        // Étape 3: Préparer la requête
        const request: LoginRequest = {
          email: email,
          pass: hashedPassword
        };
        
        return request;
      }),
      switchMap((request) => {
        // Étape 4: Envoyer au backend
        return this.http.post<User>(`${this.apiUrl}/login`, request, this.httpOptions);
      })
    );
  }

  /**
   * Récupérer tous les utilisateurs
   */
  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/users`);
  }

  /**
   * Récupérer un utilisateur par son ID
   */
  getUserById(id: number): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/user?id=${id}`);
  }

  /**
   * Demander un code de réinitialisation par email
   * 
   * MESSAGE ANTI-ORACLE : Le backend retourne toujours le même message
   * que l'email existe ou non pour éviter l'énumération des utilisateurs
   */
  requestResetCode(email: string): Observable<{ message: string; success: string }> {
    const request: ForgotPasswordRequest = { email };
    return this.http.post<{ message: string; success: string }>(
      `${this.apiUrl}/forgot-password`,
      request,
      this.httpOptions
    );
  }

  /**
   * Vérifier le code A2F avant de réinitialiser le mot de passe (étape optionnelle)
   */
  verifyResetCode(email: string, code: string): Observable<{ valid: boolean }> {
    const request: VerifyCodeRequest = { email, code };
    return this.http.post<{ valid: boolean }>(
      `${this.apiUrl}/verify-reset-code`,
      request,
      this.httpOptions
    );
  }

  /**
   * Réinitialiser le mot de passe avec le code A2F
   * 
   * FLUX :
   * 1. Frontend : Récupère un nouveau salt du backend
   * 2. Frontend : Hache le nouveau mot de passe avec SHA-256(password + salt)
   * 3. Frontend : Envoie { email, code, newPassword: hash, salt }
   * 4. Backend : Vérifie le code et met à jour le mot de passe
   */
  resetPassword(email: string, code: string, newPassword: string): Observable<{ message: string; success: string }> {
    return this.http.get<SaltResponse>(`${this.apiUrl}/salt`).pipe(
      switchMap(async (saltResponse) => {
        console.log('🔑 Nouveau salt reçu:', saltResponse.salt);
        
        // Hacher le nouveau mot de passe avec le salt
        const hashedPassword = await this.hashPassword(newPassword, saltResponse.salt);
        console.log('🔒 Nouveau hash généré:', hashedPassword);
        
        const request: ResetPasswordRequest = {
          email: email,
          code: code,
          newPassword: hashedPassword,
          salt: saltResponse.salt
        };
        
        return request;
      }),
      switchMap((request) => {
        console.log('📤 Requête de reset envoyée');
        return this.http.post<{ message: string; success: string }>(
          `${this.apiUrl}/reset-password`,
          request,
          this.httpOptions
        );
      })
    );
  }

  /**
   * Générer un code pour promouvoir un utilisateur en admin
   * 
   * ADMIN UNIQUEMENT : Ce code est valide pendant 10 minutes
   */
  generateAdminCode(): Observable<{ code: string; message: string; validityMinutes: string }> {
    return this.http.post<{ code: string; message: string; validityMinutes: string }>(
      `${this.apiUrl}/admin/generate-code`,
      {},
      this.httpOptions
    );
  }

  /**
   * Promouvoir un utilisateur en admin avec le code
   * 
   * FLUX :
   * 1. Un admin génère un code via generateAdminCode()
   * 2. L'admin envoie ce code avec l'email de l'utilisateur à promouvoir
   * 3. Le backend vérifie le code et change le rôle de l'utilisateur
   */
  promoteToAdmin(email: string, code: string): Observable<{ message: string; email: string; role: string }> {
    const request: AdminPromoteRequest = { email, code };
    return this.http.post<{ message: string; email: string; role: string }>(
      `${this.apiUrl}/admin/promote`,
      request,
      this.httpOptions
    );
  }
}