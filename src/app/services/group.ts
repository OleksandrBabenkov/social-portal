import { Injectable, inject } from '@angular/core';
import { Firestore, collection, collectionData, addDoc, doc, updateDoc, arrayUnion, arrayRemove } from '@angular/fire/firestore';
import { AuthService } from './auth.service';
import { Group } from '../models/data.models';
import { Observable, firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GroupService {
  firestore = inject(Firestore);
  auth = inject(AuthService);

  getGroups(): Observable<Group[]> {
    const groupsRef = collection(this.firestore, 'groups');
    return collectionData(groupsRef, { idField: 'id' }) as Observable<Group[]>;
  }

  async createGroup(name: string, description: string) {
    const user = await firstValueFrom(this.auth.user$);
    if (!user) return;

    const groupsRef = collection(this.firestore, 'groups');
    await addDoc(groupsRef, {
      name,
      description,
      ownerId: user.uid,
      memberIds: [user.uid] // Owner joins automatically
    });
  }

  async joinGroup(groupId: string) {
    const user = await firstValueFrom(this.auth.user$);
    if (!user) return;
    const groupRef = doc(this.firestore, `groups/${groupId}`);
    await updateDoc(groupRef, { memberIds: arrayUnion(user.uid) });
  }

  async leaveGroup(groupId: string) {
    const user = await firstValueFrom(this.auth.user$);
    if (!user) return;
    const groupRef = doc(this.firestore, `groups/${groupId}`);
    await updateDoc(groupRef, { memberIds: arrayRemove(user.uid) });
  }
}