import { inject, Injectable, computed, Signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  Auth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  authState,
  User,
  GoogleAuthProvider,
  signInWithPopup,
  getAdditionalUserInfo,
  sendPasswordResetEmail,
  fetchSignInMethodsForEmail,
  verifyPasswordResetCode,
  confirmPasswordReset,
  UserCredential,
} from '@angular/fire/auth';
import { Observable, from } from 'rxjs';
import { UserProfile } from '../../interfaces/user-profile.interface';
import {
  doc,
  setDoc,
  Firestore,
  serverTimestamp,
} from '@angular/fire/firestore';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private firebaseAuth = inject(Auth);
  private firestore = inject(Firestore);
  private router = inject(Router);
  private googleAuthProvider = new GoogleAuthProvider();

  private authState$: Observable<User | null> = authState(this.firebaseAuth);

  currentUser$ = authState(this.firebaseAuth);

  readonly currentUser: Signal<User | null | undefined> = toSignal(
    this.authState$
  );

  readonly isLoggedIn: Signal<boolean> = computed(() => !!this.currentUser());

  register(
    email: string,
    displayName: string,
    password: string
  ): Observable<void> {
    return from(
      createUserWithEmailAndPassword(this.firebaseAuth, email, password).then(
        async (response) => {
          const uid = response.user.uid;
          await updateProfile(response.user, { displayName: displayName });
          const userData: UserProfile = {
            uid,
            displayName,
            email,
            avatarUrl: '',
            heartbeat: serverTimestamp(),
          };
          return setDoc(doc(this.firestore, 'users', uid), userData);
        }
      )
    );
  }

  login(email: string, password: string): Observable<UserCredential> {
    const promise = signInWithEmailAndPassword(
      this.firebaseAuth,
      email,
      password
    )
      .then((userCredential) => {
        this.router.navigate(['/']);
        return userCredential;
      })
      .catch((error) => {
        console.error(error);
        throw error;
      });
    return from(promise);
  }

  logout(): Observable<void> {
    const promise = signOut(this.firebaseAuth)
      .then(() => {
        this.router.navigate(['/login']);
      })
      .catch((error) => {
        console.error(error);
        throw error;
      });
    return from(promise);
  }

  async googleLogin(): Promise<UserProfile | null> {
    const userCredential = await signInWithPopup(
      this.firebaseAuth,
      this.googleAuthProvider
    );

    const additionalInfo = getAdditionalUserInfo(userCredential);
    if (!additionalInfo?.isNewUser) {
      return null;
    }

    const {
      user: { displayName, uid, email, photoURL },
    } = userCredential;

    const newProfile: UserProfile = {
      displayName: displayName ?? '',
      uid,
      email: email ?? '',
      avatarUrl: photoURL ?? '',
      heartbeat: serverTimestamp(),
    };
    return newProfile;
  }

  resetPassword(email: string): Observable<void> {
    const promise = sendPasswordResetEmail(this.firebaseAuth, email);
    return from(promise);
  }

  async isGoogleProvider(email: string): Promise<boolean> {
    try {
      const methods = await fetchSignInMethodsForEmail(
        this.firebaseAuth,
        email
      );
      return methods.includes('google.com');
    } catch (err) {
      console.error(err);
      return false;
    }
  }

  handleResetPassword(actionCode: string, newPassword: string) {
    verifyPasswordResetCode(this.firebaseAuth, actionCode)
      .then(() => {
        confirmPasswordReset(this.firebaseAuth, actionCode, newPassword);
      })
      .catch((error) => {
        console.error(error);
      });
  }
}
