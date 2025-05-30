import { inject, Injectable } from '@angular/core';
import { Firestore } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root',
})
export class ReactionService {
  private firestore = inject(Firestore);
}
