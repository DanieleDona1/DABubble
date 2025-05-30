import { FieldValue } from '@angular/fire/firestore';

export interface DirectMessage {
  id: string; // Eindeutige ID der Konversation (Firestore Document ID)
  participantIds: [string, string]; // Array mit genau zwei UIDs der Teilnehmer (Referenz zu UserProfile.uid)
  content: string;
  timestamp?: FieldValue; // Optional: Zeitstempel der letzten Nachricht für Sortierungen in der UI
  parentMessageId?: string;
}
