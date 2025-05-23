import { FieldValue } from '@angular/fire/firestore';

export interface Channel {
  id: string;
  name: string;
  description?: string | null;
  creatorId: string; // UID des Benutzers, der den Channel erstellt hat (Referenz zu UserProfile.uid)
  memberIds: string[]; // Array der UIDs der Mitglieder des Channels (Referenz zu UserProfile.uid)
  createdAt: FieldValue;
}
