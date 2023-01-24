import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument } from '@angular/fire/compat/firestore';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { getStorage, ref, getDownloadURL } from "firebase/storage";
import { Observable } from 'rxjs';
import { ToastController } from '@ionic/angular';
import { AngularFireAuth } from "@angular/fire/compat/auth";
import { map } from 'rxjs/operators';

import { User } from '../entidades/User';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private dbPath = '/users';
  usersRef: AngularFirestoreCollection<User>;
  constructor(private db: AngularFirestore, private authService: AngularFireAuth, private toastController: ToastController,
    public storage: AngularFireStorage) {
    this.usersRef = db.collection(this.dbPath);
  }

  registrarse(user: User): any {
    return new Promise((resolve, reject) => {
      this.authService.createUserWithEmailAndPassword(user.username, user.password).then(datos => {
        resolve(datos)
        localStorage.setItem('UID', datos.user.uid);
        user.id = datos.user.uid
        this.usersRef.add(user);
      },
        error => {
          reject(error)
          this.mostrarMensaje(error)
        })

    })
  }
  login(email: string, password: string) {
    return new Promise((resolve, reject) => {
      this.authService.signInWithEmailAndPassword(email, password)
        .then(datos => {
          resolve(datos),
            localStorage.setItem('UID', datos.user.uid)
        },
          error => reject(error)
        )
    })
  }

  guardarUsuario() {
    this.authService.onAuthStateChanged(user => {
      if (user) {
        console.log("UID de usuario " + user.uid)
      }
    })
  }


  getAll(): AngularFirestoreCollection<User> {
    return this.usersRef;
  }

  getById(id: string): Observable<any> {
    return this.usersRef.doc(id).valueChanges();
  }

  getByUID(uid: string): Observable<any> {
    return this.usersRef.doc(uid).valueChanges();
  }



 

  create(user: User): any {
    return this.usersRef.add(user);
  }

  update(id: string, user: User): Promise<void> {
    return this.usersRef.doc(id).update(user);
  }

  delete(id: string): Promise<void> {
    return this.usersRef.doc(id).delete();
  }
  getAuth() {
    return this.authService.authState.pipe( //esto regresaria el usuario autenticado en caso de haberlo
      map(auth => auth)
    );
  }
  async mostrarMensaje(mensaje: any) {
    const toast = await this.toastController.create({
      position: 'top',
      message: mensaje,
      duration: 3000
    });
    toast.present();
  }
}
