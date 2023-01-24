import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/compat/firestore';
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

  constructor(private db: AngularFirestore, private authService: AngularFireAuth, private toastController: ToastController,) {
    this.usersRef = db.collection(this.dbPath);
  }

  registrarse(user: User): any {
    return new Promise((resolve, reject) => {
      this.authService.createUserWithEmailAndPassword(user.username, user.password).then(datos => {
        resolve(datos) 
        localStorage.setItem('UID', datos.user.uid);
        user.id=datos.user.uid
        this.usersRef.add(user);
      },
        error => {
          reject(error)
          this.mostrarMensaje(error)})
      
    })
  }


  metodo() {

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

  create(user: User): any {
    return this.usersRef.add(user);
  }

  update(id: string, user: User): Promise<void> {
    return this.usersRef.doc(id).update(user);
  }

  delete(id: string): Promise<void> {
    return this.usersRef.doc(id).delete();
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
